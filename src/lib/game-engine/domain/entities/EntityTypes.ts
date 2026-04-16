export type EntityMapBase = object

export type EntityId<T extends EntityMapBase> = Extract<keyof T, string>
