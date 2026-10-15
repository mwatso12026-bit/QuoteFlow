import { z } from 'zod'
export const statuses = ['New', 'Quoted', 'Won', 'Lost'] as const
export type Status = (typeof statuses)[number]
export const leadInputSchema = z.object({
  customerName: z.string().trim().min(1, 'Enter a customer name.').max(120),
  email: z.email('Enter a valid email address.').trim(),
  phone: z.string().trim().max(40).optional(),
  service: z.string().trim().min(1, 'Enter a service.').max(120),
  description: z.string().trim().min(1, 'Describe the requested work.').max(5000),
})
export const leadSchema = leadInputSchema.extend({
  id: z.uuid(),
  status: z.enum(statuses),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  closedAt: z.iso.datetime().nullable(),
})
export const itemSchema = z.object({
  id: z.uuid(),
  description: z.string().trim().min(1, 'Describe each line item.').max(500),
  quantity: z.number().int().positive().max(100000),
  unitPriceCents: z.number().int().nonnegative().max(100000000),
})
export const estimateSchema = z.object({
  id: z.uuid(),
  leadId: z.uuid(),
  items: z.array(itemSchema).min(1, 'Add at least one line item.').max(100),
  notes: z.string().max(5000),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})
export const stateSchema = z
  .object({
    schemaVersion: z.literal(1),
    leads: z.array(leadSchema),
    estimates: z.array(estimateSchema),
  })
  .superRefine((s, ctx) => {
    const leads = new Set(s.leads.map((l) => l.id))
    const used = new Set<string>()
    const estimateIds = new Set<string>()
    if (leads.size !== s.leads.length) ctx.addIssue({ code: 'custom', message: 'Duplicate leads' })
    for (const e of s.estimates) {
      if (
        !leads.has(e.leadId) ||
        used.has(e.leadId) ||
        estimateIds.has(e.id) ||
        new Set(e.items.map((i) => i.id)).size !== e.items.length
      )
        ctx.addIssue({ code: 'custom', message: 'Invalid estimate relationship' })
      used.add(e.leadId)
      estimateIds.add(e.id)
    }
  })
export type LeadInput = z.infer<typeof leadInputSchema>
export type Lead = z.infer<typeof leadSchema>
export type EstimateItem = z.infer<typeof itemSchema>
export type Estimate = z.infer<typeof estimateSchema>
export type StoredState = z.infer<typeof stateSchema>
