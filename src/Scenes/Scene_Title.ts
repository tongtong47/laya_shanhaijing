const { regClass, property } = Laya;

import { I18N } from "../Data/I18N";
import { LangKey, LANG_KEYS } from "../Data/LanguageData";

@regClass()
export class Scene_Title extends Laya.Script {
    // ==================== 组件变量声明====================

    /** 背景图 */
    @property({ type: Laya.Image })
    public background: Laya.Image = null;

    /** 开始按钮（文本随语言刷新） */
    @property({ type: Laya.Button })
    public StartButton: Laya.Button = null;

    /** 语言切换下拉框 */
    @property({ type: Laya.ComboBox })
    public langComboBox: Laya.ComboBox = null;

    /** Logo 图片 */
    @property({ type: Laya.Image })
    public Logo: Laya.Image = null;

    // ==================== 私有状态 ====================

    /** 刷新期间置 true，防止 selectHandler 重入 */
    private _updating: boolean = false;
    /** 防止点击 StartButton 时重复跳转场景 */
    private _isEntering: boolean = false;

    // ==================== 生命周期 ====================

    onAwake(): void {
        this._bindComponents();
    }

    onStart(): void {
        this._init();
    }

    onDestroy(): void {
        I18N.inst.offLangChanged(this, this._onLangChanged);
        if (this.StartButton) {
            this.StartButton.off(Laya.Event.CLICK, this, this._onStartButtonClick);
        }
        this._stopButtonBlink();
        // 离开标题场景时停止背景音乐
        Laya.SoundManager.stopMusic();
    }

    // ==================== 组件挂载 ====================

    /**
     * 挂载组件。@property 同名字段由 IDE 自动绑定，这里做兜底，
     * 防止脚本未在 IDE 中重新绑定导致组件为空。
     */
    private _bindComponents(): void {
        if (!this.background) {
            this.background = this.owner.getChildByName("background") as Laya.Image;
        }
        if (!this.StartButton) {
            this.StartButton = this.owner.getChildByName("StartButton") as Laya.Button;
        }
        if (!this.langComboBox) {
            this.langComboBox = this.owner.getChildByName("langComboBox") as Laya.ComboBox;
        }
        if (!this.Logo) {
            this.Logo = this.owner.getChildByName("Logo") as Laya.Image;
        }
    }

    // ==================== 初始化 ====================

    private async _init(): Promise<void> {
        try {
            // 1) 加载语言字典（用 options 形式指定 type = json，直接返回数组对象）
            const dic = await Laya.loader.load("resources/Gameinfo/dic_language.json", { type: "json" });
            console.log("[I18N] 字典加载返回:", typeof dic, dic instanceof Array ? "Array" : (dic && dic.constructor ? dic.constructor.name : "unknown"), dic);
            I18N.inst.init(dic);
            console.log("[I18N] 字典解析条目数:", I18N.inst.data.loaded ? "已加载" : "未加载", "has start_button:", I18N.inst.data.has("start_button"));

            // 2) 绑定语言下拉框（选项默认即 cn 语言下的七个名称，先刷新一次）
            this.langComboBox.labels = I18N.inst.getLangOptionNames().join(",");
            this.langComboBox.selectHandler = Laya.Handler.create(this, this._onComboBoxSelected, null, false);

            // 3) 恢复长久记忆的语言（无记忆默认 0 简体中文），并应用
            this._updating = true;
            const savedLang = I18N.inst.applySavedLanguage();
            this.langComboBox.selectedIndex = I18N.inst.langIndex;
            this._updating = false;

            // 4) 注册语言变更监听，之后切换语言界面文本自动刷新
            I18N.inst.onLangChanged(this, this._onLangChanged);

            // 5) 注册 StartButton 点击事件：进入世界场景
            if (this.StartButton) {
                this.StartButton.on(Laya.Event.CLICK, this, this._onStartButtonClick);
            }

            // 6) 刷新界面全部文本
            this._refreshAllTexts();

            // 7) StartButton 无限循环轻闪烁，提示玩家点击
            this._startButtonBlink();

            // 8) 随机播放一首标题 BGM（无限循环）
            this._playRandomBgm();

            console.log("Scene_Title 初始化完成，当前语言：", savedLang);
        } catch (e) {
            console.error("Scene_Title 初始化失败：", e);
        }
    }

    // ==================== 背景音乐 ====================

