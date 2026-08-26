/** 神话表行数据接口 */
export interface IMythRow {
    /** 章节编号 */
    id: number;
    /** 章节标识名（如 myths_chapter_1） */
    name: string;
    /** 解锁状态：0 = 已解锁，1 = 锁定 */
    lock: number;
    /** 配图资源名，"&" 分隔 */
    img: string;
    /** 现代译文词条标识 */
    definition_info: string;
    /** 原著文本。 */
    Original_info: string;
    [key: string]: any;
}

export class MythData {
    /** 神话表：id -> 行数据 */
    private _table: Map<number, IMythRow> = new Map();
    /** 是否已成功解析 */
    private _loaded: boolean = false;

    /** 当前是否已加载 */
    public get loaded(): boolean {
        return this._loaded;
    }

    /** 清空并重新解析神话表格 */
    public parse(raw: any[] | string): void {
        this._table.clear();
        this._loaded = false;

        // 兼容 Laya 直接返回 JSON 字符串或 TextResource.data 为数组
        let data: any = raw;
        if (typeof raw === "string" && raw.length > 0) {
            try {
                data = JSON.parse(raw);
            } catch (e) {
                console.error("解析神话字典 JSON 失败：", e);
                return;
            }
        }

        if (data && Array.isArray(data)) {
            for (const item of data) {
                // 跳过表头（type 定义行）：其 id 为字符串 "number"
                if (!item || typeof item.id !== "number") {
                    continue;
                }
                // 剔除纯备注字段；Original_info 是阅读页需要展示的正文，必须保留。
                const row: any = {};
                for (const k in item) {
                    if (k.endsWith("_desc")) {
                        continue;
                    }
                    row[k] = item[k];
                }
                row.id = Number(item.id);
                row.lock = Number(item.lock) || 0;
                this._table.set(row.id, row as IMythRow);
            }
            this._loaded = this._table.size > 0;
        }
    }

    /** 表内章节总数 */
    public get count(): number {
        return this._table.size;
    }

    /** 是否存在指定 id 的章节 */
    public has(id: number): boolean {
        return this._table.has(id);
    }

    /** 取指定 id 的章节行（缺失返回 null） */
    public getRow(id: number): IMythRow | null {
        return this._table.get(id) || null;
    }

    /** 取全部章节行（按 id 升序） */
    public getAll(): IMythRow[] {
        return Array.from(this._table.values()).sort((a, b) => a.id - b.id);
    }

    /** 章节是否已解锁（lock === 0） */
    public isUnlocked(id: number): boolean {
        const row = this._table.get(id);
        return !!row && row.lock === 0;
    }

    /**
     * 取章节配图资源名数组（按 "&" 拆分，过滤空串）。
     * 如 "1101&1102&1103" -> ["1101","1102","1103"]
     */
    public getImages(id: number): string[] {
        const row = this._table.get(id);
        if (!row || !row.img) {
            return [];
        }
        return String(row.img).split("&").map((s) => s.trim()).filter((s) => s.length > 0);
    }
}
