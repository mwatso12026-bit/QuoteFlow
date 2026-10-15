import { itemSchema, type EstimateItem } from './types'
export function parsePrice(value: string): number {
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim()))
    throw new Error('Use a non-negative price with up to two decimals.')
  const cents = Math.round(Number(value) * 100)
  if (!Number.isSafeInteger(cents) || cents > 100000000)
    throw new Error('Price must be at most $1,000,000.')
  return cents
}
export function estimateTotal(items: EstimateItem[]): number {
  if (!items.length) throw new Error('Add at least one line item.')
  const total = items.reduce((sum, item) => {
    itemSchema.parse(item)
    return sum + item.quantity * item.unitPriceCents
  }, 0)
  if (!Number.isSafeInteger(total)) throw new Error('Estimate total is too large.')
  return total
}
export const money = (cents: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100)
