const { regClass, property } = Laya;

import { I18N } from "../Data/I18N";

/**
 * 世界场景：
 * - 四个页签（主页/山经/海经/神话），点击切换选中状态；
 * - 选中页签：标记层(_m)隐藏、label 文本变 f1e81d 且无描边；
 *   未选中页签：标记层(_m)显示、label 恢复预制体原样；
 * - Botton_<Name>_a 永久可见，Botton_<Name>_m 随选中状态切换 visible；
 * - Bigmap 支持在边界内自由拖动。
 */
@regClass()
export class Scene_World extends Laya.Script {
    // ==================== 组件变量声明 ====================

    /** 背景层（含 Bigmap 容器 ControlBox） */
    @property({ type: Laya.Sprite })
    public background: Laya.Sprite = null;

    /** 地图容器 */
    @property({ type: Laya.Box })
    public ControlBox: Laya.Box = null;

    /** 可自由拖动的地图 */
    @property({ type: Laya.Image })
    public Bigmap: Laya.Image = null;

    /** 主页页签：选中态（永久可见） */
    @property({ type: Laya.Image })
    public Botton_Home_a: Laya.Image = null;
    /** 主页页签：标记层（选中时隐藏） */
    @property({ type: Laya.Image })
    public Botton_Home_m: Laya.Image = null;
    /** 主页页签：文本 */
    @property({ type: Laya.Label })
    public Botton_Home_Label: Laya.Label = null;

    /** 山经页签：选中态（永久可见） */
    @property({ type: Laya.Image })
    public Botton_Mountains_a: Laya.Image = null;
    /** 山经页签：标记层（选中时隐藏） */
    @property({ type: Laya.Image })
    public Botton_Mountains_m: Laya.Image = null;
    /** 山经页签：文本 */
    @property({ type: Laya.Label })
    public Botton_Mountains_Label: Laya.Label = null;

    /** 海经页签：选中态（永久可见） */
    @property({ type: Laya.Image })
    public Botton_Seas_a: Laya.Image = null;
    /** 海经页签：标记层（选中时隐藏） */
    @property({ type: Laya.Image })
    public Botton_Seas_m: Laya.Image = null;
    /** 海经页签：文本 */
    @property({ type: Laya.Label })
    public Botton_Seas_Label: Laya.Label = null;

    /** 神话页签：选中态（永久可见） */
    @property({ type: Laya.Image })
    public Botton_Myth_a: Laya.Image = null;
    /** 神话页签：标记层（选中时隐藏） */
    @property({ type: Laya.Image })
    public Botton_Myth_m: Laya.Image = null;
    /** 神话页签：文本 */
    @property({ type: Laya.Label })
    public Botton_myth_Label: Laya.Label = null;

    /** 山经选择界面（已拖入 Scene_World 场景，默认隐藏，点击山经页签显示） */
    @property({ type: Laya.Sprite })
    public Mountains_choose: Laya.Sprite = null;

    // ==================== 私有状态 ====================

    /** 四个页签的描述，统一驱动切换与样式 */
    private _tabs: Array<{
        a: Laya.Image;
        m: Laya.Image;
        label: Laya.Label;
        langId: string;       // 对应多语言词条 id
        labelColor: string;   // 预制体原始颜色（恢复用）
        labelStroke: number;  // 预制体原始描边宽度（恢复用）
        strokeColor: string;  // 预制体原始描边颜色（恢复用）
    }> = [];

    /** 当前选中的页签索引（0=主页,1=山经,2=海经,3=神话） */
    private _currentTab: number = 0;

    /** Bigmap 拖动相关 */
    private _dragging: boolean = false;
    private _lastPointer: Laya.Point = new Laya.Point();
    private _mapStart: Laya.Point = new Laya.Point();

    // ==================== 生命周期 ====================

    onAwake(): void {
        this._bindComponents();
    }

    onStart(): void {
        this._buildTabs();
        this._selectTab(this._currentTab);
        this._bindTabClicks();
        this._enableBigmapDrag();

        // 山经选择界面默认隐藏，待点击山经页签时显示
        if (this.Mountains_choose) {
            this.Mountains_choose.visible = false;
        }

        // 注册语言变更监听，切换语言时页签文本自动刷新
        I18N.inst.onLangChanged(this, this._onLangChanged);
    }

    onDestroy(): void {
        I18N.inst.offLangChanged(this, this._onLangChanged);
        this._unbindTabClicks();
        this._disableBigmapDrag();
    }

