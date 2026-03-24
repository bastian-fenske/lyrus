import {GameCatalogService} from './GameCatalogService'
import {GameSelectorView} from './GameSelectorView'
import type {GameDefinition} from '../game-engine/domain/GameDefinition'

export class GameSelector {
  
  private readonly gameCatalog = new GameCatalogService()
  private readonly gameSelectorView = new GameSelectorView()
  
  
  public async selectGame(): Promise<GameDefinition<any>> {
    
    const selectedGameId = await this.gameSelectorView.selectGame(
      this.gameCatalog.getAll()
        .map(game => ({
          id: game.id,
          title: game.title,
          description: game.description
        })))
    
    const selectedGameDefinition = this.gameCatalog.getById(selectedGameId)
    if (selectedGameDefinition === null) {
      throw new Error(`Unknown game id: ${selectedGameId}`)
    }
    return selectedGameDefinition
  }
}
