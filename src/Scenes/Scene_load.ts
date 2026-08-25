const { regClass, property } = Laya;

@regClass()
export class Scene_load extends Laya.Script {
    // ==================== 组件变量声明（与场景节点同名，由 Laya IDE 自动挂载）====================

    /** 加载背景图 */
    @property({ type: Laya.Image })
    public object_load_bg: Laya.Image = null;

    /** 进度条容器 */
    @property({ type: Laya.Box })
    public jindutiao_Box: Laya.Box = null;

    /** 进度条组件 */
    @property({ type: Laya.ProgressBar })
    public ProgressBar: Laya.ProgressBar = null;

    /** 进度百分比文本 */
    @property({ type: Laya.Label })
    public percentage_Label: Laya.Label = null;

    /** Logo 图片 */
    @property({ type: Laya.Image })
    public Logo: Laya.Image = null;

    // ==================== 私有状态 ====================

    /** 目标加载进度（0~1），onUpdate 中做平滑滚动 */
    private _progressTarget: number = 0;
    /** 金色粒子层 */
    private _particleLayer: Laya.Sprite = null;
    /** 粒子对象数组 */
    private _particles: Laya.Sprite[] = [];
    /** 粒子数量 */
    private static readonly PARTICLE_COUNT: number = 18;
    /** 粒子颜色（金色系） */
    private static readonly PARTICLE_COLORS: string[] = ["#FFD700", "#FFC107", "#FFE066", "#FFB300", "#FFF3B0", "#FFAA00"];

    // ==================== 生命周期 ====================

    onAwake(): void {
        this._bindComponents();
    }

    onStart(): void {
        // 初始进度 1%
        this._setProgress(0.01);
        // Logo 金色粒子：从底部飞往顶部
        this._initParticles();
        // 开始按类型加载资源
        this._startLoad();
    }

    onUpdate(): void {
        this._smoothProgress();
    }

    onDestroy(): void {
        // 清理粒子动画
        this._stopParticles();
    }

    // ==================== 组件挂载 ====================

    /**
     * 挂载组件。@property 同名字段由 IDE 自动绑定，这里做一次兜底，
     * 防止脚本未在 IDE 中重新绑定导致组件为空。
     */
    private _bindComponents(): void {
        if (!this.object_load_bg) {
            this.object_load_bg = this.owner.getChildByName("object_load_bg") as Laya.Image;
        }
        if (!this.jindutiao_Box) {
            this.jindutiao_Box = this.owner.getChildByName("jindutiao_Box") as Laya.Box;
        }
        if (this.jindutiao_Box) {
            if (!this.ProgressBar) {
                this.ProgressBar = this.jindutiao_Box.getChildByName("ProgressBar") as Laya.ProgressBar;
            }
            if (!this.percentage_Label) {
                this.percentage_Label = this.jindutiao_Box.getChildByName("percentage_Label") as Laya.Label;
            }
        }
        if (!this.Logo) {
            this.Logo = this.owner.getChildByName("Logo") as Laya.Image;
        }
    }

    // ==================== 进度条与文本 ====================

    /** 设置目标进度（0~1），进度条与百分比文本随之更新 */
    private _setProgress(value: number): void {
        this._progressTarget = Math.max(0, Math.min(1, value));
        if (this.ProgressBar) {
            this.ProgressBar.value = this._progressTarget;
        }
        this._syncLabel();
    }

    /** onUpdate 中平滑推进进度条 */
    private _smoothProgress(): void {
        if (!this.ProgressBar) {
            return;
        }
        const cur = this.ProgressBar.value;
        const diff = this._progressTarget - cur;
        if (Math.abs(diff) < 0.002) {
            this.ProgressBar.value = this._progressTarget;
            return;
        }
        // 缓动逼近目标，视觉上更平滑
        this.ProgressBar.value = cur + diff * 0.12;
        this._syncLabel();
    }

    /** 进度条数值同步到百分比文本（1% ~ 100%） */
    private _syncLabel(): void {
        if (this.percentage_Label && this.ProgressBar) {
            const pct = Math.round(this.ProgressBar.value * 100);
            this.percentage_Label.text = pct + "%";
        }
    }

    // ==================== 资源加载 ====================

    /**
     * 主加载流程：图片、视频、JSON 分开加载。
     * 目前资源清单仅包含 Loads 目录下的四张图片，视频与 JSON 暂无，可随时补充。
     */
    private async _startLoad(): Promise<void> {
        try {
            // ---- 图片资源（当前需要加载的四张图）----
            const imgUrls: string[] = [
                "resources/UI/Loads/load_bg.png",
                "resources/UI/Loads/Logo.png",
                "resources/UI/Loads/progress.png",
                "resources/UI/Loads/progress$bar.png",
            ];
            // ---- 视频资源（暂无，留空占位）----
            const videoUrls: string[] = [];
            // ---- JSON 资源（暂无，留空占位）----
            const jsonUrls: string[] = [];

            // 各类型权重，总进度从 1% 到 100% 按权重分配
            const weight = { img: 0.8, video: 0.1, json: 0.1 };
            let base = 0.01; // 从 1% 开始

            // 1) 图片
            const imgs = await this.loadImages(imgUrls, (p: number) => {
                this._setProgress(base + p * weight.img);
            });
            base += weight.img;
            this._setProgress(base);

            // 2) 视频
            const videos = await this.loadVideos(videoUrls, (p: number) => {
                this._setProgress(base + p * weight.video);
            });
            base += weight.video;
            this._setProgress(base);

            // 3) JSON
            const jsons = await this.loadJsons(jsonUrls, (p: number) => {
                this._setProgress(base + p * weight.json);
            });
            this._setProgress(1);

            console.log("资源加载完成", { imgs, videos, jsons });
            // 跳转前停掉 Logo 金色粒子，避免动画残留到标题场景
            this._stopParticles();
            // 加载完成后跳转进入标题场景
            await this._gotoTitleScene();
        } catch (e) {
            console.error("资源加载失败：", e);
        }
    }

