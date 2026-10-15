import { useState } from 'react'
import { Search, ArrowUpRight, Inbox } from 'lucide-react'
import { statuses, type Status, type Lead, type StoredState } from '../../domain/types'
import { filterLeads } from '../../domain/pipeline'
import { estimateTotal, money } from '../../domain/money'
import { Initials, StatusBadge } from '../../components/StatusBadge'
import { Button } from '../../components/ui/button'
export function LeadList({
  state,
  onLead,
  onNew,
}: {
  state: StoredState
  onLead: (lead: Lead) => void
  onNew: () => void
}) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<Status | 'All'>('All')
  const leads = filterLeads(state.leads, query, status)
  return (
    <section className="panel lead-panel">
      <div className="lead-heading">
        <div>
          <h2>Lead pipeline</h2>
          <p className="section-description">From first hello to a job well done.</p>
        </div>
        <Button variant="outline" size="sm" onClick={onNew}>
          + Add lead
        </Button>
      </div>
      <div className="lead-controls">
        <div className="search-box">
          <Search size={17} />
          <input
            aria-label="Search leads"
            placeholder="Search customers or services…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="status-filters" aria-label="Filter leads by status">
          {(['All', ...statuses] as const).map((s) => (
            <button aria-pressed={s === status} key={s} onClick={() => setStatus(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="leads-table">
        <div className="table-header">
          <span>Customer</span>
          <span>Service</span>
          <span>Status</span>
          <span>Estimate</span>
          <span />
        </div>
        {leads.map((lead) => {
          const estimate = state.estimates.find((e) => e.leadId === lead.id)
          return (
            <button
              className="lead-row"
              key={lead.id}
              onClick={() => onLead(lead)}
              aria-label={'View ' + lead.customerName}
            >
              <span className="customer-cell">
                <Initials name={lead.customerName} />
                <span>
                  <strong>{lead.customerName}</strong>
                  <small>{lead.email}</small>
                </span>
              </span>
              <span className="service-cell">{lead.service}</span>
              <span className="badge-cell">
                <StatusBadge status={lead.status} />
              </span>
              <span className="estimate-cell">
                {estimate ? (
                  money(estimateTotal(estimate.items))
                ) : (
                  <span className="muted">Not quoted</span>
                )}
              </span>
              <ArrowUpRight size={16} className="row-arrow" />
            </button>
          )
        })}
        {!leads.length && (
          <div className="empty-state">
            <Inbox size={30} />
            <h3>No leads found</h3>
            <p>Try another search or add a new opportunity.</p>
            <Button
              variant="outline"
              onClick={() => {
                setQuery('')
                setStatus('All')
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
      <div className="table-footer">
        <span>
          Showing {leads.length} of {state.leads.length} opportunities
        </span>
        <span>
          Click a lead to view details <ArrowUpRight size={13} />
        </span>
      </div>
    </section>
  )
}
