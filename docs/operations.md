# OpenTenBase AgentX v5.0.5 Operations and Technical Documentation

> Installed product: **OpenTenBase AgentX**; supported backends: **pg**; edition: **Community**; license: **Apache-2.0**. Other backends and Enterprise-only capabilities discussed below describe differences; they do not extend this package's scope.

[简体中文](operations_zh.md)

This guide covers deployment, migration, recovery, permissions, models and
acceptance for the current package. The steps and linked English guides can be
read independently. Work handover, context, candidate review and the Skill
client are covered in the [continuity operations manual](continuity-operations.md).

## Selecting people and Agents

For Channel membership, ownership transfer, branches and authorization, search
by name or username and select the intended Principal. People and Agents may
share a display name; check the type. The selector submits the immutable ID.

Add a person or Agent to the Channel's Security Domain first, then use
**Channels → Manage → Select members**. Candidates exclude inactive, expired or
existing Channel members. Channel membership never grants Domain access.
Platform management Channels accept only the required subjects and roles.

A Business Agent request may identify its Human owner by an existing username.
The approved Agent retains the request's readable name. Community permits an
authorized administrator to process their own request; Enterprise requires
another authorized administrator. The server enforces the template's minimum
isolation level.

## Deployment

OpenTenBase AgentX is a PostgreSQL-only Community product. Prepare a dedicated
PostgreSQL database and bounded Owner. A baseline, system or existing business
database is not an empty initialization target. The DBA prepares backup and
recovery, network access, role management and the AGE/vector/job-extension
prerequisites in `scripts/deploy/0_pg_database_prerequisites.sql`. Owner and
Agent LOGIN roles remain separate; ordinary Agents cannot bypass forced RLS.
The authorized validation environment uses PostgreSQL 18.6; deployment still
requires checking the chosen target's prerequisites.

Verify the supplied digest and, when required, use an independently obtained
public key with [release verification](release-signing.md). Install Python 3.14+
on a supported Linux/glibc environment. From the extracted package root:

```bash
install -m 600 config.example.json config.json
# Fill in private PostgreSQL connection and security settings before continuing.
export CX_CONFIG_PATH=/absolute/path/config.json
bash scripts/install_offline.sh --database pg
bash scripts/install_platform.sh initialize --version 5.0.5 \
  --database pg --edition community --config "$CX_CONFIG_PATH"
./start_web_server.sh start
```

Set `database.type=pg` and the real `host`, `port` and `dbname`. Keep the exported
path and any selected `CX_VENV_DIR` consistent in every shell or service manager.
The offline installer creates this product's `.venv` and installs its PostgreSQL
dependencies; global installation is unnecessary. The listener port must be
1–65535. External access also depends on routing, firewall and proxy policy.

Initialization uses the deterministic Bootstrap Deployment Agent, not an
external Agent or model. It checks the empty target, prerequisites, baseline and
ordered migrations; prompts for a deployment-specific password of at least 12
characters; creates the Human administrator and native management identity; and
retires the temporary deployment identity. No universal default password exists.
PostgreSQL needs no additional account-status view. After interruption, inspect
the journal and resume through the same deployment entry point; do not skip
failed steps or classify unknown objects as empty.

Restrict private configuration and the encryption master key to the operating
account. Preserve the existing `~/.ai-agent-infra/master.key`; a different key
cannot decrypt existing ciphertext. Business Agents use only their independent
credentials, never an Owner fallback.

Check `/api/health`, `/api/ready`, login and database governance separately.
None alone proves release acceptance. Recheck deployment with:

```bash
export CX_CONFIG_PATH=/absolute/path/config.json
bash scripts/install_platform.sh verify --version 5.0.5 \
  --database pg --edition community --config "$CX_CONFIG_PATH"
```

Set `CX_PUBLIC_BASE_URL` for an approved reverse proxy; platform model relay
addresses are not arbitrary third-party relays. Before stopping, confirm the
installation directory, process and port, then use `./start_web_server.sh stop`.
See [deployment](deployment.md) and [native identity](native-identity.md).

## Upgrade and migration

The sole `scripts/deploy/baseline_v*.json` is this product's PostgreSQL contract.
v5.0.1 adds 103–105 after the v5.0.0 migration-102 chain. Exact product identity,
APPLIED checksums, actual predecessor structures, native protection and current
postflight must all match; a terminal ledger row is insufficient. Older SQL
filenames remain unchanged for journal/checksum continuity and do not authorize
cross-product upgrades.

