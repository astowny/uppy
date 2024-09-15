import { h, Component, type ComponentChild } from 'preact'
import { nanoid } from 'nanoid/non-secure'
import type { I18n } from '@uppy/utils/lib/Translator'

type UrlUIProps = {
  i18n: I18n
  addFile: (url: string) => void
}

class UrlUI extends Component<UrlUIProps> {
  form = document.createElement('form')

  input: HTMLInputElement

  constructor(props: UrlUIProps) {
    super(props)
    this.form.id = nanoid()
  }

  componentDidMount(): void {
    this.input.value = ''
    this.form.addEventListener('submit', this.#handleSubmit)
    document.body.appendChild(this.form)
  }

  componentWillUnmount(): void {
    this.form.removeEventListener('submit', this.#handleSubmit)
    document.body.removeChild(this.form)
  }

  #handleSubmit = async (ev: SubmitEvent) => {
    ev.preventDefault()
    const { addFile } = this.props
    const preparedValue = this.input.value.trim()

    // Find the button element
    const btn = document.querySelector(
      '.uppy-Url-importButton',
    ) as HTMLButtonElement

    // Disable the button and store original text
    btn!.disabled = true
    const originalBtnHTML = btn!.innerHTML

    // Set loading text (you can customize this)
    btn!.innerHTML = '...'

    try {
      await addFile(preparedValue)
      // Re-enable the button and restore original text after addFile is done
      btn!.disabled = false
      btn!.innerHTML = originalBtnHTML
    } catch (error) {
      console.log('error in #handleSubmit', error)
    }
  }

  render(): ComponentChild {
    const { i18n } = this.props
    return (
      <div className="uppy-Url">
        <input
          className="uppy-u-reset uppy-c-textInput uppy-Url-input"
          type="text"
          aria-label={i18n('enterUrlToImport')}
          placeholder={i18n('enterUrlToImport')}
          ref={(input) => {
            this.input = input!
          }}
          data-uppy-super-focusable
          form={this.form.id}
        />
        <button
          className="uppy-u-reset uppy-c-btn uppy-c-btn-primary uppy-Url-importButton"
          type="submit"
          form={this.form.id}
        >
          {i18n('import')}
        </button>
      </div>
    )
  }
}

export default UrlUI
