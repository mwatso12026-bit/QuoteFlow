import { useEffect, useRef, useState } from 'react'
import { Plus, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { AppShell, type Page } from './AppShell'
import { createLocalRepository } from '../data/localRepository'
import type { WorkspaceRepository } from '../data/repository'
import { makeDemoData } from '../data/demoData'
import type { StoredState, Lead, LeadInput, Estimate, Status } from '../domain/types'
import { createLead, changeStatus, saveEstimate } from '../domain/pipeline'
import { Metrics, Attention } from '../features/overview/Overview'
import { LeadList } from '../features/leads/LeadList'
import { LeadDialog } from '../features/leads/LeadDialog'
import { RequestForm } from '../features/requests/RequestForm'
import { EstimateEditor } from '../features/estimates/EstimateEditor'
import { EstimateList } from '../features/estimates/EstimateList'
import { Button } from '../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog'
const browserRepository = createLocalRepository({
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
})
export default function App({
  repository = browserRepository,
}: {
  repository?: WorkspaceRepository
}) {
  const [state, setState] = useState<StoredState | null>(null)
  const stateRef = useRef<StoredState | null>(null)
  const [page, setPage] = useState<Page>('Overview')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const saveBlocked = useRef(false)
  const [busy, setBusy] = useState(false)
  const [leadDialog, setLeadDialog] = useState<{ lead: Lead | null } | null>(null)
  const [editor, setEditor] = useState<{ leadId?: string } | null>(null)
  const [resetOpen, setResetOpen] = useState(false)
  useEffect(() => {
    let active = true
    repository
      .load()
      .then((s) => {
        if (active) {
          stateRef.current = s
          setState(s)
        }
      })
      .catch((e) => {
        if (active) {
          const demo = makeDemoData()
          stateRef.current = demo
          setState(demo)
          saveBlocked.current = true
          setError(e.message)
        }
      })
    return () => {
      active = false
    }
  }, [repository])
  function navigate(p: Page) {
    setPage(p)
    setEditor(null)
    setNotice('')
  }
  async function commit(next: StoredState) {
    stateRef.current = next
    setState(next)
    if (saveBlocked.current) return
    try {
      await repository.save(next)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save this session.')
    }
  }
  async function submitRequest(input: LeadInput) {
    const lead = createLead(input)
    await commit({ ...stateRef.current!, leads: [lead, ...stateRef.current!.leads] })
  }
  async function updateLead(input: LeadInput, status: Status) {
    const current = stateRef.current!
    const existing = leadDialog?.lead
    const lead = existing ? { ...existing, ...input } : createLead(input)
    const updated = lead.status === status ? lead : changeStatus(lead, status)
    await commit({
      ...current,
      leads: existing
        ? current.leads.map((l) =>
            l.id === existing.id ? { ...updated, updatedAt: new Date().toISOString() } : l,
          )
        : [updated, ...current.leads],
    })
    setNotice(existing ? 'Lead updated.' : 'New lead added.')
  }
  function openEstimate(leadId?: string) {
    setLeadDialog(null)
    setPage('Estimates')
    setEditor({ leadId })
    setNotice('')
  }
  async function save(estimate: Estimate) {
    await commit(saveEstimate(stateRef.current!, estimate))
    setEditor(null)
    setNotice('Estimate saved. Ready for your next conversation.')
  }
  async function reset() {
    if (busy) return
    setBusy(true)
    try {
      const next = await repository.reset()
      saveBlocked.current = false
      stateRef.current = next
      setState(next)
      setError('')
      setResetOpen(false)
      setNotice('Demo workspace reset.')
      setEditor(null)
      setLeadDialog(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reset demo data.')
    } finally {
      setBusy(false)
    }
  }
  const titles: Record<Page, [string, string]> = {
    Overview: [
      'Your business, in motion.',
      'A clear view of your leads, estimates, and next opportunities.',
    ],
    Leads: ['Every opportunity starts here.', 'Keep the details close and your next steps clear.'],
    Estimates: ['Great work. Clearly quoted.', 'Turn customer requests into confident offers.'],
    'Request form': [
      'A warm welcome for new work.',
      'A simple way to capture the details that matter.',
    ],
  }
  return (
    <AppShell page={page} onNavigate={navigate} onReset={() => setResetOpen(true)}>
      <div className="page-header">
        <div>
          <div className="date-label">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
            <span />
            LET’S MAKE IT A GOOD ONE
          </div>
          <h1>{titles[page][0]}</h1>
          <p>{titles[page][1]}</p>
        </div>
        {page !== 'Request form' && (
          <Button className="primary-action" onClick={() => openEstimate()}>
            <Plus size={17} />
            New estimate
          </Button>
        )}
      </div>
      {error && (
        <div className="error-banner" role="alert">
          <AlertCircle size={19} />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="success-banner" role="status">
          <CheckCircle2 size={18} />
          {notice}
        </div>
      )}
      {!state ? (
        <div className="loading-state">Opening your workspace…</div>
      ) : (
        <>
          {page === 'Overview' && (
            <>
              <Metrics state={state} />
              <div className="overview-section-label">
                <span>YOUR OPPORTUNITIES</span>
                <button onClick={() => navigate('Request form')}>
                  Preview request form
                  <ArrowRight size={14} />
                </button>
              </div>
              <div className="overview-grid">
                <LeadList
                  state={state}
                  onLead={(lead) => setLeadDialog({ lead })}
                  onNew={() => setLeadDialog({ lead: null })}
                />
                <Attention state={state} onLead={(lead) => setLeadDialog({ lead })} />
              </div>
            </>
          )}
          {page === 'Leads' && (
            <LeadList
              state={state}
              onLead={(lead) => setLeadDialog({ lead })}
              onNew={() => setLeadDialog({ lead: null })}
            />
          )}
          {page === 'Request form' && <RequestForm onSubmit={submitRequest} />}
          {page === 'Estimates' &&
            (editor ? (
              <EstimateEditor
                key={editor.leadId ?? 'new'}
                state={state}
                initialLeadId={editor.leadId}
                onSave={save}
                onCancel={() => setEditor(null)}
              />
            ) : (
              <EstimateList state={state} onEdit={openEstimate} onNew={() => openEstimate()} />
            ))}
          {leadDialog && (
            <LeadDialog
              key={leadDialog.lead?.id ?? 'new'}
              lead={leadDialog.lead}
              onClose={() => setLeadDialog(null)}
              onSave={updateLead}
              onEstimate={(lead) => openEstimate(lead.id)}
            />
          )}
        </>
      )}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start fresh with demo data?</DialogTitle>
            <DialogDescription>
              This replaces your QuoteFlow leads and estimates in this browser with the original
              fictional examples. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="dialog-actions">
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              Keep my changes
            </Button>
            <Button variant="destructive" onClick={reset} disabled={busy}>
              {busy ? 'Resetting…' : 'Reset workspace'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
