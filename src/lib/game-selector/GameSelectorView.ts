import type {GameOption} from './GameOption'

export class GameSelectorView {

  public async selectGame(options: GameOption[]): Promise<string> {
    if (options.length === 0) {
      throw new Error('No games are available to select.')
    }

    return new Promise(resolve => {
      const overlay = document.createElement('div')
      overlay.style.position = 'fixed'
      overlay.style.inset = '0'
      overlay.style.display = 'flex'
      overlay.style.alignItems = 'center'
      overlay.style.justifyContent = 'center'
      overlay.style.background = 'rgba(0, 0, 0, 0.75)'
      overlay.style.zIndex = '9999'

      const panel = document.createElement('div')
      panel.style.width = 'min(92vw, 560px)'
      panel.style.padding = '24px'
      panel.style.borderRadius = '14px'
      panel.style.background = '#111827'
      panel.style.color = '#e5e7eb'
      panel.style.fontFamily = "'Trebuchet MS', 'Segoe UI', sans-serif"
      panel.style.boxShadow = '0 20px 50px rgba(0,0,0,0.45)'

      const title = document.createElement('h1')
      title.textContent = 'Choose Your Game'
      title.style.margin = '0 0 10px 0'
      title.style.fontSize = '1.5rem'

      const subtitle = document.createElement('p')
      subtitle.textContent = 'Select which adventure to launch.'
      subtitle.style.margin = '0 0 16px 0'
      subtitle.style.opacity = '0.85'

      const list = document.createElement('div')
      list.style.display = 'grid'
      list.style.gap = '10px'

      for (const option of options) {
        const button = document.createElement('button')
        button.type = 'button'
        button.style.textAlign = 'left'
        button.style.padding = '12px 14px'
        button.style.borderRadius = '10px'
        button.style.border = '1px solid #374151'
        button.style.background = '#1f2937'
        button.style.color = '#f9fafb'
        button.style.cursor = 'pointer'

        const buttonTitle = document.createElement('div')
        buttonTitle.textContent = option.title
        buttonTitle.style.fontWeight = '700'

        const buttonDescription = document.createElement('div')
        buttonDescription.textContent = option.description
        buttonDescription.style.marginTop = '4px'
        buttonDescription.style.fontSize = '0.9rem'
        buttonDescription.style.opacity = '0.85'

        button.appendChild(buttonTitle)
        button.appendChild(buttonDescription)

        button.onclick = () => {
          overlay.remove()
          resolve(option.id)
        }

        list.appendChild(button)
      }

      panel.appendChild(title)
      panel.appendChild(subtitle)
      panel.appendChild(list)
      overlay.appendChild(panel)
      document.body.appendChild(overlay)
    })
  }
}