    /** 标题场景参与随机的 BGM 列表 */
    private static readonly TITLE_BGMS: string[] = [
        "resources/Bgms/Title_1.mp3",
        "resources/Bgms/Title_2.mp3",
    ];

    /** 从 Title_1 / Title_2 中随机选一首，无限循环播放 */
    private _playRandomBgm(): void {
        const list = Scene_Title.TITLE_BGMS;
        const url = list[Math.floor(Math.random() * list.length)];
        // loops = 0 表示无限循环
        Laya.SoundManager.playMusic(url, 0);
        console.log("[BGM] 标题场景随机播放：", url);
    }

    // ==================== StartButton 闪烁动画 ====================

    /**
     * StartButton 无限循环闪烁（alpha 在 0.15 ~ 1 之间渐隐渐现），提示玩家点击。
     * 在 _init 完成后启动。
     */
    private _startButtonBlink(): void {
        if (!this.StartButton) {
            return;
        }
        this._blinkTo(0.15, 900);
    }

    /** 循环闪烁：从当前 alpha 渐隐/渐现到目标 alpha */
    private _blinkTo(targetAlpha: number, duration: number): void {
        if (!this.StartButton) {
            return;
        }
        Laya.Tween.to(
            this.StartButton,
            { alpha: targetAlpha },
            duration,
            Laya.Ease.sineInOut,
            Laya.Handler.create(this, () => {
                // 渐隐完成后渐现，渐现完成后渐隐，如此无限循环
                if (targetAlpha < 1) {
                    this._blinkTo(1, 900);
                } else {
                    this._blinkTo(0.15, 900);
                }
            }, null, true)
        );
    }

    /** 停止闪烁并恢复按钮不透明度 */
    private _stopButtonBlink(): void {
        if (this.StartButton) {
            Laya.Tween.clearAll(this.StartButton);
            this.StartButton.alpha = 1;
        }
    }

    /** 语言下拉框选择变更：切换到对应语言 */
    private _onComboBoxSelected(index: number): void {
        if (this._updating || index < 0 || index >= LANG_KEYS.length) {
            return;
        }
        const lang: LangKey = LANG_KEYS[index];
        I18N.inst.setLang(lang);
        // setLang 会触发 _onLangChanged 自动刷新界面
    }

    /** 语言变更回调：刷新界面全部文本 */
    private _onLangChanged(): void {
        this._refreshAllTexts();
    }

    /**
     * 刷新界面所有文本：
     * - StartButton 文本
     * - 语言下拉框选项名称（保持当前选中项不变）
     */
    private _refreshAllTexts(): void {
        // StartButton 文本（自动换行，防止长文本如俄语/阿拉伯语超出按钮框）
        if (this.StartButton) {
            this._enableButtonAutoWrap(this.StartButton);
            this.StartButton.label = I18N.inst.t("start_button");
        }
        // 语言下拉框选项名称（多语言）
        if (this.langComboBox) {
            const keepIndex = this.langComboBox.selectedIndex;
            this.langComboBox.labels = I18N.inst.getLangOptionNames().join(",");
            this._updating = true;
            this.langComboBox.selectedIndex = keepIndex;
            this._updating = false;
        }
    }

    /**
     * StartButton 点击：停止闪烁与 BGM 后进入世界场景（Scene_World）。
     */
    private _onStartButtonClick(): void {
        if (this._isEntering) {
            return;
        }
        this._isEntering = true;

        // 停止标题页的闪烁提示与背景音乐，防止进入新场景后残留
        this._stopButtonBlink();
        Laya.SoundManager.stopMusic();

        Laya.Scene.open("Scenes/Scene_World.ls");
    }

    /**
     * 让按钮文本在超出按钮宽度时自动换行并居中显示。
     * Button 的内部 label 是 Laya.Label 实例，开启其 wordWrap 即可；
     * 若内部结构有差异，则遍历子节点兜底查找 Label。
     */
    private _enableButtonAutoWrap(btn: Laya.Button): void {
        const anyBtn: any = btn as any;
        let lbl: Laya.Label | null = (anyBtn._label as Laya.Label) || null;
        if (!lbl) {
            for (let i = 0, n = anyBtn.numChildren; i < n; i++) {
                const child = anyBtn.getChildAt(i);
                if (child instanceof Laya.Label) {
                    lbl = child;
                    break;
                }
            }
        }
        if (lbl) {
            lbl.wordWrap = true;
            lbl.width = btn.width;
            lbl.height = btn.height;
            lbl.align = "center";
            lbl.valign = "middle";
        }
    }
}