    /** 语言切换：仅刷新各页签 label 文本，不动选中状态与样式 */
    private _onLangChanged(): void {
        this._tabs.forEach((tab, i) => {
            if (tab.label && tab.langId) {
                tab.label.text = I18N.inst.t(tab.langId);
            }
        });
    }

    // ==================== 组件挂载 ====================

    private _bindComponents(): void {
        if (!this.background) {
            this.background = this.owner.getChildByName("background") as Laya.Sprite;
        }
        if (this.background) {
            if (!this.ControlBox) {
                this.ControlBox = this.background.getChildByName("ControlBox") as Laya.Box;
            }
            if (this.ControlBox && !this.Bigmap) {
                this.Bigmap = this.ControlBox.getChildByName("Bigmap") as Laya.Image;
            }
        }
        this.Botton_Home_a = this._bind("Botton_Home_a", this.Botton_Home_a);
        this.Botton_Home_m = this._bind("Botton_Home_m", this.Botton_Home_m);
        this.Botton_Home_Label = this._bind("Botton_Home_Label", this.Botton_Home_Label);
        this.Botton_Mountains_a = this._bind("Botton_Mountains_a", this.Botton_Mountains_a);
        this.Botton_Mountains_m = this._bind("Botton_Mountains_m", this.Botton_Mountains_m);
        this.Botton_Mountains_Label = this._bind("Botton_Mountains_Label", this.Botton_Mountains_Label);
        this.Botton_Seas_a = this._bind("Botton_Seas_a", this.Botton_Seas_a);
        this.Botton_Seas_m = this._bind("Botton_Seas_m", this.Botton_Seas_m);
        this.Botton_Seas_Label = this._bind("Botton_Seas_Label", this.Botton_Seas_Label);
        this.Botton_Myth_a = this._bind("Botton_Myth_a", this.Botton_Myth_a);
        this.Botton_Myth_m = this._bind("Botton_Myth_m", this.Botton_Myth_m);
        this.Botton_myth_Label = this._bind("Botton_myth_Label", this.Botton_myth_Label);
        // 山经选择界面节点（已拖入场景；兜底按名称查找）
        if (!this.Mountains_choose) {
            this.Mountains_choose = this.owner.getChildByName("Mountains_choose") as unknown as Laya.Sprite;
        }
    }

    /** 兜底：若脚本字段为空，按名称从场景查找 */
    private _bind<T extends Laya.Node>(name: string, field: T): T {
        if (field) {
            return field;
        }
        const node = this.owner.getChildByName(name) as unknown as T;
        return node || field;
    }

    // ==================== 页签初始化 ====================

    /** 收集四个页签，并记录各自 label 的预制体原样颜色/描边（恢复用） */
    private _buildTabs(): void {
        this._tabs = [
            this._makeTab(this.Botton_Home_a, this.Botton_Home_m, this.Botton_Home_Label, "tab_home"),
            this._makeTab(this.Botton_Mountains_a, this.Botton_Mountains_m, this.Botton_Mountains_Label, "tab_mountains"),
            this._makeTab(this.Botton_Seas_a, this.Botton_Seas_m, this.Botton_Seas_Label, "tab_seas"),
            this._makeTab(this.Botton_Myth_a, this.Botton_Myth_m, this.Botton_myth_Label, "tab_myth"),
        ];
    }

    private _makeTab(a: Laya.Image, m: Laya.Image, label: Laya.Label, langId: string) {
        return {
            a,
            m,
            label,
            langId,
            labelColor: label ? label.color : "#FFFFFF",
            labelStroke: label ? label.stroke : 0,
            strokeColor: label ? label.strokeColor : "#000000",
        };
    }

    // ==================== 页签点击切换 ====================

    private _bindTabClicks(): void {
        this._tabs.forEach((tab, idx) => {
            if (tab.a) {
                tab.a.on(Laya.Event.CLICK, this, () => this._onTabClick(idx));
            }
        });
    }

    private _unbindTabClicks(): void {
        this._tabs.forEach((tab) => {
            if (tab.a) {
                tab.a.off(Laya.Event.CLICK, this, null);
            }
        });
    }

    private _onTabClick(idx: number): void {
        // 山经页签（idx=1）：无论是否已选中，都重新打开/显示 Mountains_choose 界面
        if (idx === 1) {
            this._openMountainsChoose();
        }
        // 若点击的是当前已选中页签，仅重新打开界面即可，无需重复切换选中态
        if (idx === this._currentTab) {
            return;
        }
        this._selectTab(idx);
    }

