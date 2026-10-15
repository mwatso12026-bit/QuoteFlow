import type { Status } from '../domain/types'
export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={'status-badge status-' + status.toLowerCase()}>
      <span />
      {status}
    </span>
  )
}
export function Initials({ name }: { name: string }) {
  return (
    <span className={'initials tone-' + (name.charCodeAt(0) % 4)}>
      {name
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')}
    </span>
  )
}
