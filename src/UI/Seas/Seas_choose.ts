const { regClass, property } = Laya;

import { I18N } from "../../Data/I18N";
import { ChapterManager } from "../../Data/ChapterManager";
import type { LangKey } from "../../Data/LanguageData";
import { Seas } from "./Seas";

/**
 * 章节编号前后缀的多语言文本（本地常量，不写入 dic_language.json）
 * 键顺序与 LANG_KEYS 一致：cn / tw / en / rb / hg / alb / els
 */
const CHAPTER_PREFIX: Record<LangKey, string> = {
    cn: "第",
    tw: "第",
    en: "Ch.",
    rb: "第",
    hg: "제",
    alb: "الفصل",
    els: "Гл.",
};
const CHAPTER_SUFFIX: Record<LangKey, string> = {
    cn: "章",
    tw: "章",
    en: "Chapter",
    rb: "章",
    hg: "장",
    alb: "فصل",
    els: "Глава",
};

/**
 * 海经选择界面（Seas_choose）：
 * - 列表解析 dic_seas 表的 id 列，按 id 渲染：
 *     Chapter_number = 多语言"第" + id + 多语言"章"（如 第1章）；
 *     Chpter_name   = name 字段值对应的多语言文本（如 seas_chapter_1）；
 * - 点击 Close_Seas 关闭该界面。
 */
@regClass()
export class Seas_choose extends Laya.Script {
    // ==================== 组件变量声明 ====================

    /** 背景 */
    @property({ type: Laya.Image })
    public background: Laya.Image = null;

    /** 标题面板（含标题文本） */
    @property({ type: Laya.Panel })
    public Title_Seaschoose_Panel: Laya.Panel = null;
    /** 标题文本 */
    @property({ type: Laya.Label })
    public Title_Seaschoose_Label: Laya.Label = null;

    /** 列表 */
    @property({ type: Laya.List })
    public Seas_List: Laya.List = null;

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
    public Close_Seas: Laya.Image = null;

    /** 海经阅读界面（Seas 预制体，动态加载；关闭时仅隐藏） */
    private _seasPanel: Laya.Sprite = null;

    // ==================== 生命周期 ====================

    onAwake(): void {
        this._bindComponents();
    }

    onStart(): void {
        if (this.Close_Seas) {
            this.Close_Seas.on(Laya.Event.CLICK, this, this._onCloseClick);
        }
        // 列表 cell 点击：打开对应的 Seas 界面
        if (this.Seas_List) {
            // 必须开启 selectEnable，否则点击 cell 不会触发 selectHandler
            this.Seas_List.selectEnable = true;
            this.Seas_List.selectHandler = new Laya.Handler(this, this._onListSelect);
        }
        // 列表数据源：确保章节表已加载后，解析 dic_seas 的 id 列并渲染
        this._initList();
    }

    /** 先确保章节数据加载完成，再刷新列表 */
    private async _initList(): Promise<void> {
        if (!ChapterManager.inst.loaded) {
            await ChapterManager.inst.load();
        }
        this.list_setup();
    }

    /** 列表初始化（默认可不传，自动从 dic_seas 表解析 id 列） */
    list_setup(Items: any[] = null): void {
        if (!this.Seas_List) {
            console.error("Seas_choose: Seas_List 未绑定");
            return;
        }

        // 解析 dic_seas 表的 id 列：每个元素仅持有 id，便于渲染时取多语言文本
        const data = ChapterManager.inst.seas.getAll();
        const listData = data.map((row) => ({ id: row.id }));

        this.Seas_List.renderHandler = new Laya.Handler(this, this.onRenderListItem);
        this.Seas_List.array = Items !== null ? Items : listData;
        this.Seas_List.refresh();
    }

