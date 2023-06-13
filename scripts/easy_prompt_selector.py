from pathlib import Path
import random
import re
import yaml
import gradio as gr

import modules.scripts as scripts
from modules.scripts import AlwaysVisible, basedir
from modules import shared
from scripts.setup import write_filename_list

FILE_DIR = Path().absolute()
BASE_DIR = Path(basedir())
TAGS_DIR = BASE_DIR.joinpath('tags')

def tag_files():
    return TAGS_DIR.rglob("*.yml")

def load_tags():
    tags = {}
    for filepath in tag_files():
        with open(filepath, "r", encoding="utf-8") as file:
            yml = yaml.safe_load(file)
            tags[filepath.stem] = yml

    return tags

def find_tag(tags, location):
    if type(location) == str:
        return tags[location]

    value = ''
    if len(location) > 0:
        value = tags
        for tag in location:
            value = value[tag]

    if type(value) == dict:
        key = random.choice(list(value.keys()))
        tag = value[key]
        if type(tag) == dict:
            value = find_tag(tag, [random.choice(list(tag.keys()))])
        else:
            value = find_tag(value, key)

    if (type(value) == list):
        value = random.choice(value)

    return value

def replace_template(tags, prompt, seed = None):
    random.seed(seed)

    count = 0
    while count < 100:
        if not '@' in prompt:
            break

        for match in re.finditer(r'(@((?P<num>\d+(-\d+)?)\$\$)?(?P<ref>[^>]+?)@)', prompt):
            template = match.group()
            try:
                try:
                    result = list(map(lambda x: int(x), match.group('num').split('-')))
                    min_count = min(result)
                    max_count = max(result)
                except Exception as e:
                    min_count, max_count = 1, 1
                count = random.randint(min_count, max_count)

                values = list(map(lambda x: find_tag(tags, match.group('ref').split(':')), list(range(count))))
                prompt = prompt.replace(template, ', '.join(values), 1)
            except Exception as e:
                prompt = prompt.replace(template, '', 1)
        count += 1

    random.seed()
    return prompt

class Script(scripts.Script):
    tags = {}

    def __init__(self):
        super().__init__()
        self.tags = load_tags()

    def title(self):
        return "EasyPromptSelector"

    def show(self, is_img2img):
        return AlwaysVisible

    def ui(self, is_img2img):
        if (is_img2img):
            return None

        reload_button = gr.Button('🔄', variant='secondary', elem_id='easy_prompt_selector_reload_button')
        reload_button.style(size='sm')

        def reload():
            self.tags = load_tags()
            write_filename_list()

        reload_button.click(fn=reload)

        return [reload_button]

    def replace_template_tags(self, p):
        prompts = [
            [p.prompt, p.all_prompts, 'Input Prompt'],
            [p.negative_prompt, p.all_negative_prompts, 'Input NegativePrompt'],
        ]
        if getattr(p, 'hr_prompt', None): prompts.append([p.hr_prompt, p.all_hr_prompts, 'Input Prompt(Hires)'])
        if getattr(p, 'hr_negative_prompt', None): prompts.append([p.hr_negative_prompt, p.all_hr_negative_prompts, 'Input NegativePrompt(Hires)'])

        for i in range(len(p.all_prompts)):
            seed = random.random()
            for [prompt, all_prompts, raw_prompt_param_name] in prompts:
                if '@' not in prompt: continue

                self.save_prompt_to_pnginfo(p, prompt, raw_prompt_param_name)

                replaced = "".join(replace_template(self.tags, all_prompts[i], seed))
                all_prompts[i] = replaced

    def save_prompt_to_pnginfo(self, p, prompt, name):
        if shared.opts.eps_enable_save_raw_prompt_to_pnginfo == False:
            return

        p.extra_generation_params.update({name: prompt.replace('\n', ' ')})

    def process(self, p, *args):
        self.replace_template_tags(p)
