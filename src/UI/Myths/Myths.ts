const { regClass, property } = Laya;

import { I18N } from "../../Data/I18N";
import { ChapterManager } from "../../Data/ChapterManager";

/** 神话章节阅读界面。 */
@regClass()
export class Myths extends Laya.Script {
    @property({ type: Laya.Image }) 
    public background: Laya.Image = null;
    @property({ type: Laya.List }) 
    public Chapter_Image_List: Laya.List = null;
    @property({ type: Laya.Box }) 
    public Chapter_Image_Box: Laya.Box = null;
    @property({ type: Laya.Image }) 
    public Chapter_Image: Laya.Image = null;
    @property({ type: Laya.Panel }) 
    public Title_Myths_Panel: Laya.Panel = null;
    @property({ type: Laya.Label }) 
    public Title_Myths_Label: Laya.Label = null;
    @property({ type: Laya.Image }) 
    public infobg: Laya.Image = null;
    @property({ type: Laya.Image }) 
    public Botton_Definition_a: Laya.Image = null;
    @property({ type: Laya.Image }) 
    public Botton_Definition_m: Laya.Image = null;
    @property({ type: Laya.Label }) 
    public Botton_Definition_Label: Laya.Label = null;
    @property({ type: Laya.Image }) 
    public Botton_Original_a: Laya.Image = null;
    @property({ type: Laya.Image }) 
    public Botton_Original_m: Laya.Image = null;
    @property({ type: Laya.Label }) 
    public Botton_Original_Label: Laya.Label = null;
    @property({ type: Laya.Panel }) 
    public Definition_Panel: Laya.Panel = null;
    @property({ type: Laya.Label }) 
    public Definition_Info_Label: Laya.Label = null;
    @property({ type: Laya.Panel }) 
    public Original_Panel: Laya.Panel = null;
    @property({ type: Laya.Label }) 
    public Original_Info_Label: Laya.Label = null;
    @property({ type: Laya.Image }) 
    public Close_Myths: Laya.Image = null;

    private _currentChapterId = 1;
    private _currentTab: "definition" | "original" = "definition";

    onAwake(): void { this._bindComponents(); }

    onStart(): void {
        if (this.Close_Myths) this.Close_Myths.on(Laya.Event.CLICK, this, this._onCloseClick);
        if (this.Botton_Definition_a) this.Botton_Definition_a.on(Laya.Event.CLICK, this, this._showDefinition);
        if (this.Botton_Original_a) this.Botton_Original_a.on(Laya.Event.CLICK, this, this._showOriginal);
        I18N.inst.onLangChanged(this, this._refreshContent);
        this.setTab(this._currentTab);
    }

    public show(chapterId?: number): void {
        if (typeof chapterId === "number") this._currentChapterId = chapterId;
        (this.owner as Laya.Sprite).visible = true;
        this.setTab("definition");
    }

    public setTab(tab: "definition" | "original"): void {
        this._currentTab = tab;
        const definition = tab === "definition";
        if (this.Botton_Definition_m) this.Botton_Definition_m.visible = definition;
        if (this.Botton_Original_m) this.Botton_Original_m.visible = !definition;
        if (this.Definition_Panel) this.Definition_Panel.visible = definition;
        if (this.Original_Panel) this.Original_Panel.visible = !definition;
        this._refreshContent();
    }

    private _showDefinition(): void { this.setTab("definition"); }
    private _showOriginal(): void { this.setTab("original"); }

    private _refreshContent(): void {
        const row = ChapterManager.inst.myths.getRow(this._currentChapterId);
        if (this.Title_Myths_Label) this.Title_Myths_Label.text = row ? I18N.inst.t(row.name) : "";
        if (this.Definition_Info_Label) this.Definition_Info_Label.text = row ? I18N.inst.t(row.definition_info) : "";
        if (this.Original_Info_Label) this.Original_Info_Label.text = row ? row.Original_info || "" : "";
    }

    private _bindComponents(): void {
        this.background ||= this.owner.getChildByName("background") as Laya.Image;
        this.Chapter_Image_List ||= this.owner.getChildByName("Chapter_Image_List") as Laya.List;
        this.Title_Myths_Panel ||= this.owner.getChildByName("Title_Myths_Panel") as Laya.Panel;
        if (this.Title_Myths_Panel) this.Title_Myths_Label ||= this.Title_Myths_Panel.getChildByName("Title_Myths_Label") as Laya.Label;
        this.infobg ||= this.owner.getChildByName("infobg") as Laya.Image;
        if (this.infobg) {
            this.Botton_Definition_a ||= this.infobg.getChildByName("Botton_Definition_a") as Laya.Image;
            this.Botton_Original_a ||= this.infobg.getChildByName("Botton_Original_a") as Laya.Image;
            if (this.Botton_Definition_a) {
                this.Botton_Definition_m ||= this.Botton_Definition_a.getChildByName("Botton_Definition_m") as Laya.Image;
                this.Botton_Definition_Label ||= this.Botton_Definition_a.getChildByName("Botton_Definition_Label") as Laya.Label;
            }
            if (this.Botton_Original_a) {
                this.Botton_Original_m ||= this.Botton_Original_a.getChildByName("Botton_Original_m") as Laya.Image;
                this.Botton_Original_Label ||= this.Botton_Original_a.getChildByName("Botton_Original_Label") as Laya.Label;
            }
            this.Definition_Panel ||= this.infobg.getChildByName("Definition_Panel") as Laya.Panel;
            this.Original_Panel ||= this.infobg.getChildByName("Original_Panel") as Laya.Panel;
            if (this.Definition_Panel) this.Definition_Info_Label ||= this.Definition_Panel.getChildByName("Definition_Info_Label") as Laya.Label;
            if (this.Original_Panel) this.Original_Info_Label ||= this.Original_Panel.getChildByName("Original_Info_Label") as Laya.Label;
        }
        this.Close_Myths ||= this.owner.getChildByName("Close_Myths") as Laya.Image;
    }

    private _onCloseClick(): void { (this.owner as Laya.Sprite).visible = false; }

    onDestroy(): void {
        I18N.inst.offLangChanged(this, this._refreshContent);
        if (this.Close_Myths) this.Close_Myths.off(Laya.Event.CLICK, this, this._onCloseClick);
        if (this.Botton_Definition_a) this.Botton_Definition_a.off(Laya.Event.CLICK, this, this._showDefinition);
        if (this.Botton_Original_a) this.Botton_Original_a.off(Laya.Event.CLICK, this, this._showOriginal);
    }
}
