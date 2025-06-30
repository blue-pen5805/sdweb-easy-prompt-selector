class EPSElementBuilder {
  // Templates
  static baseButton(text, { size = 'sm', color = 'primary' }) {
    const button = gradioApp().getElementById('txt2img_generate').cloneNode()
    button.id = ''
    button.classList.remove('gr-button-lg', 'gr-button-primary', 'lg', 'primary')
    button.classList.add(
      // gradio 3.16
      `gr-button-${size}`,
      `gr-button-${color}`,
      // gradio 3.22
      size,
      color
    )
    button.textContent = text

    return button
  }

  static tagFields() {
    const fields = document.createElement('div')
    fields.style.display = 'flex'
    fields.style.flexDirection = 'row'
    fields.style.flexWrap = 'wrap'
    fields.style.minWidth = 'min(320px, 100%)'
    fields.style.maxWidth = '100%'
    fields.style.flex = '1 calc(50% - 20px)'
    fields.style.borderWidth = '1px'
    fields.style.borderColor = 'var(--block-border-color,#374151)'
    fields.style.borderRadius = 'var(--block-radius,8px)'
    fields.style.padding = '8px'
    fields.style.height = 'fit-content'

    return fields
  }

  // Elements
  static openButton({ onClick }) {
    const button = EPSElementBuilder.baseButton('🔯タグを選択', { size: 'sm', color: 'secondary' })
    button.classList.add('easy_prompt_selector_button')
    button.addEventListener('click', onClick)

    return button
  }

  static areaContainer(id = undefined) {
    const container = gradioApp().getElementById('txt2img_results').cloneNode()
    container.id = id
    container.style.gap = 0
    container.style.display = 'none'

    return container
  }

  static tagButton({ title, value, onClick, onRightClick, color = 'primary' }) {
    const button = EPSElementBuilder.baseButton(title, { color })
    // ★★★ 機能追加 ★★★
    // ボタンのtitle属性に実際に入力されるプロンプトを設定する。
    // これにより、マウスオーバーでツールチップが表示される。
    button.title = value
    button.style.height = '2rem'
    button.style.flexGrow = '0'
    button.style.margin = '2px'

    button.addEventListener('click', onClick)
    button.addEventListener('contextmenu', onRightClick)

    return button
  }

  static dropDown(id, options, { onChange }) {
    const select = document.createElement('select')
    select.id = id

    // gradio 3.16
    select.classList.add('gr-box', 'gr-input')

    // gradio 3.22
    select.style.color = 'var(--body-text-color)'
    select.style.backgroundColor = 'var(--input-background-fill)'
    select.style.borderColor = 'var(--block-border-color)'
    select.style.borderRadius = 'var(--block-radius)'
    select.style.margin = '2px'
    select.addEventListener('change', (event) => { onChange(event.target.value) })

    const none = ['なし']
    none.concat(options).forEach((key) => {
      const option = document.createElement('option')
      option.value = key
      option.textContent = key
      select.appendChild(option)
    })

    return select
  }

  static checkbox(text, { onChange }) {
    const label = document.createElement('label')
    label.style.display = 'flex'
    label.style.alignItems = 'center'

    const checkbox = gradioApp().querySelector('input[type=checkbox]').cloneNode()
    checkbox.checked = false
    checkbox.addEventListener('change', (event) => {
       onChange(event.target.checked)
    })

    const span = document.createElement('span')
    span.style.marginLeft = 'var(--size-2, 8px)'
    span.textContent = text

    label.appendChild(checkbox)
    label.appendChild(span)

    return label
  }
}

class EasyPromptSelector {
  PATH_FILE = 'tmp/easyPromptSelector.txt'
  AREA_ID = 'easy-prompt-selector'
  SELECT_ID = 'easy-prompt-selector-select'
  CONTENT_ID = 'easy-prompt-selector-content'
  TO_NEGATIVE_PROMPT_ID = 'easy-prompt-selector-to-negative-prompt'

  constructor(yaml, gradioApp) {
    this.yaml = yaml
    this.gradioApp = gradioApp
    this.visible = false
    this.toNegative = false
    this.tags = undefined
  }

  async init() {
    this.tags = await this.parseFiles()

    const tagArea = gradioApp().querySelector(`#${this.AREA_ID}`)
    if (tagArea != null) {
      this.visible = false
      this.changeVisibility(tagArea, this.visible)
      tagArea.remove()
    }

    gradioApp()
      .getElementById('txt2img_toprow')
      .after(this.render())
  }

  async readFile(filepath) {
    const response = await fetch(`file=${filepath}?${new Date().getTime()}`);

    return await response.text();
  }

  async parseFiles() {
    const text = await this.readFile(this.PATH_FILE);
    if (text === '') { return {} }

    const paths = text.split(/\r\n|\n/)

    const tags = {}
    for (const path of paths) {
      const filename = path.split('/').pop().split('.').slice(0, -1).join('.')
      const data = await this.readFile(path)
      yaml.loadAll(data, function (doc) {
        tags[filename] = doc
      })
    }

    return tags
  }

