import type { StoredState } from '../domain/types'
export interface WorkspaceRepository {
  load(): Promise<StoredState>
  save(state: StoredState): Promise<void>
  reset(): Promise<StoredState>
}
