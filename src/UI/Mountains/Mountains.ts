const { regClass, property } = Laya;

/**
 * 山经阅读界面（Mountains）：
 * - 声明并挂载所有组件；
 * - 点击 Close_Mountains 关闭该界面；
 * - 其余组件（章节列表、释义/原著页签等）暂不开发交互。
 */
@regClass()
export class Mountains extends Laya.Script {
    // ==================== 组件变量声明 ====================

    /** 背景 */
    @property({ type: Laya.Image })
    public background: Laya.Image = null;

    /** 章节大图列表 */
    @property({ type: Laya.List })
    public Chapter_Image_List: Laya.List = null;
    /** 列表项模板：章节大图 Box */
    @property({ type: Laya.Box })
    public Chapter_Image_Box: Laya.Box = null;
    /** 章节大图 */
    @property({ type: Laya.Image })
    public Chapter_Image: Laya.Image = null;

    /** 标题面板 */
    @property({ type: Laya.Panel })
    public Title_Mountains_Panel: Laya.Panel = null;
    /** 标题文本 */
    @property({ type: Laya.Label })
    public Title_Mountains_Label: Laya.Label = null;

    /** 底部信息背景 */
    @property({ type: Laya.Image })
    public infobg: Laya.Image = null;

    /** 释义按钮：选中态（永久可见） */
    @property({ type: Laya.Image })
    public Botton_Definition_a: Laya.Image = null;
    /** 释义按钮：标记层 */
    @property({ type: Laya.Image })
    public Botton_Definition_m: Laya.Image = null;
    /** 释义按钮文本 */
    @property({ type: Laya.Label })
    public Botton_Definition_Label: Laya.Label = null;

    /** 原著按钮：选中态（永久可见） */
    @property({ type: Laya.Image })
    public Botton_Original_a: Laya.Image = null;
    /** 原著按钮：标记层 */
    @property({ type: Laya.Image })
    public Botton_Original_m: Laya.Image = null;
    /** 原著按钮文本 */
    @property({ type: Laya.Label })
    public Botton_Original_Label: Laya.Label = null;

    /** 释义内容面板 */
    @property({ type: Laya.Panel })
    public Definition_Panel: Laya.Panel = null;
    /** 释义内容文本 */
    @property({ type: Laya.Label })
    public Definition_Info_Label: Laya.Label = null;

    /** 原著内容面板 */
    @property({ type: Laya.Panel })
    public Original_Panel: Laya.Panel = null;
    /** 原著内容文本 */
    @property({ type: Laya.Label })
    public Original_Info_Label: Laya.Label = null;

    /** 关闭按钮 */
    @property({ type: Laya.Image })
    public Close_Mountains: Laya.Image = null;

    // ==================== 生命周期 ====================

    onAwake(): void {
        this._bindComponents();
    }

    onStart(): void {
        if (this.Close_Mountains) {
            this.Close_Mountains.on(Laya.Event.CLICK, this, this._onCloseClick);
        }
    }

    onDestroy(): void {
        if (this.Close_Mountains) {
            this.Close_Mountains.off(Laya.Event.CLICK, this, this._onCloseClick);
        }
    }

    // ==================== 组件挂载 ====================

    private _bindComponents(): void {
        if (!this.background) {
            this.background = this.owner.getChildByName("background") as Laya.Image;
        }
        if (!this.Chapter_Image_List) {
            this.Chapter_Image_List = this.owner.getChildByName("Chapter_Image_List") as Laya.List;
        }
        if (this.Chapter_Image_List) {
            const box = this.Chapter_Image_List.getChildByName("Chapter_Image_Box") as Laya.Box;
            if (box) {
                if (!this.Chapter_Image_Box) this.Chapter_Image_Box = box;
                if (!this.Chapter_Image) this.Chapter_Image = box.getChildByName("Chapter_Image") as Laya.Image;
            }
        }
        if (!this.Title_Mountains_Panel) {
            this.Title_Mountains_Panel = this.owner.getChildByName("Title_Mountains_Panel") as Laya.Panel;
        }
        if (this.Title_Mountains_Panel && !this.Title_Mountains_Label) {
            this.Title_Mountains_Label = this.Title_Mountains_Panel.getChildByName("Title_Mountains_Label") as Laya.Label;
        }
        if (!this.infobg) {
            this.infobg = this.owner.getChildByName("infobg") as Laya.Image;
        }
        if (this.infobg) {
            if (!this.Botton_Definition_a) this.Botton_Definition_a = this.infobg.getChildByName("Botton_Definition_a") as Laya.Image;
            if (this.Botton_Definition_a) {
                if (!this.Botton_Definition_m) this.Botton_Definition_m = this.Botton_Definition_a.getChildByName("Botton_Definition_m") as Laya.Image;
                if (!this.Botton_Definition_Label) this.Botton_Definition_Label = this.Botton_Definition_a.getChildByName("Botton_Definition_Label") as Laya.Label;
            }
            if (!this.Botton_Original_a) this.Botton_Original_a = this.infobg.getChildByName("Botton_Original_a") as Laya.Image;
            if (this.Botton_Original_a) {
                if (!this.Botton_Original_m) this.Botton_Original_m = this.Botton_Original_a.getChildByName("Botton_Original_m") as Laya.Image;
                if (!this.Botton_Original_Label) this.Botton_Original_Label = this.Botton_Original_a.getChildByName("Botton_Original_Label") as Laya.Label;
            }
            if (!this.Definition_Panel) this.Definition_Panel = this.infobg.getChildByName("Definition_Panel") as Laya.Panel;
            if (this.Definition_Panel && !this.Definition_Info_Label) {
                this.Definition_Info_Label = this.Definition_Panel.getChildByName("Definition_Info_Label") as Laya.Label;
            }
            if (!this.Original_Panel) this.Original_Panel = this.infobg.getChildByName("Original_Panel") as Laya.Panel;
            if (this.Original_Panel && !this.Original_Info_Label) {
                this.Original_Info_Label = this.Original_Panel.getChildByName("Original_Info_Label") as Laya.Label;
            }
        }
        if (!this.Close_Mountains) {
            this.Close_Mountains = this.owner.getChildByName("Close_Mountains") as Laya.Image;
        }
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
