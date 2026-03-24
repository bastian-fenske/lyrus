export type EntityState = Record<string, unknown>

export type EntityMapBase = object

export type EntityId<T extends EntityMapBase> = Extract<keyof T, string>
