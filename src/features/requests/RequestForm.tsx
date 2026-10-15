import { useRef, useState, type FormEvent } from 'react'
import { ArrowRight, CheckCircle2, ClipboardList, ShieldCheck } from 'lucide-react'
import { leadInputSchema, type LeadInput } from '../../domain/types'
import { Field } from '../../components/Field'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Button } from '../../components/ui/button'
export function RequestForm({ onSubmit }: { onSubmit: (input: LeadInput) => Promise<void> }) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState(false)
  const guard = useRef(false)
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (guard.current) return
    const form = e.currentTarget
    const parsed = leadInputSchema.safeParse(Object.fromEntries(new FormData(form)))
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])))
      return
    }
    guard.current = true
    setBusy(true)
    setErrors({})
    setSuccess(false)
    try {
      await onSubmit(parsed.data)
      form.reset()
      setSuccess(true)
    } catch {
      setErrors({ form: 'Could not submit the request. Please try again.' })
    } finally {
      guard.current = false
      setBusy(false)
    }
  }
  const input = (name: string, label: string, placeholder: string, type = 'text') => (
    <Field label={label} id={'request-' + name}>
      <Input
        id={'request-' + name}
        name={name}
        type={type}
        placeholder={placeholder}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? 'error-' + name : undefined}
      />
      {errors[name] && (
        <span className="field-error" id={'error-' + name}>
          {errors[name]}
        </span>
      )}
    </Field>
  )
  return (
    <div className="request-layout">
      <section className="panel request-panel">
        <div className="form-intro">
          <span className="section-eyebrow">LET’S GET TO WORK</span>
          <h2>Tell us about your project.</h2>
          <p>A great result starts with a few details.</p>
        </div>
        {success && (
          <div className="success-banner" role="status">
            <CheckCircle2 size={20} />
            <span>
              <strong>Request received</strong>
              <br />
              Your new lead is ready in the lead pipeline.
            </span>
          </div>
        )}
        <form noValidate onSubmit={submit}>
          <div className="form-grid">
            {input('customerName', 'Customer name', 'e.g. Alex Morgan')}
            {input('email', 'Email address', 'alex@example.com', 'email')}
            {input('phone', 'Phone number (optional)', 'e.g. 202-555-0142', 'tel')}
            {input('service', 'Service needed', 'e.g. Interior painting')}
          </div>
          <Field label="Project details" id="request-description">
            <Textarea
              id="request-description"
              name="description"
              rows={5}
              placeholder="Tell us what you have in mind, including any helpful details…"
              aria-invalid={!!errors.description}
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </Field>
          {errors.form && <p role="alert">{errors.form}</p>}
          <div className="form-bottom">
            <span>
              <ShieldCheck size={15} />
              Demo requests stay in this browser.
            </span>
            <Button type="submit" disabled={busy}>
              {busy ? 'Submitting…' : 'Submit request'}
              <ArrowRight size={16} />
            </Button>
          </div>
        </form>
      </section>
      <aside className="request-aside">
        <span className="large-icon">
          <ClipboardList size={30} />
        </span>
        <h2>
          Make the first step
          <br />
          the easiest one.
        </h2>
        <p>
          This is a preview of your customer intake experience. Each submission becomes a new lead,
          ready for you to review and quote.
        </p>
        <ol>
          <li>
            <span>01</span>Capture the request
          </li>
          <li>
            <span>02</span>Build a clear estimate
          </li>
          <li>
            <span>03</span>Win the next job
          </li>
        </ol>
        <div className="demo-note">
          Demo only · Use fictional details.
          <br />
          No request is sent to a business.
        </div>
      </aside>
    </div>
  )
}
