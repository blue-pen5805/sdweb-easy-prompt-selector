from pathlib import Path
import random
import re
import yaml

from modules.scripts import Script, AlwaysVisible, basedir

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

        for match in re.finditer(r'(@([^>]+?)@)', prompt):
            template = match.group(0)
            try:
                value = find_tag(tags, template[1:-1].split(':'))
                prompt = prompt.replace(template, value, 1)
            except:
                print('error!')
        count += 1

    return prompt

class Script(Script):
    tags = {}

    def __init__(self) -> None:
        super().__init__()
        self.tags = load_tags()

    def title(self) -> str:
        return "Interactive Tag Selector"

    def show(self, is_img2img)-> bool|object:
        return AlwaysVisible

    def ui(self, is_img2img):
        return None

    def process(self, p):
        if not ('@' in p.prompt or '@' in p.negative_prompt):
            return

        # Replace template tags
        p.prompt = replace_template(self.tags, p.prompt)
        for i in range(len(p.all_prompts)):
            p.all_prompts[i] = p.prompt

        p.negative_prompt = replace_template(self.tags, p.negative_prompt)
        for i in range(len(p.all_negative_prompts)):
            p.all_negative_prompts[i] = p.negative_prompt
