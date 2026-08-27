const { regClass, property } = Laya;

import { I18N } from "../Data/I18N";

@regClass()
export class Scene_World extends Laya.Script {

    private static readonly SECTION_BGMS: Record<number, string> = {
        0: "resources/Bgms/Home.mp3",
        1: "resources/Bgms/Mounts.mp3",
        2: "resources/Bgms/Seas.mp3",
        3: "resources/Bgms/Myths.mp3",
    };

    @property({ type: Laya.Sprite })
    public background: Laya.Sprite = null;

    @property({ type: Laya.Box })
    public ControlBox: Laya.Box = null;

    @property({ type: Laya.Image })
    public Bigmap: Laya.Image = null;

    @property({ type: Laya.Image })
    public Botton_Home_a: Laya.Image = null;

    @property({ type: Laya.Image })
    public Botton_Home_m: Laya.Image = null;

    @property({ type: Laya.Label })
    public Botton_Home_Label: Laya.Label = null;

    @property({ type: Laya.Image })
    public Botton_Mountains_a: Laya.Image = null;
    @property({ type: Laya.Image })
    public Botton_Mountains_m: Laya.Image = null;
    @property({ type: Laya.Label })
    public Botton_Mountains_Label: Laya.Label = null;

    @property({ type: Laya.Image })
    public Botton_Seas_a: Laya.Image = null;
    @property({ type: Laya.Image })
    public Botton_Seas_m: Laya.Image = null;
    @property({ type: Laya.Label })
    public Botton_Seas_Label: Laya.Label = null;
    @property({ type: Laya.Image })
    public Botton_Myth_a: Laya.Image = null;
    @property({ type: Laya.Image })
    public Botton_Myth_m: Laya.Image = null;
    @property({ type: Laya.Label })
    public Botton_myth_Label: Laya.Label = null;
    @property({ type: Laya.Sprite })
    public Mountains_choose: Laya.Sprite = null;
    @property({ type: Laya.Sprite })
    public Seas_choose: Laya.Sprite = null;
    @property({ type: Laya.Sprite })
    public Myths_choose: Laya.Sprite = null;

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

    /** 当前章节分类 BGM，避免重复点击同一页签时从头播放。 */
    private _currentBgm: string = "";

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
        this._switchSectionBgm(this._currentTab);
        this._bindTabClicks();
        this._enableBigmapDrag();

        // 山经/海经选择界面默认隐藏，待点击对应页签时显示
        if (this.Mountains_choose) {
            this.Mountains_choose.visible = false;
        }
        if (this.Seas_choose) {
            this.Seas_choose.visible = false;
        }
        if (this.Myths_choose) {
            this.Myths_choose.visible = false;
        }

        // 注册语言变更监听，切换语言时页签文本自动刷新
        I18N.inst.onLangChanged(this, this._onLangChanged);
    }

    onDestroy(): void {
        I18N.inst.offLangChanged(this, this._onLangChanged);
        this._unbindTabClicks();
        this._disableBigmapDrag();
        if (this._currentBgm) {
            Laya.SoundManager.stopMusic();
            this._currentBgm = "";
        }
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
        if (!this.Mountains_choose) {
            this.Mountains_choose = this.owner.getChildByName("Mountains_choose") as unknown as Laya.Sprite;
        }
        if (!this.Seas_choose) {
            this.Seas_choose = this.owner.getChildByName("Seas_choose") as unknown as Laya.Sprite;
        }
        if (!this.Myths_choose) {
            this.Myths_choose = this.owner.getChildByName("Myths_choose") as unknown as Laya.Sprite;
        }
    }
    private _bind<T extends Laya.Node>(name: string, field: T): T {
        if (field) {
            return field;
        }
        const node = this.owner.getChildByName(name) as unknown as T;
        return node || field;
    }
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
        if (this.Mountains_choose) this.Mountains_choose.visible = false;
        if (this.Seas_choose) this.Seas_choose.visible = false;
        if (this.Myths_choose) this.Myths_choose.visible = false;
        if (idx === 1) {
            this._openChoose(this.Mountains_choose, "prefabs/Mountains_choose.lh", null);
        }
        if (idx === 2) {
            this._openChoose(this.Seas_choose, "prefabs/Seas_choose.lh", null);
        }
        if (idx === 3) {
            this._openChoose(this.Myths_choose, "prefabs/Myths_choose.lh", null);
        }
        this._switchSectionBgm(idx);
        if (idx === this._currentTab) {
            return;
        }
        this._selectTab(idx);
    }

    /** 切换分类时替换背景音乐；回到主页时停止分类 BGM。 */
    private _switchSectionBgm(tabIndex: number): void {
        const url = Scene_World.SECTION_BGMS[tabIndex] || "";
        if (!url) {
            if (this._currentBgm) {
                Laya.SoundManager.stopMusic();
                this._currentBgm = "";
            }
            return;
        }
        if (url === this._currentBgm) return;
        this._currentBgm = url;
        Laya.SoundManager.playMusic(url, 0);
        console.log("[BGM] 世界分类切换：", url);
    }

    private _openChoose(target: Laya.Sprite, url: string, another: Laya.Sprite): void {
        if (another) {
            another.visible = false;
        }
        if (target) {
            target.visible = true;
            return;
        }
        Laya.loader.load(url, Laya.Handler.create(this, (res: any) => {
            if (!res) {
                console.warn("[Scene_World] 加载选择界面失败:", url);
                return;
            }
            const node: Laya.Node = res.create();
            if (node) {
                this.owner.addChild(node);
            }
        }), null, Laya.Loader.HIERARCHY);
    }
    private _selectTab(idx: number): void {
        this._currentTab = idx;
        this._tabs.forEach((tab, i) => {
            const selected = i === idx;
            if (tab.a) {
                tab.a.visible = true;
            }
            if (tab.m) {
                tab.m.visible = selected;
            }
            if (tab.label) {
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
