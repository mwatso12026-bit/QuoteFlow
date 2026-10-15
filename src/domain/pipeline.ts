import {
  estimateSchema,
  leadInputSchema,
  type LeadInput,
  type Lead,
  type Estimate,
  type Status,
  type StoredState,
} from './types'
import { estimateTotal } from './money'
export function createLead(input: LeadInput): Lead {
  const now = new Date().toISOString()
  return {
    ...leadInputSchema.parse(input),
    id: crypto.randomUUID(),
    status: 'New',
    createdAt: now,
    updatedAt: now,
    closedAt: null,
  }
}
export function changeStatus(lead: Lead, status: Status): Lead {
  const now = new Date().toISOString()
  return {
    ...lead,
    status,
    updatedAt: now,
    closedAt:
      status === 'Won' || status === 'Lost' ? (lead.status === status ? lead.closedAt : now) : null,
  }
}
export function filterLeads(leads: Lead[], query: string, status: Status | 'All'): Lead[] {
  const q = query.trim().toLowerCase()
  return leads.filter(
    (l) =>
      (status === 'All' || l.status === status) &&
      [l.customerName, l.service].some((v) => v.toLowerCase().includes(q)),
  )
}
export function saveEstimate(state: StoredState, input: Estimate): StoredState {
  const parsed = estimateSchema.parse(input)
  estimateTotal(parsed.items)
  const lead = state.leads.find((l) => l.id === parsed.leadId)
  if (!lead) throw new Error('Select a valid lead.')
  const existing = state.estimates.find((e) => e.leadId === parsed.leadId)
  const estimate = {
    ...parsed,
    id: existing?.id ?? parsed.id,
    createdAt: existing?.createdAt ?? parsed.createdAt,
    updatedAt: new Date().toISOString(),
  }
  return {
    ...state,
    estimates: [...state.estimates.filter((e) => e.leadId !== parsed.leadId), estimate],
    leads: state.leads.map((l) =>
      l.id === lead.id && l.status === 'New' ? changeStatus(l, 'Quoted') : l,
    ),
  }
}
export function pipelineMetrics(leads: Lead[], estimates: Estimate[], now: Date) {
  const won = leads.filter((l) => l.status === 'Won')
  const closed = leads.filter((l) => l.status === 'Won' || l.status === 'Lost')
  const monthWon = new Set(
    won
      .filter((l) => {
        const d = new Date(l.closedAt ?? l.updatedAt)
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      })
      .map((l) => l.id),
  )
  return {
    newCount: leads.filter((l) => l.status === 'New').length,
    quotedCount: leads.filter((l) => l.status === 'Quoted').length,
    wonValueCents: estimates
      .filter((e) => monthWon.has(e.leadId))
      .reduce((s, e) => s + estimateTotal(e.items), 0),
    winRate: closed.length ? Math.round((won.length / closed.length) * 100) : 0,
  }
}