For v5.0.5, verify the complete PostgreSQL chain through **121**, including
120 before 119 and 121's own-context reads and other/forged/write denials.
The current upgrade uses `--from-version 5.0.4`; follow [migration](migration.md).

Record the current product, database, Owner, configuration, encryption keys,
running writers and checksums. Complete native backup and a recovery drill.
Never reinitialize existing data. Run the journaled PostgreSQL/Community path
in [migration](migration.md), preserving private recovery state.

Drain only writers affected by the migration, retaining leases and bounded
in-flight work. Restore them after strict structure, dependency, permission and
readiness checks. Preserve Task history, Work/Handoff revisions and original
Gateway credential bindings. Applied SQL and structure manifests must retain
their original checksums. On failure retain the old directory and journal and
resume the recorded phase; do not stop unrelated services or clear a database
to hide a defect.

## Recovery and isolation

The database owns runtime state, leases, fencing, Tasks, checkpoints and audit.
A restart reclaims only expired local-node leases; stale Workers cannot commit
old fences. Database unavailability stops new effects, rather than enabling an
in-memory authorization bypass. Replication, backup, standby failover and
RPO/RTO remain operator duties.

An uncertain context-model outcome records `UNOBSERVED` without automatic
resend. A replacement token cannot authorize an old request whose original
Gateway credential was revoked. Work, handoff, review and input receipts retain
history; revoked access or deleted sources block later reads without erasing
audit facts.

Control-plane startup and safe execution of untrusted Agents are separate
admission decisions. Strong isolation requires independent UID/GID, workspace,
namespaces, cgroup v2, seccomp, read-only root, minimal capabilities and a
protected Host Manager. Verify the exact image, kernel, policies and patches
with the packaged host gate. Current dependencies require glibc 2.34+ and a
supported Linux baseline; retired RHEL/Oracle Linux 8 is not supported by this
package.

Agents bypassing the managed runner do not have verified process isolation or
termination. The cooperative Skill client holds a shared process lock for each
managed turn, switches atomically at an exclusive safe point and retains old
files. It cannot constrain independent processes that bypass it. Database grants
do not establish host isolation. See [recovery](recovery.md),
[runtime isolation](runtime-isolation.md) and
[Linux compatibility](linux-platform-compatibility.md).

## Security and permissions

Humans, platform Agents, external Agents and the Schema Owner are distinct
identities. Invalid credentials never fall back to deployment credentials.
Knowledge uses company-public, organization-subtree, hierarchy-level and
Human/Agent-private scopes. Security Domains authorize collaboration; Channels
do not widen data access. AgentX retains mandatory authorization and audit
writing, but does not include Enterprise approval, Compliance Agent or audit-view
modules. See [security](security.md) and [minimum privileges](minimum-privileges.md).

## Native Agent offboarding

Use the authorized Agent offboarding workflow, not a direct account DDL or
compatibility decommission operation. Inspect `native_identity_revocation` and
require `status=COMPLETE` with `audit_status=RECORDED` for the reported
new-login/local-connection result. Keep PENDING/PARTIAL failures for exact
reconciliation and retain identity mappings and audit. A disabled Principal,
revoked token or locked login does not prove every existing external session
or remote process has stopped. Follow [native identity operations](native-identity.md)
for permission, disposition, result and incident-containment boundaries.

## Models, MCP and A2A

Model/tool posture distinguishes `OFF`, `READ_ONLY`, `PROPOSAL_ONLY` and
`GOVERNED_EXECUTOR`. MCP continuity clients authenticate through the Gateway;
dynamic tools need explicit per-tool exposure and current invocation authority.
A2A supports bounded, controlled HTTP JSON 1.0.1 operations. Capability state
and authorization are checked separately; this is not full protocol/SDK support.
Model-generated writes, policy changes, Agent control, external contacts and
releases default to proposals.

Provider evidence records model identity, verification, tool proposals, usage,
latency, timeout, cancellation, retry and terminal state, without hidden
reasoning or full prompts. Unobserved direct traffic is not zero consumption.