    /** 跳转进入标题场景 scene_title */
    private async _gotoTitleScene(): Promise<void> {
        try {
            await Laya.Scene.open("Scenes/Scene_Title.ls");
        } catch (e) {
            console.error("跳转 Scene_Title 失败：", e);
        }
    }

    /**
     * 加载图片资源（返回加载后的资源数组，失败项为 null）
     * @param urls 图片地址数组
     * @param onProgress 单阶段内进度回调（0~1）
     */
    public async loadImages(urls: string[], onProgress?: (progress: number) => void): Promise<any[]> {
        return this._loadByType(urls, Laya.Loader.IMAGE, onProgress);
    }

    /**
     * 加载视频资源
     * @param urls 视频地址数组
     * @param onProgress 单阶段内进度回调（0~1）
     */
    public async loadVideos(urls: string[], onProgress?: (progress: number) => void): Promise<any[]> {
        return this._loadByType(urls, Laya.Loader.VIDEO, onProgress);
    }

    /**
     * 加载 JSON 资源
     * @param urls JSON 地址数组
     * @param onProgress 单阶段内进度回调（0~1）
     */
    public async loadJsons(urls: string[], onProgress?: (progress: number) => void): Promise<any[]> {
        return this._loadByType(urls, Laya.Loader.JSON, onProgress);
    }

    /**
     * 按类型逐个加载资源，每加载完成一个回调一次阶段内进度（0~1）
     */
    private async _loadByType(urls: string[], type: string, onProgress?: (progress: number) => void): Promise<any[]> {
        const results: any[] = [];
        const total = urls.length;
        if (total <= 0) {
            return results;
        }
        let loaded = 0;
        for (const url of urls) {
            try {
                const res = await Laya.loader.load(url, null, null, type);
                results.push(res);
            } catch (e) {
                console.error(`加载资源失败：${url}`, e);
                results.push(null);
            }
            loaded++;
            if (onProgress) {
                onProgress(loaded / total);
            }
        }
        return results;
    }

    // ==================== Logo 金色粒子 ====================

    /** 初始化金色粒子：在 Logo 组件上创建粒子层，粒子从底部飞向顶部 */
    private _initParticles(): void {
        if (!this.Logo) {
            return;
        }
        if (!this._particleLayer) {
            this._particleLayer = new Laya.Sprite();
            this._particleLayer.name = "goldParticleLayer";
            this._particleLayer.mouseEnabled = false;
            this.Logo.addChild(this._particleLayer);
        }
        for (let i = 0; i < Scene_load.PARTICLE_COUNT; i++) {
            const p = new Laya.Sprite();
            const radius = 3 + Math.random() * 8;
            const color = Scene_load.PARTICLE_COLORS[Math.floor(Math.random() * Scene_load.PARTICLE_COLORS.length)];
            p.graphics.drawCircle(0, 0, radius, color);
            this._particleLayer.addChild(p);
            this._particles.push(p);
            // 随机延迟错开起飞时间，形成连续不断的上升效果
            this._flyParticle(p, Math.random() * 1500);
        }
    }

    /** 粒子循环动画：从 Logo 底部飞向组件顶部，完成后循环 */
    private _flyParticle(p: Laya.Sprite, delay: number = 0): void {
        const w = this.Logo.width;
        const h = this.Logo.height;
        // 起点：底部附近，x 随机
        const startX = Math.random() * w;
        const startY = h + Math.random() * 60;
        // 终点：顶部上方，x 轻微左右飘
        const endX = startX + (Math.random() - 0.5) * 160;
        const endY = -20 - Math.random() * 60;

        p.pos(startX, startY);
        p.alpha = 0.5 + Math.random() * 0.5;
        const scale = 0.6 + Math.random() * 0.8;
        p.scale(scale, scale);

        const duration = 1500 + Math.random() * 2000;
        Laya.Tween.to(
            p,
            { x: endX, y: endY, alpha: 0.05 },
            duration,
            Laya.Ease.sineIn,
            Laya.Handler.create(this, () => {
                this._flyParticle(p);
            }, null, true),
            delay
        );
    }

    /** 停掉并移除所有金色粒子（跳转场景前或场景销毁时调用） */
    private _stopParticles(): void {
        if (this._particles && this._particles.length > 0) {
            for (const p of this._particles) {
                Laya.Tween.clearAll(p);
                if (p.parent) {
                    p.removeSelf();
                }
            }
            this._particles.length = 0;
        }
        if (this._particleLayer) {
            Laya.Tween.clearAll(this._particleLayer);
            if (this._particleLayer.parent) {
                this._particleLayer.removeSelf();
            }
            this._particleLayer = null;
        }
    }
}
