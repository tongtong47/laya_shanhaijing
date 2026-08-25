/**
 * 语言表格数据解析类
 * 负责解析 assets/resources/Gameinfo/dic_language.json 的字典表格，
 * 按 "id + 语言列" 提供文本查询。
 */

/** 支持的七种语言键（顺序即语言选择下拉框的选项顺序） */
export type LangKey = "cn" | "tw" | "en" | "rb" | "hg" | "alb" | "els";

/** 语言键列表，索引 0 = 简体中文（默认） */
export const LANG_KEYS: LangKey[] = ["cn", "tw", "en", "rb", "hg", "alb", "els"];

/** 字典表格行：id + 各语言列 */
export interface ILangRow {
    id: string;
    cn?: string;
    tw?: string;
    en?: string;
    rb?: string;
    hg?: string;
    alb?: string;
    els?: string;
    [key: string]: string | undefined;
}

/**
 * 各语言在下拉框中的显示名称（7 种语言 × 7 种界面语言）。
 * 用于语言选择控件自身的多语言展示；
 * 若日后需要在字典中覆盖，可按 id = "lang_option_<语言键>" 添加行。
 */
export const LANG_OPTION_NAMES: Record<LangKey, string[]> = {
    cn: ["简体中文", "繁体中文", "英语", "日语", "韩语", "阿拉伯语", "俄罗斯语"],
    tw: ["簡體中文", "繁體中文", "英語", "日語", "韓語", "阿拉伯語", "俄羅斯語"],
    en: ["Simplified Chinese", "Traditional Chinese", "English", "Japanese", "Korean", "Arabic", "Russian"],
    rb: ["簡体中文", "繁体中文", "英語", "日本語", "韓国語", "アラビア語", "ロシア語"],
    hg: ["중국어(간체)", "중국어(번체)", "영어", "일본어", "한국어", "아랍어", "러시아어"],
    alb: ["الصينية المبسطة", "الصينية التقليدية", "الإنجليزية", "اليابانية", "الكورية", "العربية", "الروسية"],
    els: ["Упрощённый китайский", "Традиционный китайский", "Английский", "Японский", "Корейский", "Арабский", "Русский"]
};

export class LanguageData {
    /** 字典表：id -> 行数据 */
    private _table: Map<string, ILangRow> = new Map();
    /** 是否已成功解析 */
    private _loaded: boolean = false;

    /** 当前是否已加载字典 */
    public get loaded(): boolean {
        return this._loaded;
    }

    /** 清空并重新解析字典表格 */
    public parse(raw: any[] | string): void {
        this._table.clear();
        this._loaded = false;

        // 兼容 Laya 直接返回 JSON 字符串或 TextResource.data 为数组
        let data: any = raw;
        if (typeof raw === "string" && raw.length > 0) {
            try {
                data = JSON.parse(raw);
            } catch (e) {
                console.error("解析语言字典 JSON 失败：", e);
                return;
            }
        }

        if (data && Array.isArray(data)) {
            for (const item of data) {
                if (item && typeof item.id === "string" && item.id.length > 0) {
                    this._table.set(item.id, item as ILangRow);
                }
            }
            this._loaded = this._table.size > 0;
        }
    }

    /** 是否存在指定 id 的词条 */
    public has(id: string): boolean {
        return this._table.has(id);
    }

    /**
     * 取指定词条在指定语言下的文本。
     * 回退规则：目标语言 -> 简体中文(cn) -> 空字符串
     */
    public getText(id: string, lang: LangKey): string {
        const row = this._table.get(id);
        if (!row) {
            return "";
        }
        let text = row[lang];
        if (text !== undefined && text !== "") {
            return text;
        }
        text = row["cn"];
        return text !== undefined ? text : "";
    }

    /** 获取词条的全部行数据（便于调试或扩展） */
    public getRow(id: string): ILangRow | null {
        return this._table.get(id) || null;
    }
}
