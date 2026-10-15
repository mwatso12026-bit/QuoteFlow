import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { it, expect } from 'vitest'
import App from './App'
import { makeDemoData } from '../data/demoData'
import type { WorkspaceRepository } from '../data/repository'
function repository(): WorkspaceRepository {
  let state = makeDemoData()
  return {
    load: async () => state,
    save: async (next) => {
      state = next
    },
    reset: async () => {
      state = makeDemoData()
      return state
    },
  }
}
it('combines lead search and status filters', async () => {
  const user = userEvent.setup()
  render(<App repository={repository()} />)
  await screen.findByRole('heading', { name: 'Lead pipeline' })
  await user.type(screen.getByPlaceholderText('Search customers or services…'), 'fence')
  expect(screen.getByText('Marcus Reed')).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Won' }))
  expect(screen.getByText('No leads found')).toBeVisible()
})
it('submits a request and displays success', async () => {
  const user = userEvent.setup()
  render(<App repository={repository()} />)
  await screen.findByRole('heading', { name: 'Lead pipeline' })
  await user.click(screen.getByRole('button', { name: 'Request form' }))
  await user.type(screen.getByLabelText('Customer name'), 'Alex Demo')
  await user.type(screen.getByLabelText('Email address'), 'alex@example.com')
  await user.type(screen.getByLabelText('Service needed'), 'Fence repair')
  await user.type(screen.getByLabelText('Project details'), 'Repair gate')
  await user.click(screen.getByRole('button', { name: 'Submit request' }))
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Request received'))
})
it('shows storage read errors and retains in-memory edits', async () => {
  const repo = repository()
  repo.load = async () => {
    throw Error('Saved data could not be read.')
  }
  render(<App repository={repo} />)
  expect(await screen.findByRole('alert')).toHaveTextContent('Saved data could not be read')
})
