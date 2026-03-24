import {GameMap} from '../../domain/navigation/GameMap'
import type {WayPointRef} from '../../domain/navigation/WayPointRef'

export interface HeroTraversalState {
  from: WayPointRef
  to: WayPointRef
  duration: number
  elapsed: number
}

export interface HeroMovementState {
  current: WayPointRef | null
  traversal: HeroTraversalState | null
}

export interface PlannedMoveStep {
  from: WayPointRef
  to: WayPointRef
  duration: number
}

interface PlanningCandidate {
  anchor: WayPointRef
  bridge: PlannedMoveStep[]
  bridgeCost: number
}

interface ScoredPlan {
  steps: PlannedMoveStep[]
  totalCost: number
}

function keyOf(ref: WayPointRef): string {
  return `${ref.sceneId}::${ref.wayPointName}`
}

export class HeroMovementPlanner {

  public plan(state: HeroMovementState, map: GameMap, target: WayPointRef): PlannedMoveStep[] {
    const candidates = this.getCandidates(state)
    let best: ScoredPlan | null = null

    for (const candidate of candidates) {
      const tail = this.shortestPath(candidate.anchor, target, map)
      if (tail === null) {
        continue
      }

      const totalCost = candidate.bridgeCost + this.durationOf(tail)
      const steps = [...candidate.bridge, ...tail]

      if (best === null || totalCost < best.totalCost) {
        best = {steps, totalCost}
      }
    }

    return best?.steps ?? []
  }

  private getCandidates(state: HeroMovementState): PlanningCandidate[] {
    if (state.traversal === null) {
      if (state.current === null) {
        return []
      }

      return [{
        anchor: state.current,
        bridge: [],
        bridgeCost: 0
      }]
    }

    const elapsed = Math.max(0, Math.min(state.traversal.elapsed, state.traversal.duration))
    const remaining = Math.max(0, state.traversal.duration - elapsed)

    const toStart: PlanningCandidate = {
      anchor: state.traversal.from,
      bridge: elapsed > 0
        ? [{
          from: state.traversal.to,
          to: state.traversal.from,
          duration: elapsed
        }]
        : [],
      bridgeCost: elapsed
    }

    const toEnd: PlanningCandidate = {
      anchor: state.traversal.to,
      bridge: remaining > 0
        ? [{
          from: state.traversal.from,
          to: state.traversal.to,
          duration: remaining
        }]
        : [],
      bridgeCost: remaining
    }

    return [toStart, toEnd]
  }

  private shortestPath(start: WayPointRef, target: WayPointRef, map: GameMap): PlannedMoveStep[] | null {
    if (keyOf(start) === keyOf(target)) {
      return []
    }

    const distances = new Map<string, number>()
    const previous = new Map<string, PlannedMoveStep>()
    const visited = new Set<string>()
    const queue: Array<{ref: WayPointRef, cost: number}> = [{ref: start, cost: 0}]

    distances.set(keyOf(start), 0)

    while (queue.length > 0) {
      queue.sort((left, right) => left.cost - right.cost)
      const next = queue.shift()!
      const nextKey = keyOf(next.ref)

      if (visited.has(nextKey)) {
        continue
      }
      visited.add(nextKey)

      if (nextKey === keyOf(target)) {
        break
      }

      for (const edge of map.getNeighbors(next.ref)) {
        const neighborKey = keyOf(edge.to)
        if (!map.hasWayPoint(edge.to)) {
          continue
        }

        const currentDistance = distances.get(nextKey) ?? Number.POSITIVE_INFINITY
        const candidateDistance = currentDistance + edge.duration
        const bestDistance = distances.get(neighborKey) ?? Number.POSITIVE_INFINITY

        if (candidateDistance < bestDistance) {
          distances.set(neighborKey, candidateDistance)
          previous.set(neighborKey, {
            from: edge.from,
            to: edge.to,
            duration: edge.duration
          })
          queue.push({ref: edge.to, cost: candidateDistance})
        }
      }
    }

    const targetKey = keyOf(target)
    if (!previous.has(targetKey)) {
      return null
    }

    const reversed: PlannedMoveStep[] = []
    let currentKey = targetKey

    while (currentKey !== keyOf(start)) {
      const step = previous.get(currentKey)
      if (step === undefined) {
        return null
      }
      reversed.push(step)
      currentKey = keyOf(step.from)
    }

    return reversed.reverse()
  }

  private durationOf(steps: PlannedMoveStep[]): number {
    return steps.reduce((sum, step) => sum + step.duration, 0)
  }
}
