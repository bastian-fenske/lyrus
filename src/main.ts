import {GameSelector} from './lib/game-selector/GameSelectior'
import {GameEngine} from './lib/game-engine/GameEngine'

(async () => {
  
  const gameSelector = new GameSelector()
  const selectedGameDefinition = await gameSelector.selectGame()
  
  const gameEngine = new GameEngine()
  await gameEngine.startGame(selectedGameDefinition)
  
})()
