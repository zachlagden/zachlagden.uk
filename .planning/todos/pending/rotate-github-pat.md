# Rotate GITHUB_PAT to a fine-grained PAT with explicit expiry

**Deadline:** 2027-05-12 (12 months from Plan 05-03 completion)
**Created:** 2026-05-12 (Plan 05-03)
**Priority:** Medium — current PAT is functionally correct but does not meet D-06's "≤ 1 year expiry" and "fine-grained" criteria.

## Why this is owed

Plan 05-03 (Phase 5) provisioned a `GITHUB_PAT` in Coolify for the Phase 7 GitHub heatmap integration. The user supplied a **classic PAT** with `read:user` scope and no recorded expiry, deviating from D-06 which mandates:

- Token type: fine-grained personal access token
- Repository access: "No repository access"
- Account permissions: "Profile: Read-only"
- Expiry: ≤ 1 year

The current PAT works (validated against `GET /user` and the `viewer.contributionsCollection` GraphQL query) and has no repo access (no `repo` scope), so Phase 7 is unblocked. But the rotation forcing function is missing — without an automated expiry, there is no natural prompt to rotate the credential.

See `.planning/runbooks/ENV-VARS.md` → "GITHUB_PAT details" → "Deviations from D-06" for the full context.

## Scope

1. Visit https://github.com/settings/personal-access-tokens/new
2. Create a new **fine-grained PAT** with these exact settings:
   - **Token name:** `zachlagden-uk-stats-page-pat-2027`
   - **Resource owner:** `zachlagden` (personal account)
   - **Expiration:** custom date 11–12 months from creation date (do NOT pick "No expiration" or > 12 months)
   - **Repository access:** "No repository access"
   - **Account permissions:** Profile → Read-only. Every other Account permission → "No access".
   - **Organization permissions:** all "No access"
3. Generate the token; save to password manager immediately.
4. Update Coolify env:
   - Find the existing `GITHUB_PAT` entries (one runtime, one preview) via `GET /api/v1/applications/{uuid}/envs`
   - Replace the value of both via the Coolify API (PATCH if supported, or DELETE + POST)
   - See the "Coolify env-var endpoint quirks" section in `.planning/runbooks/ENV-VARS.md`
5. Trigger a Coolify redeploy.
6. Verify `/stats` (Phase 7) still renders the GitHub heatmap correctly.
7. Revoke the old classic PAT at https://github.com/settings/tokens.
8. Update `.planning/runbooks/ENV-VARS.md` GITHUB_PAT details:
   - Provisioned date → new date
   - Expires → new expiry date (no longer "unknown")
   - Scope → "fine-grained, Profile: Read-only, no repo access"
   - Delete the entire "Deviations from D-06" section (no longer applicable)
9. Close this todo (move to `.planning/todos/done/`).

## Acceptance

- [ ] New fine-grained PAT created on GitHub with expiry ≤ 12 months
- [ ] Coolify `GITHUB_PAT` entries (both runtime + preview) updated to new value
- [ ] Coolify redeploy succeeds, health endpoint returns 200
- [ ] `/stats` still renders heatmap (Phase 7 dependency intact)
- [ ] Old classic PAT revoked on GitHub
- [ ] ENV-VARS.md updated to reflect compliance with D-06

## Related

- `.planning/phases/05-dependency-hardening-env-config/05-CONTEXT.md` decision D-06
- `.planning/phases/05-dependency-hardening-env-config/05-03-SUMMARY.md` deviations section
- `.planning/runbooks/ENV-VARS.md` GITHUB_PAT details
- `.planning/research/PITFALLS.md` Pitfall 7 (PAT over-scoping)
