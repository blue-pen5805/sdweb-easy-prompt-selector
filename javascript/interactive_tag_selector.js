const areaId = 'interactive-tag-selector'
const selectId = 'interactive-tag-selector-select'
const contentId = 'interactive-tag-selector-content'
const toNegativePrompt = 'interactive-tag-selector-to-negative-prompt'

let visible = false
let toNegative = false

async function readFile(filepath) {
  const response = await fetch(`file=${filepath}?${new Date().getTime()}`);

  return await response.text();
}

function createTagButtons(tags, prefix = '') {
  if(Array.isArray(tags)) {
    return tags.map((tag) => createTagButton(tag, tag, 'secondary'))
  } else {
    return Object.keys(tags).map((key) => {
      const values = tags[key]
      const randomKey = `${prefix}:${key}`

      if (typeof values === 'string') { return createTagButton(key, values, 'secondary') }

      const group = document.createElement('div')
      group.classList.add('gr-block', 'gr-box', 'relative', 'w-full', 'border-solid', 'border', 'border-gray-200', 'flex', 'flex-col', 'col', 'flex-wrap', 'gap-2', 'p-2')
      group.style = `min-width: min(320px, 100%); flex-basis: 50%; flex-grow: 1;`
      group.append(createTagButton(key, `@${randomKey}@`))
      group.insertAdjacentHTML('beforeend', '<div class="flex flex-col buttons"></div>')

      const buttons = group.querySelector('.buttons')
      buttons.classList.add('gr-block', 'gr-box', 'relative', 'w-full', 'flex', 'flex-wrap')
      buttons.style = 'flex-direction: initial;'

      createTagButtons(values, randomKey).forEach((button) => {
        buttons.appendChild(button)
      })

      return group
    })
  }
}

function createTagButton(title, value, color = 'primary') {
  const button = document.createElement('button')
  button.classList.add('gr-button', 'gr-button-sm', `gr-button-${color}`)
  button.style = 'height: 2rem; flex-grow: 0; margin: 2px;'
  button.textContent = title
  button.addEventListener('click', () => { addTag(value) })

  return button
}

function createTagArea(tags = {}) {
  const tagArea = document.createElement('div')
  tagArea.id = areaId
  tagArea.classList.add('flex', 'flex-col', 'relative', 'col', 'gr-panel')
  tagArea.style = 'display: none;'

  tagArea.innerHTML = `
    <div class="flex flex-col relative col">
      <div class="gr-block gr-box relative w-full border-solid border border-gray-200">
        <div class="flex flex-row flex-wrap w-full gap-2" style="align-items: center;">
          <select id="${selectId}" class="gr-box gr-input w-full" style="min-width: min(400px, 100%); flex: 3;">
            <option>なし</option>
          </select>
          <div style="min-width: min(200px, 100%); flex: 1">
            <label class="flex items-center text-gray-700 text-sm space-x-2 rounded-lg cursor-pointer dark:bg-transparent">
              <input type="checkbox" id="${toNegativePrompt}" class="gr-check-radio gr-checkbox">
              <span class="ml-2">ネガティブプロンプトに入力</span>
            </label>
          </div>
        </div>
        <div id="${contentId}" class="flex flex-row flex-wrap"></div>
      </div>
    </div>
  `
  const select = tagArea.querySelector(`#${selectId}`)
  const content = tagArea.querySelector(`#${contentId}`)
  const toNegativePromptCheckbox = tagArea.querySelector(`#${toNegativePrompt}`)

  Object.keys(tags).forEach((key) => {
    const values = tags[key]

    const option = document.createElement('option')
    option.value = key
    option.textContent = key
    select.appendChild(option)

    const container = document.createElement('div')
    container.id = `interactive-tag-selector-container-${key}`
    container.classList.add('flex', 'flex-row', 'flex-wrap')
    container.style = 'display: none;'

    createTagButtons(values, key).forEach((group) => {
      container.appendChild(group)
    })

    content.appendChild(container)
  })

  select.addEventListener('change', (event) => {
    const selected = event.target.value
    Array.from(content.childNodes).forEach((node) => {
      const visible = node.id === `interactive-tag-selector-container-${selected}`
      changeVisibility(node, visible)
    })
  })

  toNegativePromptCheckbox.addEventListener('change', (event) => {
    toNegative = event.target.checked
  })


  gradioApp().getElementById('txt2img_toprow').after(tagArea)
}

function changeVisibility(node, visible) {
  style = visible ? 'display: flex;' : 'display: none;'
  node.style = style
}

function addTag(tag) {
  const id = toNegative ? 'txt2img_neg_prompt' : 'txt2img_prompt'
  const textarea = gradioApp().getElementById(id).querySelector('textarea')

  if (textarea.value.trim() !== '' && textarea.value.trim().slice(-1) !== ',') { textarea.value += ', '}
  textarea.value += tag

  updateInput(textarea)
}

const PATH_FILE = 'tmp/interactiveTagSelector.txt'
async function parseFiles() {
  yaml = window.jsyaml

  const text = await readFile(PATH_FILE);
  if (text === '') { return {} }

  const paths = text.split(/\r\n|\n/)

  tags = {}
  for (const path of paths) {
    const filename = path.split('/').pop().split('.').shift()
    const data = await readFile(path)
    yaml.loadAll(data, function (doc) {
      tags[filename] = doc
    })
  }

  return tags
}

onUiLoaded(async () => {
  const tags = await parseFiles()

  const button = document.createElement('button')
  button.textContent = '🔯タグを選択'
  button.classList.add('gr-button', 'gr-button-sm', 'gr-button-secondary')
  button.style = 'margin-top: 0.5rem;'

  button.addEventListener('click', () => {
    const tagArea = gradioApp().querySelector(`#${areaId}`)
    changeVisibility(tagArea, visible = !visible)
  })

  const txt2imgActionColumn = gradioApp().getElementById('txt2img_actions_column')
  txt2imgActionColumn.appendChild(button)

  createTagArea(tags)
})