    /**
     * 打开山经选择界面（Mountains_choose 预制体，已拖入 Scene_World 场景）。
     * 直接通过场景内的节点引用实例化；若场景未保留该实例则按 prefab 资源创建。
     */
    private _openMountainsChoose(): void {
        // 优先使用场景中已挂载的 Mountains_choose 节点（声明在下方字段）
        if (this.Mountains_choose) {
            this.Mountains_choose.visible = true;
            return;
        }
        // 兜底：按 prefab 资源动态创建
        const url: string = "prefabs/Mountains_choose.lh";
        Laya.loader.load(url, Laya.Handler.create(this, (res: any) => {
            if (!res) {
                console.warn("[Scene_World] 加载 Mountains_choose 失败:", url);
                return;
            }
            const node: Laya.Node = res.create();
            if (node) {
                this.owner.addChild(node);
            }
        }), null, Laya.Loader.HIERARCHY);
    }

    /**
     * 切换选中页签：
     * - 选中的页签：_m 隐藏（visible=false），_a 永久可见；label 颜色 f1e81d、描边取消；
     * - 未选中的页签：_m 显示（visible=true），label 恢复预制体原样。
     */
    private _selectTab(idx: number): void {
        this._currentTab = idx;
        this._tabs.forEach((tab, i) => {
            const selected = i === idx;
            // a 层永久可见
            if (tab.a) {
                tab.a.visible = true;
            }
            // m 层：选中时显示，未选中时隐藏
            if (tab.m) {
                tab.m.visible = selected;
            }
            // label 样式切换 + 多语言文本
            if (tab.label) {
                // 从语言系统取文本（任意语言下都刷新）
                if (tab.langId) {
                    tab.label.text = I18N.inst.t(tab.langId);
                }
                if (selected) {
                    tab.label.color = "#f1e81d";
                    tab.label.stroke = 10;
                    tab.label.strokeColor = "#FFFFFF";
                } else {
                    tab.label.color = tab.labelColor;
                    tab.label.stroke = tab.labelStroke;
                    tab.label.strokeColor = tab.strokeColor;
                }
            }
        });
    }

    // ==================== Bigmap 自由拖动 ====================

    /**
     * 开启 Bigmap 拖动，限制在父容器（ControlBox）的可视范围内，
     * 不论 Bigmap 实际尺寸多大，拖动到边缘即停止。
     */
    private _enableBigmapDrag(): void {
        if (!this.Bigmap || !this.ControlBox) {
            return;
        }
        this.Bigmap.on(Laya.Event.MOUSE_DOWN, this, this._onMapDown);
        this.Bigmap.on(Laya.Event.MOUSE_MOVE, this, this._onMapMove);
        this.Bigmap.on(Laya.Event.MOUSE_UP, this, this._onMapUp);
        this.Bigmap.on(Laya.Event.MOUSE_OUT, this, this._onMapUp);
    }

    private _disableBigmapDrag(): void {
        if (!this.Bigmap) {
            return;
        }
        this.Bigmap.off(Laya.Event.MOUSE_DOWN, this, this._onMapDown);
        this.Bigmap.off(Laya.Event.MOUSE_MOVE, this, this._onMapMove);
        this.Bigmap.off(Laya.Event.MOUSE_UP, this, this._onMapUp);
        this.Bigmap.off(Laya.Event.MOUSE_OUT, this, this._onMapUp);
    }

    private _onMapDown(e: Laya.Event): void {
        this._dragging = true;
        this._lastPointer.setTo(e.stageX, e.stageY);
        this._mapStart.setTo(this.Bigmap.x, this.Bigmap.y);
    }

    private _onMapMove(e: Laya.Event): void {
        if (!this._dragging || !this.Bigmap || !this.ControlBox) {
            return;
        }
        const dx = e.stageX - this._lastPointer.x;
        const dy = e.stageY - this._lastPointer.y;
        let nx = this._mapStart.x + dx;
        let ny = this._mapStart.y + dy;

        // 限制边界：地图不能被拖出父容器可视区域
        const minX = Math.min(0, this.ControlBox.width - this.Bigmap.width);
        const minY = Math.min(0, this.ControlBox.height - this.Bigmap.height);
        const maxX = 0;
        const maxY = 0;
        nx = Math.max(minX, Math.min(maxX, nx));
        ny = Math.max(minY, Math.min(maxY, ny));

        this.Bigmap.pos(nx, ny);
    }

    private _onMapUp(): void {
        this._dragging = false;
    }
}