  // Render
  render() {
    const row = document.createElement('div')
    row.style.display = 'flex'
    row.style.alignItems = 'center'
    row.style.gap = '10px'

    const dropDown = this.renderDropdown()
    dropDown.style.flex = '1'
    dropDown.style.minWidth = '1'
    row.appendChild(dropDown)

    const settings = document.createElement('div')
    const checkbox = EPSElementBuilder.checkbox('ネガティブプロンプトに入力', {
      onChange: (checked) => { this.toNegative = checked }
    })
    settings.style.flex = '1'
    settings.appendChild(checkbox)

    row.appendChild(settings)

    const container = EPSElementBuilder.areaContainer(this.AREA_ID)

    container.appendChild(row)
    container.appendChild(this.renderContent())

    return container
  }

  renderDropdown() {
    const dropDown = EPSElementBuilder.dropDown(
      this.SELECT_ID,
      Object.keys(this.tags), {
        onChange: (selected) => {
          const content = gradioApp().getElementById(this.CONTENT_ID)
          Array.from(content.childNodes).forEach((node) => {
            const visible = node.id === `easy-prompt-selector-container-${selected}`
            this.changeVisibility(node, visible)
          })
        }
      }
    )

    return dropDown
  }

  renderContent() {
    const content = document.createElement('div')
    content.id = this.CONTENT_ID

    Object.keys(this.tags).forEach((key) => {
      const values = this.tags[key]

      const fields = EPSElementBuilder.tagFields()
      fields.id = `easy-prompt-selector-container-${key}`
      fields.style.display = 'none'
      fields.style.flexDirection = 'row'
      fields.style.marginTop = '10px'

      this.renderTagButtons(values, key).forEach((group) => {
        fields.appendChild(group)
      })

      content.appendChild(fields)
    })

    // 設定を確認し、有効な場合のみフローティング機能をセットアップします。
    const settingCheckbox = gradioApp().querySelector('#setting_eps_enable_floating_prompts input[type=checkbox]')
    if (settingCheckbox && settingCheckbox.checked) {
      this.setupFloaters(content)
    }

    return content
  }

  renderTagButtons(tags, prefix = '') {
    if (Array.isArray(tags)) {
      return tags.map((tag) => this.renderTagButton(tag, tag, 'secondary'))
    } else {
      return Object.keys(tags).map((key) => {
        const values = tags[key]
        const randomKey = `${prefix}:${key}`

        if (typeof values === 'string') { return this.renderTagButton(key, values, 'secondary') }

        const fields = EPSElementBuilder.tagFields()
        fields.style.flexDirection = 'column'

        fields.append(this.renderTagButton(key, `@${randomKey}@`))

        const buttons = EPSElementBuilder.tagFields()
        buttons.id = 'buttons'
        fields.append(buttons)
        this.renderTagButtons(values, randomKey).forEach((button) => {
          buttons.appendChild(button)
        })

        return fields
      })
    }
  }

  renderTagButton(title, value, color = 'primary') {
    return EPSElementBuilder.tagButton({
      title,
      value,
      onClick: (e) => {
        e.preventDefault();

        this.addTag(value, this.toNegative || e.metaKey || e.ctrlKey)
      },
      onRightClick: (e) => {
        e.preventDefault();

        this.removeTag(value, this.toNegative || e.metaKey || e.ctrlKey)
      },
      color
    })
  }

  // Util
  changeVisibility(node, visible) {
    node.style.display = visible ? 'flex' : 'none'
  }

  addTag(tag, toNegative = false) {
    const id = toNegative ? 'txt2img_neg_prompt' : 'txt2img_prompt'
    const textarea = gradioApp().getElementById(id).querySelector('textarea')

    if (textarea.value.trim() === '') {
      textarea.value = tag
    } else if (textarea.value.trim().endsWith(',')) {
      textarea.value += ' ' + tag
    } else {
      textarea.value += ', ' + tag
    }

    updateInput(textarea)

    // 追加したタグが見えるように、テキストエリアを一番下までスクロールします。
    textarea.scrollTop = textarea.scrollHeight
  }

  removeTag(tag, toNegative = false) {
    const id = toNegative ? 'txt2img_neg_prompt' : 'txt2img_prompt'
    const textarea = gradioApp().getElementById(id).querySelector('textarea')

    if (textarea.value.trimStart().startsWith(tag)) {
      const matched = textarea.value.match(new RegExp(`${tag.replace(/[-\/\\^$*+?.()|\[\]{}]/g, '\\$&') },*`))
      textarea.value = textarea.value.replace(matched[0], '').trimStart()
    } else {
      textarea.value = textarea.value.replace(`, ${tag}`, '')
    }

    updateInput(textarea)
  }

