import type { Lead, Status, StoredState } from '../domain/types'
export function makeDemoData(now = new Date()): StoredState {
  const samples: [string, string, Status, number, string][] = [
    [
      'Olivia Bennett',
      'Kitchen painting',
      'Quoted',
      245000,
      'Refresh kitchen walls and trim with a warm white finish.',
    ],
    [
      'Marcus Reed',
      'Fence repair',
      'New',
      0,
      'Repair two loose panels and replace a damaged gate latch.',
    ],
    [
      'Ava Thompson',
      'Yard cleanup',
      'Won',
      68000,
      'Seasonal cleanup, leaf removal, and garden bed edging.',
    ],
    [
      'Noah Brooks',
      'Deck restoration',
      'Quoted',
      320000,
      'Clean, sand, and stain a 240 square foot deck.',
    ],
    ['Ella Martinez', 'Interior painting', 'Lost', 185000, 'Paint two bedrooms and the hallway.'],
    [
      'Liam Carter',
      'Gutter cleaning',
      'New',
      0,
      'Clear gutters and inspect downspouts on a two-story home.',
    ],
    [
      'Sofia Chen',
      'Bathroom refresh',
      'Quoted',
      148000,
      'Replace caulk, paint walls, and install towel fixtures.',
    ],
    [
      'James Wilson',
      'Patio pressure wash',
      'New',
      0,
      'Pressure wash concrete patio and front walkway.',
    ],
  ]
  const leads: Lead[] = samples.map(([customerName, service, status, , ,], i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - i - 1)
    const at = date.toISOString()
    return {
      id: crypto.randomUUID(),
      customerName,
      service,
      status,
      email: customerName.toLowerCase().replace(' ', '.') + '@example.com',
      description: samples[i][4],
      phone: '',
      createdAt: at,
      updatedAt: at,
      closedAt: status === 'Won' || status === 'Lost' ? at : null,
    }
  })
  const estimates = samples.flatMap((s, i) =>
    s[3]
      ? [
          {
            id: crypto.randomUUID(),
            leadId: leads[i].id,
            items: [
              {
                id: crypto.randomUUID(),
                description: s[1] + ' — labor and materials',
                quantity: 1,
                unitPriceCents: s[3],
              },
            ],
            notes: 'Includes materials and site cleanup. Valid for 30 days.',
            createdAt: leads[i].createdAt,
            updatedAt: leads[i].updatedAt,
          },
        ]
      : [],
  )
  return { schemaVersion: 1, leads, estimates }
}
