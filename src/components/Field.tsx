import type { ReactNode } from 'react'
export function Field({
  label,
  id,
  children,
  hint,
}: {
  label: string
  id: string
  children: ReactNode
  hint?: string
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  )
}
