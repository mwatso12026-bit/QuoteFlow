import { describe, it, expect } from 'vitest'
import { estimateTotal, parsePrice } from './money'
import { pipelineMetrics, changeStatus, saveEstimate, createLead, filterLeads } from './pipeline'
import { makeDemoData } from '../data/demoData'
describe('estimate money', () => {
  it('totals integer cents exactly', () =>
    expect(
      estimateTotal([
        { id: crypto.randomUUID(), description: 'Paint', quantity: 2, unitPriceCents: 1250 },
        { id: crypto.randomUUID(), description: 'Prep', quantity: 1, unitPriceCents: 500 },
      ]),
    ).toBe(3000))
  it.each(['-1', '1.001', 'Infinity', 'NaN', '', '1e3'])('rejects invalid price %s', (value) =>
    expect(() => parsePrice(value)).toThrow(),
  )
  it('accepts zero and decimal prices', () => {
    expect(parsePrice('0')).toBe(0)
    expect(parsePrice('12.50')).toBe(1250)
  })
  it.each([0, -1, 1.5, Infinity])('rejects invalid quantity %s', (quantity) =>
    expect(() =>
      estimateTotal([
        { id: crypto.randomUUID(), description: 'Paint', quantity, unitPriceCents: 100 },
      ]),
    ).toThrow(),
  )
  it('rejects empty items', () => expect(() => estimateTotal([])).toThrow())
})
describe('lead workflow', () => {
  it('derives zero win rate from no closed leads', () =>
    expect(pipelineMetrics([], [], new Date()).winRate).toBe(0))
  it('counts closed outcomes and current-month revenue', () => {
    const state = makeDemoData(new Date(2026, 9, 14))
    expect(pipelineMetrics(state.leads, state.estimates, new Date(2026, 9, 14)).winRate).toBe(50)
    expect(pipelineMetrics(state.leads, state.estimates, new Date(2026, 10, 1)).wonValueCents).toBe(
      0,
    )
  })
  it('clears closedAt on reopening', () => {
    const l = makeDemoData().leads[0]
    expect(changeStatus({ ...l, status: 'Won', closedAt: '2026-10-01' }, 'New').closedAt).toBeNull()
  })
  it('preserves closed status when estimate changes', () => {
    const state = makeDemoData()
    const won = state.leads.find((l) => l.status === 'Won')!
    const estimate = state.estimates.find((e) => e.leadId === won.id)!
    const result = saveEstimate(state, estimate)
    expect(result.leads.find((l) => l.id === won.id)?.closedAt).toBe(won.closedAt)
    expect(result.leads.find((l) => l.id === won.id)?.status).toBe('Won')
    expect(result.estimates.filter((e) => e.leadId === won.id)).toHaveLength(1)
  })
  it('quotes a new lead on estimate save', () => {
    const state = makeDemoData()
    const lead = state.leads.find((l) => l.status === 'New')!
    expect(
      saveEstimate(state, {
        id: crypto.randomUUID(),
        leadId: lead.id,
        items: [{ id: crypto.randomUUID(), description: 'Work', quantity: 1, unitPriceCents: 100 }],
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).leads.find((l) => l.id === lead.id)?.status,
    ).toBe('Quoted')
  })
  it('trims request data and creates New lead', () => {
    const lead = createLead({
      customerName: ' Alex ',
      email: 'alex@example.com',
      phone: '',
      service: 'Repair',
      description: ' Fix fence ',
    })
    expect(lead.customerName).toBe('Alex')
    expect(lead.status).toBe('New')
    expect(lead.description).toBe('Fix fence')
  })
  it.each([
    { customerName: ' ', email: 'x@example.com', service: 'Paint', description: 'Work' },
    { customerName: 'A', email: 'bad', service: 'Paint', description: 'Work' },
    { customerName: 'A', email: 'a@example.com', service: 'Paint', description: ' ' },
  ])('rejects invalid request', (input) => expect(() => createLead(input)).toThrow())
  it('combines search and status filters', () => {
    const state = makeDemoData()
    expect(filterLeads(state.leads, 'fence', 'New')).toHaveLength(1)
    expect(filterLeads(state.leads, 'fence', 'Won')).toHaveLength(0)
  })
})
