import type {Orientation} from '../navigation/Orientation'
import type {EntityId, EntityMapBase} from '../entities/EntityTypes'

export type WayPointLayoutEntry = [name: string, x: number, y: number, scale: number, entryOrientation?: Orientation | null, portalTarget?: string | null]

export type PathLayoutEntry = [from: string, to: string, duration: number]

export type ZoneLayoutEntry<T extends EntityMapBase> = [name: string, x: number, y: number, width: number, height: number, wayPointName?: string | null, entityId?: EntityId<T> | null, enabled?: boolean]

export interface SceneLayout<T extends EntityMapBase> {
  background: string
  waypoints: WayPointLayoutEntry[]
  paths: PathLayoutEntry[]
  zones: ZoneLayoutEntry<T>[]
}
