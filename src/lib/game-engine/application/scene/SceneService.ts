import {ReplaySubject} from 'rxjs'

export class SceneService {

  private readonly _currentScene$ = new ReplaySubject<string>(1)
  public readonly currentScene$ = this._currentScene$.asObservable()

  public goTo(sceneId: string): void {
    this._currentScene$.next(sceneId)
  }
}
