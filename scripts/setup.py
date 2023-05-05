from pathlib import Path
import shutil
import os

from modules import scripts

FILE_DIR = Path().absolute()
BASE_DIR = Path(scripts.basedir())
TEMP_DIR = FILE_DIR.joinpath('tmp')

TAGS_DIR = BASE_DIR.joinpath('tags')
EXAMPLES_DIR = BASE_DIR.joinpath('tags_examples')

FILENAME_LIST = 'easyPromptSelector.txt'

os.makedirs(TEMP_DIR, exist_ok=True)

def examples():
    return EXAMPLES_DIR.rglob("*.yml")

def copy_examples():
    for file in examples():
        file_path = str(file).replace('tags_examples', 'tags')
        shutil.copy2(file, file_path)

def tags():
    return TAGS_DIR.rglob("*.yml")

def write_filename_list():
    filepaths = map(lambda path: path.relative_to(FILE_DIR).as_posix(), list(tags()))

    with open(TEMP_DIR.joinpath(FILENAME_LIST), 'w', encoding="utf-8") as f:
        f.write('\n'.join(sorted(filepaths)))

if len(list(TAGS_DIR.rglob("*.yml"))) == 0:
    copy_examples()

write_filename_list()
