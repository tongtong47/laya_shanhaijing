import { LanguageData, LangKey, LANG_KEYS, LANG_OPTION_NAMES } from "./LanguageData";

/**
 * 多语言管理器（单例）
 * - 维护当前语言（默认简体中文 cn），切换后写入 Laya.LocalStorage 长久记忆；
 * - 注册语言变更监听，界面所有文本自动刷新；
 * - 通过 t(id) 获取当前语言文本。
 */
export class I18N {
    /** 本地存储键：当前语言 */
    public static readonly STORAGE_KEY: string = "game_language";

    private static _inst: I18N = null;

    /** 单例 */
    public static get inst(): I18N {
        if (!I18N._inst) {
            I18N._inst = new I18N();
        }
        return I18N._inst;
    }

    private _data: LanguageData = new LanguageData();
    private _lang: LangKey = "cn";
    /** 语言变更监听列表 */
    private _listeners: Array<{ caller: any; fn: (lang: LangKey) => void }> = [];

    /** 当前语言键 */
    public get lang(): LangKey {
        return this._lang;
    }

    /** 当前语言在 LANG_KEYS 中的索引（对应下拉框 selectedIndex） */
    public get langIndex(): number {
        return LANG_KEYS.indexOf(this._lang);
    }

    /** 载入字典数据（原始 JSON 数组、Laya 加载返回的 TextResource，或已解析的 LanguageData） */
    public init(data: any[] | LanguageData | Laya.TextResource | any): void {
        if (data instanceof LanguageData) {
            this._data = data;
        } else if (data instanceof Laya.TextResource) {
            // Laya.loader.load(url, type = Loader.JSON) 返回 TextResource，实际数组在 .data 中
            this._data.parse(data.data);
        } else {
            this._data.parse(data);
        }
    }

    /** 字典数据访问器 */
    public get data(): LanguageData {
        return this._data;
    }

    /**
     * 读取长久记忆中的语言并应用。
     * 无记忆时默认返回简体中文（cn），对应下拉框索引 0。
     */
    public applySavedLanguage(): LangKey {
        let lang: LangKey = "cn";
        try {
            const saved = Laya.LocalStorage.getItem(I18N.STORAGE_KEY);
            if (saved && (LANG_KEYS as string[]).indexOf(saved) >= 0) {
                lang = saved as LangKey;
            }
        } catch (e) {
            console.error("读取语言记忆失败：", e);
        }
        this.setLang(lang, false);
        return lang;
    }

    /**
     * 切换语言（持久化并通知监听者刷新界面）
     */
    public setLang(lang: LangKey, persist: boolean = true): void {
        if (LANG_KEYS.indexOf(lang) < 0) {
            return;
        }
        if (this._lang === lang) {
            return;
        }
        this._lang = lang;
        if (persist) {
            try {
                Laya.LocalStorage.setItem(I18N.STORAGE_KEY, lang);
            } catch (e) {
                console.error("保存语言记忆失败：", e);
            }
        }
        // 通知所有监听者刷新文本
        for (const l of this._listeners) {
            if (l && l.fn) {
                try {
                    l.fn.call(l.caller, this._lang);
                } catch (e) {
                    console.error("语言变更监听执行失败：", e);
                }
            }
        }
    }

    /** 获取当前语言下词条文本；词条缺失时返回 id 本身 */
    public t(id: string): string {
        const text = this._data.getText(id, this._lang);
        return text !== "" ? text : id;
    }

    /**
     * 注册语言变更监听（界面文本刷新入口）。
     * 语言切换后回调 fn(lang)。
     */
    public onLangChanged(caller: any, fn: (lang: LangKey) => void): void {
        for (const l of this._listeners) {
            if (l.caller === caller && l.fn === fn) {
                return; // 避免重复注册
            }
        }
        this._listeners.push({ caller, fn });
    }

    /** 注销语言变更监听 */
    public offLangChanged(caller: any, fn?: (lang: LangKey) => void): void {
        this._listeners = this._listeners.filter((l) => {
            if (l.caller !== caller) {
                return true;
            }
            return fn ? l.fn !== fn : false;
        });
    }

    /** 语言选择下拉框的选项名称数组（按当前语言显示） */
    public getLangOptionNames(): string[] {
        return LANG_OPTION_NAMES[this._lang];
    }
}
