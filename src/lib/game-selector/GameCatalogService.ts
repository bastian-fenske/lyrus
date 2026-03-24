import {Lyrus} from '../../game/lyrus/Lyrus'
import type {GameDefinition} from '../game-engine/domain/GameDefinition'

export class GameCatalogService {

  private readonly games: GameDefinition<any>[] = [
    {
      id: 'lyrus',
      title: 'Lyrus',
      description: 'Fantasy adventure around the sorceress hut.',
      createGame: () => new Lyrus()
    }
  ]

  public getAll(): GameDefinition<any>[] {
    return [...this.games]
  }

  public getById(id: string): GameDefinition<any> | null {
    return this.games.find(game => game.id === id) ?? null
  }
}
