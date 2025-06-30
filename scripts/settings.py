from modules import script_callbacks, shared

def on_ui_settings():
    section = ("easy_prompt_selector", "EasyPromptSelector")
    shared.opts.add_option("eps_enable_save_raw_prompt_to_pnginfo", shared.OptionInfo(False, "元プロンプトを pngninfo に保存する", section=section))
    shared.opts.add_option("eps_enable_floating_prompts", shared.OptionInfo(True, "プロンプト入力欄のフローティングを有効にする", section=section))

script_callbacks.on_ui_settings(on_ui_settings)
