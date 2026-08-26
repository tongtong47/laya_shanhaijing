const { regClass, property } = Laya;

import { I18N } from "../../Data/I18N";
import { ChapterManager } from "../../Data/ChapterManager";
import type { LangKey } from "../../Data/LanguageData";
import { Myths } from "./Myths";

const CHAPTER_PREFIX: Record<LangKey, string> = { cn: "第", tw: "第", en: "Ch.", rb: "第", hg: "제", alb: "الفصل", els: "Гл." };
const CHAPTER_SUFFIX: Record<LangKey, string> = { cn: "章", tw: "章", en: "", rb: "章", hg: "장", alb: "", els: "" };

/** 神话章节选择界面。 */
@regClass()
export class Myths_choose extends Laya.Script {
    @property({ type: Laya.Image }) 
    public background: Laya.Image = null;
    @property({ type: Laya.Panel }) 
    public Title_Mythschoose_Panel: Laya.Panel = null;
    @property({ type: Laya.Label }) 
    public Title_Mythschoose_Label: Laya.Label = null;
    @property({ type: Laya.List }) 
    public Myths_List: Laya.List = null;
    @property({ type: Laya.Box }) 
    public ItemBox: Laya.Box = null;
    @property({ type: Laya.Image }) 
    public Itembg: Laya.Image = null;
    @property({ type: Laya.Image }) 
    public Icon: Laya.Image = null;
    @property({ type: Laya.Label }) 
    public Chapter_number: Laya.Label = null;
    @property({ type: Laya.Panel }) 
    public Chpter_name_Panel: Laya.Panel = null;
    @property({ type: Laya.Label }) 
    public Chpter_name: Laya.Label = null;
    @property({ type: Laya.Image }) 
    public Lock: Laya.Image = null;
    @property({ type: Laya.Image }) 
    public Close_Myths: Laya.Image = null;

    private _mythsPanel: Laya.Sprite = null;

    onAwake(): void { this._bindComponents(); }

    onStart(): void {
        if (this.Close_Myths) this.Close_Myths.on(Laya.Event.CLICK, this, this._onCloseClick);
        if (this.Myths_List) {
            this.Myths_List.selectEnable = true;
            this.Myths_List.selectHandler = new Laya.Handler(this, this._onListSelect);
        }
        I18N.inst.onLangChanged(this, this._onLangChanged);
        this._initList();
    }

    private async _initList(): Promise<void> {
        if (!ChapterManager.inst.loaded) await ChapterManager.inst.load();
        this.list_setup();
    }

    public list_setup(items: any[] = null): void {
        if (!this.Myths_List) {
            console.error("Myths_choose: Myths_List 未绑定");
            return;
        }
        const data = ChapterManager.inst.myths.getAll().map((row) => ({ id: row.id }));
        this.Myths_List.renderHandler = new Laya.Handler(this, this._renderItem);
        this.Myths_List.array = items !== null ? items : data;
        this.Myths_List.refresh();
    }

    private _renderItem(item: Laya.Box, index: number): void {
        const rowData = item.dataSource as { id?: number };
        const id = Number(rowData && rowData.id);
        if (!Number.isFinite(id)) {
            console.warn("[Myths_choose] 列表项缺少有效 id:", rowData, index);
            return;
        }
        const numberLabel = item.getChildByName("Chapter_number") as Laya.Label;
        const namePanel = item.getChildByName("Chpter_name_Panel") as Laya.Panel;
        const nameLabel = namePanel && namePanel.getChildByName("Chpter_name") as Laya.Label;
        const lock = item.getChildByName("Lock") as Laya.Image;
        const row = ChapterManager.inst.myths.getRow(id);
        const prefix = CHAPTER_PREFIX[I18N.inst.lang] ?? CHAPTER_PREFIX.cn;
        const suffix = CHAPTER_SUFFIX[I18N.inst.lang] ?? CHAPTER_SUFFIX.cn;
        if (numberLabel) numberLabel.text = `${prefix}${id}${suffix}`;
        if (nameLabel) nameLabel.text = row ? I18N.inst.t(row.name) : "";
        if (lock) lock.visible = !ChapterManager.inst.myths.isUnlocked(id);
    }

    private _onLangChanged(): void { if (this.Myths_List) this.Myths_List.refresh(); }

    private _onListSelect(index: number): void {
        if (index < 0 || !this.Myths_List) return;
        const data = this.Myths_List.getItem(index) as { id?: number };
        const id = Number(data && data.id);
        this.Myths_List.selectedIndex = -1;
        if (!Number.isFinite(id) || !ChapterManager.inst.myths.isUnlocked(id)) return;
        this._openMyths(id);
    }

    private _openMyths(chapterId: number): void {
        const existing = this._mythsPanel || this.owner.parent?.getChildByName("Myths") as Laya.Sprite;
        if (existing) {
            this._mythsPanel = existing;
            existing.visible = true;
            const script = existing.getComponent(Myths) as Myths;
            if (script) script.show(chapterId);
            return;
        }
        const url = "prefabs/Myths.lh";
        Laya.loader.load(url, Laya.Handler.create(this, (res: any) => {
            if (!res) {
                console.warn("[Myths_choose] 加载 Myths 失败:", url);
                return;
            }
            const node = res.create() as Laya.Sprite;
            this._mythsPanel = node;
            if (this.owner.parent) this.owner.parent.addChild(node);
            node.visible = true;
            const script = node.getComponent(Myths) as Myths;
            if (script) script.show(chapterId);
        }), null, Laya.Loader.HIERARCHY);
    }

    private _bindComponents(): void {
        this.background ||= this.owner.getChildByName("background") as Laya.Image;
        this.Title_Mythschoose_Panel ||= this.owner.getChildByName("Title_Mythschoose_Panel") as Laya.Panel;
        if (this.Title_Mythschoose_Panel) this.Title_Mythschoose_Label ||= this.Title_Mythschoose_Panel.getChildByName("Title_Mythschoose_Label") as Laya.Label;
        this.Myths_List ||= this.owner.getChildByName("Myths_List") as Laya.List;
        this.Close_Myths ||= this.owner.getChildByName("Close_Myths") as Laya.Image;
    }

    private _onCloseClick(): void { (this.owner as Laya.Sprite).visible = false; }

    onDestroy(): void {
        I18N.inst.offLangChanged(this, this._onLangChanged);
        if (this.Close_Myths) this.Close_Myths.off(Laya.Event.CLICK, this, this._onCloseClick);
        if (this.Myths_List) {
            this.Myths_List.selectHandler = null;
            this.Myths_List.renderHandler = null;
        }
    }
}
