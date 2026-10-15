import {
  Users,
  Clock3,
  BadgeCheck,
  ChartNoAxesCombined,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react'
import type { Lead, StoredState } from '../../domain/types'
import { statuses } from '../../domain/types'
import { pipelineMetrics } from '../../domain/pipeline'
import { money } from '../../domain/money'
import { Initials } from '../../components/StatusBadge'
export function Metrics({ state }: { state: StoredState }) {
  const m = pipelineMetrics(state.leads, state.estimates, new Date())
  const cards = [
    {
      label: 'New leads',
      value: m.newCount,
      note: 'Ready for a first conversation',
      icon: Users,
      tone: 'blue',
    },
    {
      label: 'Awaiting response',
      value: m.quotedCount,
      note: 'Estimates out for consideration',
      icon: Clock3,
      tone: 'amber',
    },
    {
      label: 'Won this month',
      value: money(m.wonValueCents),
      note: 'From work marked as won',
      icon: BadgeCheck,
      tone: 'teal',
    },
    {
      label: 'Win rate',
      value: m.winRate + '%',
      note: 'Of all closed opportunities',
      icon: ChartNoAxesCombined,
      tone: 'purple',
    },
  ]
  return (
    <section className="metrics" aria-label="Pipeline summary">
      {cards.map(({ label, value, note, icon: Icon, tone }) => (
        <article className="metric-card" key={label}>
          <div className="metric-heading">
            <span>{label}</span>
            <span className={'metric-icon ' + tone}>
              <Icon size={19} />
            </span>
          </div>
          <strong>{value}</strong>
          <p>{note}</p>
        </article>
      ))}
    </section>
  )
}
export function Attention({ state, onLead }: { state: StoredState; onLead: (lead: Lead) => void }) {
  const pending = state.leads
    .filter((l) => l.status === 'New' || l.status === 'Quoted')
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
    .slice(0, 3)
  return (
    <aside className="right-column">
      <section className="panel attention-panel">
        <div className="panel-heading">
          <h2>Needs your attention</h2>
          <Clock3 size={17} />
        </div>
        <p className="section-description">A few next steps to keep things moving.</p>
        <div>
          {pending.map((l) => (
            <button className="attention-item" key={l.id} onClick={() => onLead(l)}>
              <Initials name={l.customerName} />
              <span>
                <strong>{l.customerName}</strong>
                <small>{l.status === 'New' ? 'Review new request' : 'Follow up on estimate'}</small>
              </span>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>
        {!pending.length && <p className="empty-small">You’re all caught up.</p>}
      </section>
      <section className="panel pipeline-panel">
        <div className="panel-heading">
          <h2>Pipeline at a glance</h2>
          <ChartNoAxesCombined size={17} />
        </div>
        <p className="section-description">Every opportunity, in one place.</p>
        <div className="pipeline-bars">
          {statuses.map((status) => {
            const count = state.leads.filter((l) => l.status === status).length
            return (
              <div className="pipeline-row" key={status}>
                <span>{status}</span>
                <div className="bar-track">
                  <div
                    className={'bar-fill ' + status.toLowerCase()}
                    style={{
                      width: (state.leads.length ? (count / state.leads.length) * 100 : 0) + '%',
                    }}
                  />
                </div>
                <strong>{count}</strong>
              </div>
            )
          })}
        </div>
        <div className="pipeline-total">
          <span>Total opportunities</span>
          <strong>{state.leads.length}</strong>
        </div>
      </section>
      <div className="tip-card">
        <span className="tip-icon">
          <ArrowUpRight size={20} />
        </span>
        <h3>
          Good work starts with
          <br />a great first impression.
        </h3>
        <p>Keep your estimates clear and your follow-ups timely.</p>
      </div>
    </aside>
  )
}
