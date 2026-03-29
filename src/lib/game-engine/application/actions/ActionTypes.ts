import type {EntityId, EntityMapBase} from '../../domain/entities/EntityTypes'

export type ActorId = string

export type QueueMode = 'enqueue' | 'replace-current' | 'parallel'

export interface SubmitActionOptions {
  mode?: QueueMode
  blocking?: boolean
}

export interface MoveIntent {
  type: 'move'
  targetWayPointName: string
  targetSceneId?: string
}

export interface InvestigateIntent<T extends EntityMapBase> {
  type: 'investigate'
  entityId: EntityId<T>
  targetWayPointName?: string
  targetSceneId?: string
}

export interface UseIntent<T extends EntityMapBase> {
  type: 'use'
  entityId: EntityId<T>
}

export type ActionIntent<T extends EntityMapBase> = MoveIntent | InvestigateIntent<T> | UseIntent<T>

export type ActionStatus = 'queued' | 'running' | 'cancelled' | 'completed' | 'failed'

export interface ActionState<T extends EntityMapBase> {
  actionId: string
  actorId: ActorId
  intent: ActionIntent<T>
  status: ActionStatus
  blocking: boolean
  createdAt: number
  startedAt: number | null
  completedAt: number | null
  error: string | null
}

export type PresentationStatus = 'idle' | 'running' | 'cancelled' | 'completed'

export interface PresentationActionState {
  actionId: string
  actorId: ActorId
  status: PresentationStatus
  totalSteps: number
  currentStepIndex: number
  currentStepName: string | null
}
