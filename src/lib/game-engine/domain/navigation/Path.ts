import type {WayPointRef} from './WayPointRef'

export class Path {

  constructor(
    public readonly from: WayPointRef,
    public readonly to: WayPointRef,
    public readonly duration: number) {
  }
}
