import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { it, expect, vi } from 'vitest'
import { EstimateEditor } from './EstimateEditor'
import { makeDemoData } from '../../data/demoData'
it('calculates line totals and saves an estimate', async () => {
  const state = makeDemoData()
  const onSave = vi.fn(async () => {})
  const user = userEvent.setup()
  render(
    <EstimateEditor
      state={state}
      initialLeadId={state.leads[1].id}
      onSave={onSave}
      onCancel={() => {}}
    />,
  )
  await user.type(screen.getByLabelText('Item 1 description'), 'Paint')
  await user.clear(screen.getByLabelText('Item 1 quantity'))
  await user.type(screen.getByLabelText('Item 1 quantity'), '2')
  await user.clear(screen.getByLabelText('Item 1 price'))
  await user.type(screen.getByLabelText('Item 1 price'), '12.50')
  await user.click(screen.getByRole('button', { name: 'Add line item' }))
  await user.type(screen.getByLabelText('Item 2 description'), 'Prep')
  await user.clear(screen.getByLabelText('Item 2 price'))
  await user.type(screen.getByLabelText('Item 2 price'), '5')
  expect(screen.getByTestId('estimate-total')).toHaveTextContent('$30')
  await user.click(screen.getByRole('button', { name: 'Save estimate' }))
  expect(onSave).toHaveBeenCalledOnce()
  expect(onSave.mock.calls[0]).toBeDefined()
})
it('blocks zero quantities', async () => {
  const state = makeDemoData()
  const onSave = vi.fn(async () => {})
  const user = userEvent.setup()
  render(
    <EstimateEditor
      state={state}
      initialLeadId={state.leads[1].id}
      onSave={onSave}
      onCancel={() => {}}
    />,
  )
  await user.type(screen.getByLabelText('Item 1 description'), 'Paint')
  await user.clear(screen.getByLabelText('Item 1 quantity'))
  await user.type(screen.getByLabelText('Item 1 quantity'), '0')
  await user.click(screen.getByRole('button', { name: 'Save estimate' }))
  expect(screen.getByRole('alert')).toBeVisible()
  expect(onSave).not.toHaveBeenCalled()
})
