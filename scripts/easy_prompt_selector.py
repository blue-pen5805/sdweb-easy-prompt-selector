from pathlib import Path
import random
import re
import yaml

from modules.scripts import Script, AlwaysVisible, basedir, shared

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
            value = find_tag(tag, random.choice(list(tag.keys())))
        else:
            value = find_tag(value, key)

    if (type(value) == list):
        value = random.choice(value)

    return value

def replace_template(tags, prompt):
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

    return prompt

class Script(Script):
    tags = {}

    def __init__(self):
        super().__init__()
        self.tags = load_tags()

    def title(self):
        return "EasyPromptSelector"

    def show(self, is_img2img):
        return AlwaysVisible

    def ui(self, is_img2img):
        return None

    def replace_template_tags(self, p):
        if shared.opts.eps_use_old_template_feature == False:
            if ('@' in p.prompt):
                for i in range(len(p.all_prompts)):
                    self.save_prompt_to_pnginfo(p)

                    prompt = "".join(replace_template(self.tags, p.all_prompts[i]))
                    p.all_prompts[i] = prompt

            if ('@' in p.negative_prompt):
                for i in range(len(p.all_negative_prompts)):
                    self.save_prompt_to_pnginfo(p, True)

                    negative_prompt = "".join(replace_template(self.tags, p.all_negative_prompts[i]))
                    p.all_negative_prompts[i] = negative_prompt
        else:
            if ('@' in p.prompt):
                self.save_prompt_to_pnginfo(p)

                p.prompt = replace_template(self.tags, p.prompt)
                for i in range(len(p.all_prompts)):
                    p.all_prompts[i] = p.prompt

            if ('@' in p.negative_prompt):
                self.save_prompt_to_pnginfo(p, True)

                p.negative_prompt = replace_template(self.tags, p.negative_prompt)
                for i in range(len(p.all_negative_prompts)):
                    p.all_negative_prompts[i] = p.negative_prompt

    def save_prompt_to_pnginfo(self, p, is_negative = False):
        if shared.opts.eps_enable_save_raw_prompt_to_pnginfo == False:
            return

        if is_negative == False:
            prompt = p.prompt.replace('\n', ' ')
            param_name = "Input Prompt"
        else:
            prompt = p.negative_prompt.replace('\n', ' ')
            param_name = "Input NegativePrompt"

        p.extra_generation_params.update({param_name: prompt})

    def process(self, p):
        self.replace_template_tags(p)
