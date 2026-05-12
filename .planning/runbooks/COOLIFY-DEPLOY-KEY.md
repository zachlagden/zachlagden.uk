# Coolify Deploy Key — GitHub Recovery

**Phase:** 5 (discovered during 05-04 smoke test, 2026-05-12)
**Owner:** zachlagden
**Coolify app:** zachlagden-uk (UUID `swcs4gkg8ws4g48k8wo4c8go`)
**Repo:** `https://github.com/zachlagden/zachlagden.uk`

## What this runbook is for

Coolify deploys this app by `git clone`-ing the GitHub repo over SSH using a per-Coolify-instance deploy key. If that key is ever revoked / removed from the GitHub repo's deploy keys page, every subsequent redeploy fails before the build step — Coolify logs show:

```
Cloning into 'XXX' ...
git@github.com: Permission denied (publickey).
fatal: Could not read from remote repository.
Please make sure you have the correct access rights and the repository exists.
```

This was the FIRST failure encountered during the 05-04 production smoke test (smoke test triggered a redeploy after env-var changes). Recovery took ~30 seconds once the symptom was understood.

## Coolify deploy-key reference

| Field | Value |
| --- | --- |
| Coolify private_key_id | `1` |
| Fingerprint | `SHA256:IXd0UiBbMExW+wtASb3Iplnmmk1XI4dYSk+07IjmAZ4` |
| Public key (full literal) | `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICOSlaEDj1RLPHUAJOScUXpjQO69mHkzjkJ01IZ3rcwY` |

This is the only Coolify SSH key in use for the personal Coolify instance — see `/api/v1/security/keys` filtered by `is_git_related: true`.

The key is a public key, safe to commit. The matching private key lives only on the Coolify host (`zl-vps01`) and is managed by Coolify internally.

## Symptom recognition

You will see this failure mode when:

1. A Coolify redeploy is triggered (manually or by webhook) and the deployment status flips to `failed` within ~5 seconds.
2. Coolify deployment logs (`GET /api/v1/deployments/{deployment_uuid}`) show the `Permission denied (publickey)` line above before any build step runs.
3. `https://github.com/zachlagden/zachlagden.uk/settings/keys` either does not list a deploy key with fingerprint `SHA256:IXd0UiBbMExW+wtASb3Iplnmmk1XI4dYSk+07IjmAZ4`, or the key is listed as "Revoked".

If the deploy fails LATER in the pipeline (e.g. `pnpm install`, `pnpm build`, container start) the deploy key is fine — this runbook does not apply.

## Recovery procedure

### Option A — UI (recommended for one-off recovery)

1. Visit `https://github.com/zachlagden/zachlagden.uk/settings/keys`.
2. Click **Add deploy key**.
3. **Title:** `Coolify (lagden.dev)` (or any descriptive label).
4. **Key:** paste the literal public key above (`ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICOSlaEDj1RLPHUAJOScUXpjQO69mHkzjkJ01IZ3rcwY`).
5. **Allow write access:** leave UNCHECKED. Coolify only reads.
6. Click **Add key**.
7. In Coolify, trigger a fresh redeploy:
   ```bash
   export COOLIFY_TOKEN="<from ~/.claude/credentials/personal-infra.md>"
   curl -sf -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "https://coolify.lagden.dev/api/v1/deploy?uuid=swcs4gkg8ws4g48k8wo4c8go"
   ```
8. Tail the deployment to confirm clone succeeds:
   ```bash
   curl -sf -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "https://coolify.lagden.dev/api/v1/deployments/<deployment-uuid-from-step-7-response>" \
     | jq -r '.logs[]?.line' | head -50
   ```

### Option B — GitHub API (scriptable)

If you have a PAT with `admin:public_key` or `repo` scope, the deploy key can be re-added via API:

```bash
GH_TOKEN=<personal access token with repo or admin:public_key scope>
curl -sf -X POST \
  -H "Authorization: token $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/repos/zachlagden/zachlagden.uk/keys" \
  -d '{
    "title": "Coolify (lagden.dev)",
    "key": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICOSlaEDj1RLPHUAJOScUXpjQO69mHkzjkJ01IZ3rcwY",
    "read_only": true
  }'
```

The current `GITHUB_PAT` in Coolify (`read:user` scope only) does NOT have permission to add deploy keys. Use a separate token if scripting this — do NOT widen the Coolify PAT scope just for this.

## How to look up the deploy-key public key if this runbook is ever lost

The public key can be re-derived from Coolify directly:

```bash
export COOLIFY_TOKEN="<from ~/.claude/credentials/personal-infra.md>"
curl -sf -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "https://coolify.lagden.dev/api/v1/security/keys" \
  | jq '.[] | select(.is_git_related == true) | {id, name, fingerprint, public_key}'
```

The response includes the `public_key` field literal. Compare its fingerprint to the value above to confirm you have the right key.

## Why this happened

GitHub's deploy-key UI does not warn before a deletion. The most likely causes for a missing key are:

- A repo-settings hygiene pass deleted "unused" SSH keys.
- The repo was transferred / re-imported (Coolify keys are NOT carried across transfers).
- The user manually rotated the key without re-adding the new one (Coolify does not auto-sync this).
- A different repo on the same Coolify instance had its deploy key cleaned up and this one was deleted by mistake.

None of these are recoverable by Coolify — Coolify never deletes its own keys. Re-adding the key is always safe.

## Related runbooks

- **`.planning/runbooks/ENV-VARS.md`** — Coolify env-var management (the redeploy after this fix is normally what propagates env changes to the running container).
- **`.planning/runbooks/AUTH-SMOKE-TEST.md`** — the smoke test that surfaced this failure mode for the first time.

---
*Captured: 2026-05-12*
*Last reviewed: 2026-05-12 — first authoring; no prior reviews*
