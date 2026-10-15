import { it, expect } from 'vitest'
import { createLocalRepository, STORAGE_KEY } from './localRepository'
import { makeDemoData } from './demoData'
function storage(value: string | null = null) {
  return {
    getItem: () => value,
    setItem: (_key: string, v: string) => {
      value = v
    },
  }
}
it('persists and restores state', async () => {
  const s = storage()
  const repo = createLocalRepository(s)
  const state = makeDemoData()
  await repo.save(state)
  expect(await repo.load()).toEqual(state)
})
it.each(['{bad', JSON.stringify({ schemaVersion: 9, leads: [], estimates: [] })])(
  'rejects corrupt state without overwrite',
  async (value) => {
    const s = storage(value)
    await expect(createLocalRepository(s).load()).rejects.toThrow()
    expect(s.getItem()).toBe(value)
  },
)
it('rejects invalid statuses', async () => {
  const state = makeDemoData()
  const bad = { ...state, leads: state.leads.map((l) => ({ ...l, status: 'Oops' })) }
  await expect(createLocalRepository(storage(JSON.stringify(bad))).load()).rejects.toThrow()
})
it('reports failed writes', async () => {
  await expect(
    createLocalRepository({
      getItem: () => null,
      setItem: () => {
        throw Error('Quota')
      },
    }).save(makeDemoData()),
  ).rejects.toThrow('save')
})
it('uses a separate namespace', () => expect(STORAGE_KEY).toBe('quoteflow:workspace:v1'))
