# Future backend roadmap

Not implemented in the demo phase.

1. Preserve the typed repository interface while replacing localStorage with an authenticated Supabase adapter.
2. Model businesses, business_members, leads, estimates, and estimate_items with UUIDs, timestamps, integer monetary cents, and tenant-consistent foreign keys.
3. Design membership provisioning and row-level security before enabling live data. Test cross-tenant denial for reads and writes, including child estimate items.
4. Add authentication session loading, signed-out screens, expired-session handling, and sign-out without exposing customer records.
5. Design rate limiting, validation, and abuse prevention for a public customer request endpoint; do not expose unrestricted database writes.
6. Plan validated demo-to-database migration and backups before accepting real customer data.

No keys, database, auth service, or deployment are provisioned by this plan. Server secrets never belong in client bundles or Git.
