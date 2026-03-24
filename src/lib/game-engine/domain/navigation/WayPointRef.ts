export class WayPointRef {
  
  constructor(
    public readonly sceneId: string,
    public readonly wayPointName: string) {}

  public static normalize(value: string | WayPointRef): WayPointRef {
    if (value instanceof WayPointRef) {
      return value
    }

    const [sceneId, wayPointName, ...extra] = value.split('::')
    if (!sceneId || !wayPointName || extra.length > 0) {
      throw new Error(`Invalid WayPointRef format: "${value}". Expected "sceneId::wayPointName".`)
    }

    return new WayPointRef(sceneId, wayPointName)
  }

  public static toKey(value: string | WayPointRef): string {
    const ref = WayPointRef.normalize(value)
    return `${ref.sceneId}::${ref.wayPointName}`
  }
  
  public equals(other: WayPointRef): boolean {
    return this.sceneId === other.sceneId && this.wayPointName === other.wayPointName
  }
}
