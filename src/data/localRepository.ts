import { stateSchema, type StoredState } from '../domain/types'
import { makeDemoData } from './demoData'
import type { WorkspaceRepository } from './repository'
export const STORAGE_KEY = 'quoteflow:workspace:v1'
type StoragePort = Pick<Storage, 'getItem' | 'setItem'>
export function createLocalRepository(storage: StoragePort): WorkspaceRepository {
  return {
    async load() {
      try {
        const raw = storage.getItem(STORAGE_KEY)
        return raw === null ? makeDemoData() : stateSchema.parse(JSON.parse(raw))
      } catch {
        throw new Error(
          'Saved data could not be read. Your existing browser data has not been overwritten. Reset demo data to start fresh, or continue in this session. Changes will not be saved until you reset.',
        )
      }
    },
    async save(state: StoredState) {
      stateSchema.parse(state)
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch {
        throw new Error(
          'Could not save changes to this browser. Your changes are available for this session only.',
        )
      }
    },
    async reset() {
      const state = makeDemoData()
      await this.save(state)
      return state
    },
  }
}
