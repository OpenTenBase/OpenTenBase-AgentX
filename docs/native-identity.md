# Native Agent identity operations v5.0.5

> Installed product: **OpenTenBase AgentX**; supported backends: **pg**; edition: **Community**; license: **Apache-2.0**. Other backends and Enterprise-only capabilities discussed below describe differences; they do not extend this package's scope.

[简体中文](native-identity_zh.md)

## Identity and retained facts

An Agent Principal, its PostgreSQL LOGIN role and its Gateway credentials are
different identities. Offboarding preserves the Principal, native mapping,
ownership history and audit; it does not delete the role or rotate its password.
Human administrators and platform system Agents are not business-Agent
offboarding targets. Database entities remain authoritative.

Each managed Agent maps to a unique database-bound PostgreSQL LOGIN role. Before
changing one role, the adapter verifies the current database, configured Owner,
exact Principal and unique mapping. Missing, ambiguous or changed mappings do
not authorize guessing a role name or falling back to Owner access.

## PostgreSQL administrator prerequisite

Use `scripts/deploy/0_pg_database_prerequisites.sql` and
[minimum privileges](minimum-privileges.md) to prepare the dedicated database,
bounded Owner, Agent role-management boundary and required extensions.
PostgreSQL role status comes from its native role catalog; OpenTenBase AgentX
does not require an additional administrator-created account-status view.
Runtime configuration must not contain PostgreSQL-superuser credentials.

Run packaged preflight/`verify` as the configured Owner. A missing mapping,
incorrect database binding or insufficient authority blocks the native operation;
it does not prove the Agent role is absent. Use isolated acceptance accounts to
verify independent Agent denial and unchanged access for another Agent and the
Owner. A passing preflight is not proof of HTTP enrollment or native enforcement.
Retain migration 105 and historical SQL/checksums unchanged.

## Offboard one managed Agent

Use the authenticated offboarding workflow with `agents.offboard` permission
and access to the exact Agent. The Dashboard API is
`POST /api/agents/{agent_id}/offboard`; it uses the Dashboard session cookie and
`X-CSRF-Token`, not an ordinary Agent's native credentials. Record a meaningful
reason and the correct owner/responsible-group/environment disposition.

For example, after independently confirming this disposition applies to the
selected business Agent, submit this JSON with its exact ID in the route:

```json
{
  "owner_type": "HUMAN",
  "has_responsible_group": false,
  "environment": "DEVELOPMENT",
  "reason": "Retire this approved development Agent"
}
```

These are disposition inputs, not a way to reclassify a production Agent to
obtain a desired outcome. Use the Agent's actual recorded responsibility and
environment and inspect the returned disposition; do not copy these example
values without checking the target.

Offboarding first commits the platform status, token/credential revocation,
delivery fencing and pending audit. Where that disposition requires native
revocation, a second step rechecks the exact mapping and blocks new native
logins by setting the exact PostgreSQL role to `NOLOGIN`. It also closes only this process's
tracked connections for that Agent. Other Agents, shared roles and Owner grants
must remain unchanged. No `DROP` or password rotation is used.

Native DDL, platform state and the final audit do not share a single atomic
transaction. A PostgreSQL account change does not make the preceding platform
transaction and the later result audit one atomic operation.
An HTTP success or disabled Principal alone does not establish native success;
inspect `native_identity_revocation` and its result audit.

| Result | Meaning within the reported native operation |
|---|---|
| `PENDING` | Preconditions could not establish authority to complete native revocation; retain the disabled platform state and investigate. |
| `PARTIAL` | Some work or observation/auditing failed; inspect the post-snapshot, local close failures and audit status. Do not claim complete revocation. |
| `COMPLETE` | New native logins are observed blocked, tracked local closes did not fail and the current identity checks passed. |
| `SKIPPED` | The selected disposition retains native identity; this is not proof that native login is disabled. |

For the final audited result, also require `audit_status=RECORDED`. Preserve the
operation ID, database fingerprint and before/after facts. Unknown observation
fields remain unknown, not false or zero. Retry only through the authorized
workflow after resolving the cause; do not unlock, reenroll, clear history or
broaden privileges merely to obtain a successful status.

## Existing sessions and incidents

`COMPLETE` is a limited new-login/local-cache result. It does not assert that
external existing database sessions have terminated, all business reads/writes
are blocked, other application processes closed their pools, or a remote Agent
process stopped. `existing_sessions_closed` and `business_access_blocked` remain
unknown unless separately observed. A new-login rejection and a successful
query on an older external session can both be true.

If incident containment requires terminating existing sessions or processes,
use a separately authorized DBA/infrastructure procedure for exact targets and
verify its actual result. Do not kill unrelated sessions or all platform work.
Keep retained audit and independent-canary observations. See
[security](security.md), [recovery](recovery.md) and
[migration](migration.md).
