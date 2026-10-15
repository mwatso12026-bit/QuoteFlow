import { useRef, useState, type FormEvent } from 'react'
import { Plus, Trash2, Check, FileText } from 'lucide-react'
import type { StoredState, Estimate } from '../../domain/types'
import { estimateSchema } from '../../domain/types'
import { parsePrice, estimateTotal, money } from '../../domain/money'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Field } from '../../components/Field'
type DraftItem = { id: string; description: string; quantity: string; price: string }
const blank = (): DraftItem => ({
  id: crypto.randomUUID(),
  description: '',
  quantity: '1',
  price: '0',
})
export function EstimateEditor({
  state,
  initialLeadId,
  onSave,
  onCancel,
}: {
  state: StoredState
  initialLeadId?: string
  onSave: (estimate: Estimate) => Promise<void>
  onCancel: () => void
}) {
  const initial = state.estimates.find((e) => e.leadId === initialLeadId)
  const [leadId, setLeadId] = useState(initialLeadId ?? '')
  const [items, setItems] = useState<DraftItem[]>(
    initial
      ? initial.items.map((i) => ({
          ...i,
          quantity: String(i.quantity),
          price: (i.unitPriceCents / 100).toFixed(2),
        }))
      : [blank()],
  )
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const guard = useRef(false)
  function choose(id: string) {
    setLeadId(id)
    const existing = state.estimates.find((e) => e.leadId === id)
    setItems(
      existing
        ? existing.items.map((i) => ({
            ...i,
            quantity: String(i.quantity),
            price: (i.unitPriceCents / 100).toFixed(2),
          }))
        : [blank()],
    )
    setNotes(existing?.notes ?? '')
    setError('')
  }
  function update(id: string, key: keyof DraftItem, value: string) {
    setItems((current) => current.map((i) => (i.id === id ? { ...i, [key]: value } : i)))
  }
  let total = 0
  let validTotal = true
  try {
    total = items.reduce((s, i) => {
      const q = Number(i.quantity)
      if (!Number.isInteger(q) || q <= 0 || q > 100000) throw Error()
      return s + q * parsePrice(i.price)
    }, 0)
  } catch {
    validTotal = false
  }
  async function submit(e: FormEvent) {
    e.preventDefault()
    if (guard.current) return
    setError('')
    try {
      if (!leadId) throw Error('Select a customer before saving.')
      if (!items.length) throw Error('Add at least one line item.')
      const existing = state.estimates.find((e) => e.leadId === leadId)
      const at = new Date().toISOString()
      const draft = {
        id: existing?.id ?? crypto.randomUUID(),
        leadId,
        items: items.map((i) => ({
          id: i.id,
          description: i.description.trim(),
          quantity: Number(i.quantity),
          unitPriceCents: parsePrice(i.price),
        })),
        notes,
        createdAt: existing?.createdAt ?? at,
        updatedAt: at,
      }
      const parsed = estimateSchema.safeParse(draft)
      if (!parsed.success)
        throw Error(
          'Each item needs a description, a positive whole-number quantity (up to 100,000), and a valid price. Keep notes under 5,000 characters.',
        )
      estimateTotal(parsed.data.items)
      guard.current = true
      setBusy(true)
      await onSave(parsed.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save estimate.')
    } finally {
      guard.current = false
      setBusy(false)
    }
  }
  return (
    <section className="panel estimate-editor">
      <form noValidate onSubmit={submit}>
        <div className="estimate-editor-header">
          <div>
            <span className="section-eyebrow">ESTIMATE STUDIO</span>
            <h2>Make your next great offer.</h2>
            <p className="section-description">Clear scope. Fair pricing. A confident next step.</p>
          </div>
          <span className="large-icon">
            <FileText size={25} />
          </span>
        </div>
        <Field label="Customer" id="estimate-customer">
          <select id="estimate-customer" value={leadId} onChange={(e) => choose(e.target.value)}>
            <option value="">Choose a lead…</option>
            {state.leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.customerName} · {l.service}
              </option>
            ))}
          </select>
        </Field>
        <div className="line-items-heading">
          <h3>Scope of work</h3>
          <span>All prices in USD</span>
        </div>
        <div className="estimate-items">
          {items.map((item, index) => (
            <div className="estimate-item" key={item.id}>
              <Field label={'Item ' + (index + 1) + ' description'} id={'description-' + item.id}>
                <Input
                  id={'description-' + item.id}
                  value={item.description}
                  onChange={(e) => update(item.id, 'description', e.target.value)}
                  placeholder="Labor, materials, or service…"
                />
              </Field>
              <Field label={'Item ' + (index + 1) + ' quantity'} id={'quantity-' + item.id}>
                <Input
                  id={'quantity-' + item.id}
                  type="number"
                  min={1}
                  step={1}
                  value={item.quantity}
                  onChange={(e) => update(item.id, 'quantity', e.target.value)}
                />
              </Field>
              <Field label={'Item ' + (index + 1) + ' price'} id={'price-' + item.id}>
                <Input
                  id={'price-' + item.id}
                  inputMode="decimal"
                  value={item.price}
                  onChange={(e) => update(item.id, 'price', e.target.value)}
                />
              </Field>
              <Button
                aria-label={'Remove item ' + (index + 1)}
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => setItems((current) => current.filter((i) => i.id !== item.id))}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={items.length >= 100}
          onClick={() => setItems((current) => [...current, blank()])}
        >
          <Plus size={15} />
          Add line item
        </Button>
        <div className="estimate-summary">
          <div>
            <span>Estimate total</span>
            <p>Labor and materials · No tax added</p>
          </div>
          <strong data-testid="estimate-total">{validTotal ? money(total) : '—'}</strong>
        </div>
        <Field label="Notes (optional)" id="estimate-notes">
          <Textarea
            id="estimate-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What's included, timing, or anything else the customer should know."
            rows={3}
          />
        </Field>
        {error && (
          <p role="alert" className="error-banner">
            {error}
          </p>
        )}
        <div className="form-bottom">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            <Check size={16} />
            {busy ? 'Saving…' : 'Save estimate'}
          </Button>
        </div>
        <p className="dialog-note">
          Saving quotes new leads. Won and Lost leads keep their status. No email is sent.
        </p>
      </form>
    </section>
  )
}
