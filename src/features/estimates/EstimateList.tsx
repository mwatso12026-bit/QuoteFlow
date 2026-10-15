import { FileText, ArrowUpRight } from 'lucide-react'
import type { StoredState } from '../../domain/types'
import { estimateTotal, money } from '../../domain/money'
import { StatusBadge, Initials } from '../../components/StatusBadge'
import { Button } from '../../components/ui/button'
export function EstimateList({
  state,
  onEdit,
  onNew,
}: {
  state: StoredState
  onEdit: (leadId: string) => void
  onNew: () => void
}) {
  return (
    <section className="panel estimates-panel">
      <div className="lead-heading">
        <div>
          <h2>Your estimates</h2>
          <p className="section-description">Thoughtful offers, ready for the next conversation.</p>
        </div>
        <span className="count-chip">{state.estimates.length} estimates</span>
      </div>
      <div className="estimate-cards">
        {state.estimates.map((e) => {
          const lead = state.leads.find((l) => l.id === e.leadId)!
          return (
            <button className="estimate-card" key={e.id} onClick={() => onEdit(lead.id)}>
              <div className="estimate-card-top">
                <Initials name={lead.customerName} />
                <StatusBadge status={lead.status} />
              </div>
              <h3>{lead.customerName}</h3>
              <p>{lead.service}</p>
              <strong>{money(estimateTotal(e.items))}</strong>
              <div className="estimate-card-bottom">
                <span>
                  {e.items.length} line {e.items.length === 1 ? 'item' : 'items'}
                </span>
                <span>
                  Edit estimate
                  <ArrowUpRight size={14} />
                </span>
              </div>
            </button>
          )
        })}
      </div>
      {!state.estimates.length && (
        <div className="empty-state">
          <FileText size={30} />
          <h3>A fresh start for your next offer.</h3>
          <Button onClick={onNew}>Create estimate</Button>
        </div>
      )}
    </section>
  )
}
