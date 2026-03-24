import {Orientation} from './Orientation'
import {BehaviorSubject} from 'rxjs'
import {WayPointRef} from './WayPointRef'

export class WayPoint {
  
  public _isClickable$ = new BehaviorSubject(false)
  public isClickable$ = this._isClickable$.asObservable()

  public clickRectangle: Rectangle | null = null
  
  public clickHandler = () => {}
  
  public portal: WayPointRef | null = null
  public portalTargetOrientation: Orientation | null = null
  public entryOrientation: Orientation = Orientation.S

  constructor(
    public readonly name: string,
    public readonly x: number,
    public readonly y: number,
    public readonly scale: number) {
  }

  setIsClickable(isClickable: boolean) {
    this._isClickable$.next(isClickable)
    return this
  }

  setClickHandler(clickHandler: () => void) {
    this.clickHandler = clickHandler
    
    console.log(this.name)
    console.log(clickHandler)
    return this
  }

  setClickRectangle(dimensions: Rectangle) {
    this.clickRectangle = dimensions
    return this
  }
  
  setPortal(target: string, portalTargetOrientation: Orientation | null = null) {
    this.portal = WayPointRef.normalize(target)
    this.portalTargetOrientation = portalTargetOrientation
    return this
  }
  
  setEntryOrientation(orientation: Orientation) {
    this.entryOrientation = orientation
    return this
  }
}

export type Rectangle = { leftX: number; topY: number; width: number; height: number }
