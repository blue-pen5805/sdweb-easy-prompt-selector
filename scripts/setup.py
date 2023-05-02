from pathlib import Path
import shutil

from modules import scripts

BASE_DIR = Path(scripts.basedir())

TAGS_DIR = BASE_DIR.joinpath('tags')
EXAMPLES_DIR = BASE_DIR.joinpath('tags_examples')

def examples():
    return EXAMPLES_DIR.rglob("*.yml")

def copy_examples():
    for file in examples():
        file_path = str(file).replace('tags_examples', 'tags')
        shutil.copy2(file, file_path)

if len(list(TAGS_DIR.rglob("*.yml"))) == 0:
    copy_examples()
