const { regClass, property } = Laya;

/**
 * 山经选择界面（Mountains_choose）：
 * - 声明并挂载所有组件；
 * - 点击 Close_Mountains 关闭该界面；
 * - 其余组件（列表、标题等）暂不开发交互。
 */
@regClass()
export class Mountains_choose extends Laya.Script {
    // ==================== 组件变量声明 ====================

    /** 背景 */
    @property({ type: Laya.Image })
    public background: Laya.Image = null;

    /** 标题面板（含标题文本） */
    @property({ type: Laya.Panel })
    public Title_Mountainschoose_Panel: Laya.Panel = null;
    /** 标题文本 */
    @property({ type: Laya.Label })
    public Title_Mountainschoose_Label: Laya.Label = null;

    /** 列表 */
    @property({ type: Laya.List })
    public Mountains_List: Laya.List = null;

    /** 列表项模板：ItemBox */
    @property({ type: Laya.Box })
    public ItemBox: Laya.Box = null;
    /** 列表项背景 */
    @property({ type: Laya.Image })
    public Itembg: Laya.Image = null;
    /** 列表项图标 */
    @property({ type: Laya.Image })
    public Icon: Laya.Image = null;
    /** 列表项章节序号文本 */
    @property({ type: Laya.Label })
    public Chapter_number: Laya.Label = null;
    /** 列表项章名面板 */
    @property({ type: Laya.Panel })
    public Chpter_name_Panel: Laya.Panel = null;
    /** 列表项章名文本 */
    @property({ type: Laya.Label })
    public Chpter_name: Laya.Label = null;
    /** 列表项锁 */
    @property({ type: Laya.Image })
    public Lock: Laya.Image = null;

    /** 关闭按钮 */
    @property({ type: Laya.Image })
    public Close_Mountains: Laya.Image = null;

    /** 山经阅读界面（Mountains 预制体，动态加载；关闭时仅隐藏） */
    private _mountainsPanel: Laya.Sprite = null;

    // ==================== 生命周期 ====================

    onAwake(): void {
        this._bindComponents();
    }

    onStart(): void {
        if (this.Close_Mountains) {
            this.Close_Mountains.on(Laya.Event.CLICK, this, this._onCloseClick);
        }
        // 列表 cell 点击：打开对应的 Mountains 界面
        if (this.Mountains_List) {
            // 必须开启 selectEnable，否则点击 cell 不会触发 selectHandler
            this.Mountains_List.selectEnable = true;
            this.Mountains_List.selectHandler = new Laya.Handler(this, this._onListSelect);
        }
    }

    onDestroy(): void {
        if (this.Close_Mountains) {
            this.Close_Mountains.off(Laya.Event.CLICK, this, this._onCloseClick);
        }
        if (this.Mountains_List) {
            this.Mountains_List.selectHandler = null;
        }
    }

    // ==================== 组件挂载 ====================

    private _bindComponents(): void {
        if (!this.background) {
            this.background = this.owner.getChildByName("background") as Laya.Image;
        }
        if (!this.Title_Mountainschoose_Panel) {
            this.Title_Mountainschoose_Panel = this.owner.getChildByName("Title_Mountainschoose_Panel") as Laya.Panel;
        }
        if (this.Title_Mountainschoose_Panel && !this.Title_Mountainschoose_Label) {
            this.Title_Mountainschoose_Label = this.Title_Mountainschoose_Panel.getChildByName("Title_Mountainschoose_Label") as Laya.Label;
        }
        if (!this.Mountains_List) {
            this.Mountains_List = this.owner.getChildByName("Mountains_List") as Laya.List;
        }
        // 列表项模板节点（仅用于声明挂载，交互暂不开发）
        if (this.Mountains_List) {
            const item = this.Mountains_List.getChildByName("ItemBox") as Laya.Box;
            if (item) {
                if (!this.ItemBox) this.ItemBox = item;
                if (!this.Itembg) this.Itembg = item.getChildByName("Itembg") as Laya.Image;
                if (!this.Icon) this.Icon = item.getChildByName("Icon") as Laya.Image;
                if (!this.Chapter_number) this.Chapter_number = item.getChildByName("Chapter_number") as Laya.Label;
                if (!this.Chpter_name_Panel) this.Chpter_name_Panel = item.getChildByName("Chpter_name_Panel") as Laya.Panel;
                if (this.Chpter_name_Panel && !this.Chpter_name) {
                    this.Chpter_name = this.Chpter_name_Panel.getChildByName("Chpter_name") as Laya.Label;
                }
                if (!this.Lock) this.Lock = item.getChildByName("Lock") as Laya.Image;
            }
        }
        if (!this.Close_Mountains) {
            this.Close_Mountains = this.owner.getChildByName("Close_Mountains") as Laya.Image;
        }
    }

    // ==================== 列表 cell 点击 ====================

    /** 点击列表项（cell）：打开对应的 Mountains 阅读界面（传参暂不支持） */
    private _onListSelect(index: number): void {
        if (index < 0) {
            return;
        }
        this._openMountains();
        // 取消选中，保证关闭 Mountains 后再次点击同一 cell 仍能触发
        if (this.Mountains_List) {
            this.Mountains_List.selectedIndex = -1;
        }
    }

    /** 打开 Mountains 界面：已加载则直接显示，否则动态加载 prefab 并加入场景 */
    private _openMountains(): void {
        if (this._mountainsPanel) {
            this._mountainsPanel.visible = true;
            return;
        }
        const url: string = "prefabs/Mountains.lh";
        Laya.loader.load(url, Laya.Handler.create(this, (res: any) => {
            if (!res) {
                console.warn("[Mountains_choose] 加载 Mountains 失败:", url);
                return;
            }
            const node: Laya.Sprite = res.create();
            if (node) {
                this._mountainsPanel = node;
                // 加入当前场景（与 Mountains_choose 同一层级，确保显示在最上层）
                this.owner.parent && this.owner.parent.addChild(node);
                node.visible = true;
            }
        }), null, Laya.Loader.HIERARCHY);
    }

    // ==================== 关闭界面 ====================

    private _onCloseClick(): void {
        // 仅隐藏界面（不销毁），后续可再次打开
        const owner = this.owner as Laya.Sprite;
        if (owner) {
            owner.visible = false;
        }
    }
}