    /** 列表项渲染回调 */
    private onRenderListItem(item: any, index: number): void {
        const box = item as Laya.Box;
        const chapterNumber = box.getChildByName("Chapter_number") as Laya.Label;
        const chapterNamePanel = box.getChildByName("Chpter_name_Panel") as Laya.Panel;
        const chapterName = chapterNamePanel
            ? chapterNamePanel.getChildByName("Chpter_name") as Laya.Label
            : null;

        const data = box.dataSource as { id?: number };
        const id = Number(data && data.id);
        if (!Number.isFinite(id)) {
            console.warn("[Seas_choose] 列表项缺少有效 id:", data, index);
            return;
        }
        if (chapterNumber) {
            // Chapter_number = 多语言"第" + id + 多语言"章"（如 第1章），前后缀取自本地常量
            const prefix = CHAPTER_PREFIX[I18N.inst.lang] ?? CHAPTER_PREFIX.cn; // 第
            const suffix = CHAPTER_SUFFIX[I18N.inst.lang] ?? CHAPTER_SUFFIX.cn; // 章
            chapterNumber.text = `${prefix}${id}${suffix}`;
        }
        if (chapterName) {
            // Chpter_name = name 字段值对应的多语言文本（如 seas_chapter_1）
            const row = ChapterManager.inst.seas.getRow(id);
            chapterName.text = row ? I18N.inst.t(row.name) : "";
        }
    }

    onDestroy(): void {
        if (this.Close_Seas) {
            this.Close_Seas.off(Laya.Event.CLICK, this, this._onCloseClick);
        }
        if (this.Seas_List) {
            this.Seas_List.selectHandler = null;
        }
    }

    // ==================== 组件挂载 ====================

    private _bindComponents(): void {
        if (!this.background) {
            this.background = this.owner.getChildByName("background") as Laya.Image;
        }
        if (!this.Title_Seaschoose_Panel) {
            this.Title_Seaschoose_Panel = this.owner.getChildByName("Title_Seaschoose_Panel") as Laya.Panel;
        }
        if (this.Title_Seaschoose_Panel && !this.Title_Seaschoose_Label) {
            this.Title_Seaschoose_Label = this.Title_Seaschoose_Panel.getChildByName("Title_Seaschoose_Label") as Laya.Label;
        }
        if (!this.Seas_List) {
            this.Seas_List = this.owner.getChildByName("Seas_List") as Laya.List;
        }
        // 列表项模板节点（仅用于声明挂载，交互暂不开发）
        if (this.Seas_List) {
            const item = this.Seas_List.getChildByName("ItemBox") as Laya.Box;
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
        if (!this.Close_Seas) {
            this.Close_Seas = this.owner.getChildByName("Close_Seas") as Laya.Image;
        }
    }

    // ==================== 列表 cell 点击 ====================

    /** 点击列表项（cell）：打开对应的 Seas 阅读界面 */
    private _onListSelect(index: number): void {
        if (index < 0) {
            return;
        }
        // 由列表数据源取出的 id（data 为 {id}）
        const data = this.Seas_List.getItem(index);
        const id = data ? (data as any).id : 1;
        this._openSeas(id);
        // 取消选中，保证关闭 Seas 后再次点击同一 cell 仍能触发
        if (this.Seas_List) {
            this.Seas_List.selectedIndex = -1;
        }
    }

    /** 打开 Seas 界面：已加载则直接显示并切换章节，否则动态加载 prefab 并加入场景 */
    private _openSeas(chapterId: number): void {
        if (this._seasPanel) {
            this._seasPanel.visible = true;
            const script = this._seasPanel.getComponent(Seas) as Seas;
            if (script) {
                script.show(chapterId);
            }
            return;
        }
        const url: string = "prefabs/Seas.lh";
        Laya.loader.load(url, Laya.Handler.create(this, (res: any) => {
            if (!res) {
                console.warn("[Seas_choose] 加载 Seas 失败:", url);
                return;
            }
            const node: Laya.Sprite = res.create();
            if (node) {
                this._seasPanel = node;
                // 加入当前场景（与 Seas_choose 同一层级，确保显示在最上层）
                this.owner.parent && this.owner.parent.addChild(node);
                node.visible = true;
                const script = node.getComponent(Seas) as Seas;
                if (script) {
                    script.show(chapterId);
                }
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
