export interface LyrusEntityMap {
  key: {
    collected: boolean
  }
  door: {
    isOpen: boolean
  }
  cauldron: {
    isBubbling: boolean
  }
}

export const initialEntityState: LyrusEntityMap = {
  key: {collected: false},
  door: {isOpen: false},
  cauldron: {isBubbling: false}
}
