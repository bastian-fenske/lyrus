import {Orientation} from './Orientation'
import {WayPointRef} from './WayPointRef'

export class WayPoint {

  public readonly entryOrientation: Orientation
  
  constructor(
    public readonly name: string,
    public readonly x: number,
    public readonly y: number,
    public readonly scale: number,
    public readonly portal: WayPointRef | null,
    entryOrientation: Orientation | null) {
    
    this.entryOrientation = entryOrientation ?? Orientation.S
  }
}