A Provider Profile defines its URL, model ID and use scope. Keyless services may
use an empty API key. Health requires a valid completion from the intended
model; endpoint reachability is insufficient. Profiles still referenced by
Portal, active native Agents or pending requests cannot be retired. The optional
gateway permits direct and gateway routes to coexist, metering only observed
traffic.

Portal retrieval intersects Human and Agent access. Policy determines whether
missing Knowledge permits a general-model answer; authorized extracts can be
returned without a model. Distinguish citations, missing Knowledge and model
failure. Explicitly mention the platform management Agent by its English
display name in a Channel; Enterprise also has a separate Compliance Agent.
Commands retain their current authorization and cannot borrow a Human or Owner
identity. See [model usage](model-usage-and-wallboard.md) and
[API reference](api-reference.md).

## Graphs, organizations and DB4A2A

Graph runs, leases, checkpoints and events are database facts; the graph is an
authorized projection. DB4A2A passes context references bounded by revision,
digest and scope. Receivers still authenticate independently. This is distinct
from standard A2A interoperability.

Organizations describe responsibility and Knowledge scope; Security Domains
authorize collaboration; Channels provide communication. Recheck authority
after membership changes. Graph edges and legacy groups do not grant access.
Graph Runtime core and authorized inspection are available. Manifest drafts,
read-only SLO and checkpoint forks are controlled. Pinned frameworks, A2A and
OTLP need separate decisions and evidence. Effect replay, live dynamic Graph
migration, arbitrary frameworks and global autonomous repair remain disabled.
A prompt or Skill cannot change these states.

Principals, organizations, Domains, Tasks, Steps, executions, Work contracts,
handoffs, revisions, sources, candidates, reviews, releases and diagnostics have
typed entities and relationships. Content bodies do not replace typed state or
authority. Transactions commit state and audit consistently; keys, foreign keys
and immutable history provide concurrency control and traceability. Native
resource links use stable IDs, never mutable Task status. See
[Graph engineering](graph-engineering.md), [organization governance](organization-governance.md)
and [DB4A2A](db4a2a.md).

## Memory, assets and answer-quality operations

Verify migrations 103–105 and actual schema manifests before enabling their
v5.0.1 service paths. In Dashboard **Workspaces → Work continuity**, use the
separate asset, note and retrospective/answer-evaluation panels. Platform
configuration stays in Dashboard; a Portal session does not grant management.
Follow [memory and notes](memory-working-notes.md),
[Agent assets](agent-context-assets.md) and [answer quality](answer-quality.md)
for complete examples and permission requirements.

For an unavailable answer, inspect requested/actual retrieval strategy,
channel degradations, evidence status, current Human/Agent readers, disclosure
policy and Profile health/version. Distinguish no evidence, partial coverage,
contradictions and model failure. A generic model answer requires current
supplement permission and an independent source notice. Turning permission off
also blocks an old queued supplement before dispatch/publication.

For stale notes or assets, read Work/note/binding versions, validity and exact
source authority before editing. Never solve a version conflict by silently
substituting the latest expected version. Expiry/retirement can block current
context use while authorized history remains retained. Restore memory as a new
successor and keep its historical origin receipt.

For sync failures, inspect the configured HTTPS endpoint/pinned commit, allowed
paths/content types, total byte limit, credential reference, source state,
attempt count, error and current lease/fence. No failed fetch may advance the
checkpoint. A 404 does not authorize deleting previously published Knowledge.
For retrospective or evaluation failures, preserve the original Task link,
frozen Profile/policy/source revisions and output digest. Unknown model sends
remain `UNOBSERVED`; do not automatically resend or clear ledger/lease state.
Pending candidates require independent review and explicit publication; final
answers require distinct factual/citation review where the rubric demands it.
Keep private configuration, encrypted evidence and credentials outside public
packages and support excerpts.

## Release decision

The product's exact package hash must match its PostgreSQL acceptance evidence,
including initialization, supported upgrade, real workflows, native denial,
UI and dependencies. Shared PG behavior may reuse explicitly bound equivalence
evidence, while product identity, installation, registration and upgrade checks
remain specific to OpenTenBase AgentX. A shared version number or another
product's passing test is insufficient.

Only an explicitly successful final release decision permits delivery within
its stated bounds. It does not certify customer capacity, arbitrary host
isolation or database-cluster HA. Clean only explicitly authorized temporary
PostgreSQL test databases; preserve baselines, system databases and protected
TEST targets.

