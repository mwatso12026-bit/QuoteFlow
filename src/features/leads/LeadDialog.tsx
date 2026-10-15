import { useRef, useState, type FormEvent } from 'react'
import { ArrowRight, Mail, CalendarDays } from 'lucide-react'
import {
  statuses,
  leadInputSchema,
  type Lead,
  type LeadInput,
  type Status,
} from '../../domain/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Field } from '../../components/Field'
import { StatusBadge } from '../../components/StatusBadge'
export function LeadDialog({
  lead,
  onClose,
  onSave,
  onEstimate,
}: {
  lead: Lead | null
  onClose: () => void
  onSave: (input: LeadInput, status: Status) => Promise<void>
  onEstimate: (lead: Lead) => void
}) {
  const opener = useRef(document.activeElement as HTMLElement | null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy) return
    const form = new FormData(e.currentTarget)
    const parsed = leadInputSchema.safeParse(Object.fromEntries(form))
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }
    setBusy(true)
    try {
      await onSave(parsed.data, (form.get('status') as Status) || 'New')
      onClose()
    } catch {
      setError('Could not update this lead. Please try again.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="lead-dialog"
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          if (opener.current?.isConnected) opener.current.focus()
        }}
      >
        <DialogHeader>
          <DialogTitle>{lead ? 'Lead details' : 'Add a new lead'}</DialogTitle>
          <DialogDescription>
            {lead
              ? 'Keep the details clear and the next step simple.'
              : 'Start a new opportunity with a few details.'}
          </DialogDescription>
        </DialogHeader>
        {lead && (
          <div className="lead-meta">
            <StatusBadge status={lead.status} />
            <span>
              <CalendarDays size={14} />
              {new Date(lead.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        )}
        <form noValidate onSubmit={submit}>
          <div className="form-grid">
            <Field label="Customer name" id="lead-name">
              <Input id="lead-name" name="customerName" defaultValue={lead?.customerName} />
            </Field>
            <Field label="Email address" id="lead-email">
              <Input id="lead-email" name="email" type="email" defaultValue={lead?.email} />
            </Field>
            <Field label="Phone number (optional)" id="lead-phone">
              <Input id="lead-phone" name="phone" defaultValue={lead?.phone} />
            </Field>
            <Field label="Service needed" id="lead-service">
              <Input id="lead-service" name="service" defaultValue={lead?.service} />
            </Field>
          </div>
          <Field label="Project details" id="lead-description">
            <Textarea
              id="lead-description"
              name="description"
              defaultValue={lead?.description}
              rows={3}
            />
          </Field>
          <Field label="Lead status" id="lead-status">
            <select id="lead-status" name="status" defaultValue={lead?.status ?? 'New'}>
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
          <div className="dialog-actions">
            {lead && (
              <Button type="button" variant="outline" onClick={() => onEstimate(lead)}>
                Open estimate
                <ArrowRight size={14} />
              </Button>
            )}
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save lead'}
            </Button>
          </div>
        </form>
        <p className="dialog-note">
          <Mail size={13} />
          Demo workspace · Nothing is emailed or sent.
        </p>
      </DialogContent>
    </Dialog>
  )
}