  setupFloaters(triggerElement) {
    let floater = null
    let positivePromptPlaceholder = null
    let negativePromptPlaceholder = null
    let originalPositiveParent = null
    let originalNegativeParent = null
    let removeTimer = null

    const startRemoveTimer = () => {
      clearTimeout(removeTimer)
      removeTimer = setTimeout(removeFloater, 200)
    }

    const cancelRemoveTimer = () => {
      clearTimeout(removeTimer)
    }

    const createFloater = () => {
      if (floater) return // すでにフローティング中なら何もしない

      const positivePromptContainer = gradioApp().getElementById('txt2img_prompt')
      const negativePromptContainer = gradioApp().getElementById('txt2img_neg_prompt')

      if (!positivePromptContainer || !negativePromptContainer) return

      originalPositiveParent = positivePromptContainer.parentNode
      originalNegativeParent = negativePromptContainer.parentNode

      positivePromptPlaceholder = document.createElement('div')
      positivePromptPlaceholder.style.height = `${positivePromptContainer.offsetHeight}px`
      negativePromptPlaceholder = document.createElement('div')
      negativePromptPlaceholder.style.height = `${negativePromptContainer.offsetHeight}px`

      originalPositiveParent.insertBefore(positivePromptPlaceholder, positivePromptContainer)
      originalNegativeParent.insertBefore(negativePromptPlaceholder, negativePromptContainer)

      floater = document.createElement('div')
      floater.id = 'easy-prompt-selector-floater'
      Object.assign(floater.style, {
        position: 'fixed',
        top: '10px',
        left: '10px',
        zIndex: '9999',
        backgroundColor: 'var(--panel-background-fill, #202124)',
        border: '1px solid var(--block-border-color, #374151)',
        borderRadius: 'var(--block-radius, 8px)',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        minWidth: '400px',
      })

      floater.appendChild(positivePromptContainer)
      floater.appendChild(negativePromptContainer)

      // 入力欄の高さを固定し、個別にスクロールできるようにする
      const textareas = floater.querySelectorAll('textarea')
      textareas.forEach(textarea => {
        // WebUIのスクリプトがstyle.heightを上書きするのに対抗するため、!importantを指定します。
        // min-heightとmax-heightを同じ値に固定することで、WebUIによる高さの自動調整を完全に無効化します。
        textarea.style.setProperty('min-height', '20vh', 'important');
        textarea.style.setProperty('max-height', '20vh', 'important');
        textarea.style.setProperty('overflow-y', 'auto', 'important')
      })

      document.body.appendChild(floater)
      floater.addEventListener('mouseenter', cancelRemoveTimer)
      floater.addEventListener('mouseleave', startRemoveTimer)
    }

    const removeFloater = () => {
      if (!floater) return

      // 追加したスタイルを削除し、元の自動で高さが変わる挙動に戻す
      const textareas = floater.querySelectorAll('textarea')
      textareas.forEach(textarea => {
        textarea.style.removeProperty('min-height');
        textarea.style.removeProperty('max-height');
        textarea.style.removeProperty('overflow-y')
        textarea.dispatchEvent(new Event('input')) // styleを削除した後、高さを再計算させる
      })

      const positivePromptContainer = floater.children[0]
      const negativePromptContainer = floater.children[1]

      if (positivePromptContainer && originalPositiveParent && positivePromptPlaceholder) {
        originalPositiveParent.insertBefore(positivePromptContainer, positivePromptPlaceholder)
      }
      if (negativePromptContainer && originalNegativeParent && negativePromptPlaceholder) {
        originalNegativeParent.insertBefore(negativePromptContainer, negativePromptPlaceholder)
      }

      positivePromptPlaceholder?.remove()
      negativePromptPlaceholder?.remove()
      floater.remove()

      floater = null
      positivePromptPlaceholder = null
      negativePromptPlaceholder = null
      originalPositiveParent = null
      originalNegativeParent = null
    }

    triggerElement.addEventListener('mouseenter', () => {
      cancelRemoveTimer()
      if (!floater) {
        createFloater()
      }
    })
    triggerElement.addEventListener('mouseleave', startRemoveTimer)
  }
}

onUiLoaded(async () => {
  yaml = window.jsyaml
  const easyPromptSelector = new EasyPromptSelector(yaml, gradioApp())

  const button = EPSElementBuilder.openButton({
    onClick: () => {
      const tagArea = gradioApp().querySelector(`#${easyPromptSelector.AREA_ID}`)
      easyPromptSelector.changeVisibility(tagArea, easyPromptSelector.visible = !easyPromptSelector.visible)
    }
  })

  const reloadButton = gradioApp().getElementById('easy_prompt_selector_reload_button')
  reloadButton.addEventListener('click', async () => {
    await easyPromptSelector.init()
  })

  const txt2imgActionColumn = gradioApp().getElementById('txt2img_actions_column')
  const container = document.createElement('div')
  container.classList.add('easy_prompt_selector_container')
  container.appendChild(button)
  container.appendChild(reloadButton)

  txt2imgActionColumn.appendChild(container)

  await easyPromptSelector.init()
})
