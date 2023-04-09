from modules import script_callbacks, shared

def on_ui_settings():
    shared.opts.add_option("eps_enable_save_raw_prompt_to_pnginfo", shared.OptionInfo(False, "元プロンプトを pngninfo に保存する", section=("easy_prompt_selector", "EasyPromptSelector")))
    shared.opts.add_option("eps_use_old_template_feature", shared.OptionInfo(False, "古いランダム機能の実装を使用する（sdweb-eagle-pnginfo との互換性のため）", section=("easy_prompt_selector", "EasyPromptSelector")))

script_callbacks.on_ui_settings(on_ui_settings)
