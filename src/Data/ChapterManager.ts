import { MountainData } from "./MountainData";
import { SeaData } from "./SeaData";
import { MythData } from "./MythData";

export class ChapterManager {
    private static _inst: ChapterManager = null;

    /** 单例 */
    public static get inst(): ChapterManager {
        if (!ChapterManager._inst) {
            ChapterManager._inst = new ChapterManager();
        }
        return ChapterManager._inst;
    }

    /** 山经解析实例 */
    public readonly mountains: MountainData = new MountainData();
    /** 海经解析实例 */
    public readonly seas: SeaData = new SeaData();
    /** 神话解析实例 */
    public readonly myths: MythData = new MythData();

    /** 是否已加载完成（三表全部尝试过） */
    private _loaded: boolean = false;

    public get loaded(): boolean {
        return this._loaded;
    }

    /**
     * 分别加载并解析三张章节表。
     * 单表失败不阻断其他表。
     */
    public async load(basePath: string = "resources/Gameinfo/"): Promise<void> {
        this._loaded = false;
        const tasks: Array<[string, string, (raw: any) => void]> = [
            ["山经", basePath + "dic_mountains.json", (raw) => this.mountains.parse(raw)],
            ["海经", basePath + "dic_seas.json", (raw) => this.seas.parse(raw)],
            ["神话", basePath + "dic_myths.json", (raw) => this.myths.parse(raw)],
        ];

        for (const [label, url, parser] of tasks) {
            try {
                const raw = await Laya.loader.load(url, { type: "json" });
                // Laya.loader 加载 JSON 资源可能返回 TextResource 对象，需取出 .data 才是实际数组数据
                const data = raw instanceof Laya.TextResource ? (raw as any).data : raw;
                parser(data);
                console.log(
                    `[ChapterManager] 加载${label}表：`,
                    url,
                    this.isLoaded(label as "mountains" | "seas" | "myths") ? "已加载" : "未加载"
                );
            } catch (e) {
                console.error(`[ChapterManager] 加载章节表失败：${label}`, e);
            }
        }

        this._loaded = this.mountains.loaded || this.seas.loaded || this.myths.loaded;
    }

    /** 取某类别是否已加载（便于外部判断） */
    public isLoaded(category: "mountains" | "seas" | "myths"): boolean {
        if (category === "mountains") return this.mountains.loaded;
        if (category === "seas") return this.seas.loaded;
        return this.myths.loaded;
    }
}
