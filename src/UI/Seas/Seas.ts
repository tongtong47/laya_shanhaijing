const { regClass, property } = Laya;

import { I18N } from "../../Data/I18N";
import { ChapterManager } from "../../Data/ChapterManager";

/**
 * 海经阅读界面（Seas）：
 * - 释义/原著两个页签（Botton_Definition_a / Botton_Original_a）常显；
 *   选中谁的 _m 标记显示，另一个的 _m 隐藏；
 *   同时切换 Definition_Panel / Original_Panel 两个内容容器。
 * - Original_Info_Label 直接显示海经表 Original_info（原著文本）；
 *   Definition_Info_Label 显示 definition_info 键值索引的多语言文本。
 */
@regClass()
export class Seas extends Laya.Script {
    // ==================== 组件变量声明 ====================

    /** 背景 */
    @property({ type: Laya.Image })
    public background: Laya.Image = null;

    /** 标题文本 */
    @property({ type: Laya.Label })
    public Seas_Label: Laya.Label = null;

    /** 释义页签按钮 */
    @property({ type: Laya.Image })
    public Botton_Definition_a: Laya.Image = null;
    /** 原著页签按钮 */
    @property({ type: Laya.Image })
    public Botton_Original_a: Laya.Image = null;
    /** 释义页签选中标记 */
    @property({ type: Laya.Image })
    private Botton_Definition_m: Laya.Image = null;
    /** 原著页签选中标记 */
    @property({ type: Laya.Image })
    public Botton_Original_m: Laya.Image = null;
    /** 释义内容容器 */
    @property({ type: Laya.Panel })
    public Definition_Panel: Laya.Panel = null;
    /** 原著内容容器 */
    @property({ type: Laya.Panel })
    public Original_Panel: Laya.Panel = null;
    /** 释义文本 */
    @property({ type: Laya.Label })
    public Definition_Info_Label: Laya.Label = null;
    /** 原著文本 */
    @property({ type: Laya.Label })
    public Original_Info_Label: Laya.Label = null;

    /** 关闭按钮 */
    @property({ type: Laya.Image })
    public Close_Seas: Laya.Image = null;

    // ==================== 内部状态 ====================

    /** 当前章节 id（由外部 show(chapterId) 设置，默认 1） */
    private _currentChapterId: number = 1;
    /** 当前页签：definition(释义) / original(原著)，默认释义 */
    private _currentTab: "definition" | "original" = "definition";

    // ==================== 生命周期 ====================

    onAwake(): void {
        this._bindComponents();
    }

    onStart(): void {
        if (this.Close_Seas) {
            this.Close_Seas.on(Laya.Event.CLICK, this, this._onCloseClick);
        }
        // 页签按钮点击事件（两按钮常显，仅切换高亮与内容面板）
        if (this.Botton_Definition_a) {
            this.Botton_Definition_a.on(Laya.Event.CLICK, this, () => this.setTab("definition"));
        }
        if (this.Botton_Original_a) {
            this.Botton_Original_a.on(Laya.Event.CLICK, this, () => this.setTab("original"));
        }
        // 初次进入默认显示释义页签
        this.setTab(this._currentTab);
    }

    /**
     * 外部打开本界面并指定章节（可选）；同时刷新内容。
     */
    public show(chapterId?: number): void {
        if (typeof chapterId === "number") {
            this._currentChapterId = chapterId;
        }
        this.setTab(this._currentTab);
    }

    /**
     * 切换页签：选中态 _m 标记互斥显示，并切换对应内容面板。
     */
    public setTab(tab: "definition" | "original"): void {
        this._currentTab = tab;

        const isDefinition = tab === "definition";

        // 选中态标记互斥：选中者 _m 显示，另一者隐藏
        if (this.Botton_Definition_m) this.Botton_Definition_m.visible = isDefinition;
        if (this.Botton_Original_m) this.Botton_Original_m.visible = !isDefinition;

        // 内容面板互斥显示
        if (this.Definition_Panel) this.Definition_Panel.visible = isDefinition;
        if (this.Original_Panel) this.Original_Panel.visible = !isDefinition;

        this._refreshContent();
    }

    /** 根据当前章节与页签刷新文本框内容 */
    private _refreshContent(): void {
        const row = ChapterManager.inst.seas.getRow(this._currentChapterId);
        if (!row) {
            if (this.Definition_Info_Label) this.Definition_Info_Label.text = "";
            if (this.Original_Info_Label) this.Original_Info_Label.text = "";
            return;
        }

        // 释义：definition_info 为键值，索引多语言文本
        if (this.Definition_Info_Label) {
            this.Definition_Info_Label.text = I18N.inst.t(row.definition_info);
        }
        // 原著：直接显示 Original_info 字段原始文本
        if (this.Original_Info_Label) {
            this.Original_Info_Label.text = row.Original_info || "";
        }
    }

    onDestroy(): void {
        if (this.Close_Seas) {
            this.Close_Seas.off(Laya.Event.CLICK, this, this._onCloseClick);
        }
        if (this.Botton_Definition_a) {
            this.Botton_Definition_a.off(Laya.Event.CLICK, this, null);
        }
        if (this.Botton_Original_a) {
            this.Botton_Original_a.off(Laya.Event.CLICK, this, null);
        }
    }

    // ==================== 组件挂载 ====================

    private _bindComponents(): void {
        if (!this.background) {
            this.background = this.owner.getChildByName("background") as Laya.Image;
        }
        if (!this.Seas_Label) {
            this.Seas_Label = this.owner.getChildByName("Seas_Label") as Laya.Label;
        }
        if (!this.Botton_Definition_a) {
            this.Botton_Definition_a = this.owner.getChildByName("Botton_Definition_a") as Laya.Image;
        }
        if (!this.Botton_Original_a) {
            this.Botton_Original_a = this.owner.getChildByName("Botton_Original_a") as Laya.Image;
        }
        if (!this.Botton_Definition_m) {
            this.Botton_Definition_m = this.owner.getChildByName("Botton_Definition_m") as Laya.Image;
        }
        if (!this.Botton_Original_m) {
            this.Botton_Original_m = this.owner.getChildByName("Botton_Original_m") as Laya.Image;
        }
        if (!this.Definition_Panel) {
            this.Definition_Panel = this.owner.getChildByName("Definition_Panel") as Laya.Panel;
        }
        if (!this.Original_Panel) {
            this.Original_Panel = this.owner.getChildByName("Original_Panel") as Laya.Panel;
        }
        if (this.Definition_Panel && !this.Definition_Info_Label) {
            this.Definition_Info_Label = this.Definition_Panel.getChildByName("Definition_Info_Label") as Laya.Label;
        }
        if (this.Original_Panel && !this.Original_Info_Label) {
            this.Original_Info_Label = this.Original_Panel.getChildByName("Original_Info_Label") as Laya.Label;
        }
        if (!this.Close_Seas) {
            this.Close_Seas = this.owner.getChildByName("Close_Seas") as Laya.Image;
        }
    }

    // ==================== 关闭界面 ====================

    private _onCloseClick(): void {
        const owner = this.owner as Laya.Sprite;
        if (owner) {
            owner.visible = false;
        }
    }
}
