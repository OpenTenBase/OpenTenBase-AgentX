# Migration guide v5.0.5

> Installed product: **OpenTenBase AgentX**; supported backends: **pg**; edition: **Community**; license: **Apache-2.0**. Other backends and Enterprise-only capabilities discussed below describe differences; they do not extend this package's scope.

[简体中文](migration_zh.md)

## Current contract

OpenTenBase AgentX supports **PostgreSQL**. Its generated baseline manifest and
checksums define the ordered deployment contract. Product identity changes do
not justify modifying applied SQL or adopting another product's database.

v5.0.0 adds `102_v5_0_0_network_access.sql` for source IP policy entities.
v5.0.1 adds 103–105 for memory quality, context assets and final-answer
evaluation. v5.0.2 adds 106–110, including the historical approval-constraint
repair in 110. v5.0.3 preserves that chain and adds **111–114, then 117**.
Verify each selected script and schema manifest; a historical terminal alone is not
evidence of database or release acceptance.

Migration 111 stores guided intake metadata; 112–114 enforce native Knowledge
write guards. Migration 117 adds nullable Task Step start/completion timestamps
without a default or historical backfill. Existing rows, grants and unknown
times remain unchanged. A missing historical time does not prove a step never ran.

v5.0.4 adds STATUSPAGE Source kind migration 119 and prerequisite 120, which
repairs only the exact supported historical Source constraints before unchanged
119 executes. v5.0.5 appends `121_v5_0_5_pg_context_self_read.sql`, restoring
ACTIVE Agents' own-context reads through their registered native identity.
The current PostgreSQL terminal is **121**. Verify own/other/forged/write
controls; no shared-context or write grant is added. Use `--from-version 5.0.4`
for the current upgrade. Preserve native backups, historical SQL and checksums.

The package's sole PostgreSQL baseline is `scripts/deploy/baseline_v*.json`.
Use its PostgreSQL SQL, driver and `config.example.json`. A shared version number
does not authorize changing another product's identity to OpenTenBase AgentX.

| Previously released version | Terminal migration |
|---|---|
| v4.4.14 | 82 |
| v4.4.15, v4.4.16, v4.5.0 | 97 |
| v4.5.1 | 100 |
| v4.5.2 | 101 |
| v5.0.0 | 102 |
| v5.0.1 | 105 |
| v5.0.2 | 110 |
| v5.0.3 | 117 |
| v5.0.4 | 120 |

These versions were normal releases. Historical migration filenames describe
when a structure was introduced, not the version to pass to a current installer.
Withdrawn v4.4.8 and unknown partial schemas are not assumed upgrade sources.
Preserve historical evidence and investigate before proceeding.

## Prepare an existing target

Record the current OpenTenBase AgentX product identity, PostgreSQL database,
Owner, running nodes, configuration, key locations and APPLIED checksums.
Changing products or editions is not an automatic migration. The PostgreSQL
chain alone does not authorize adopting a database belonging to another product.

The DBA owns native backup and recovery. Establish and test the recovery
boundary before changing data. The client does not verify backups;
`--confirm-database-backup` records the operator's explicit responsibility.
Preserve private configuration, master encryption keys and
`.runtime/deployment/` journals and keys outside public/support archives.

Recheck `scripts/deploy/0_pg_database_prerequisites.sql` and
[minimum privileges](minimum-privileges.md) against the exact PostgreSQL target.
Ordinary Agents must not receive deployment credentials. PostgreSQL requires no
additional account-status view. See [native identity operations](native-identity.md).

## Run the journaled upgrade

Use the installed package's Python environment and work from its root:

```bash
bash scripts/install_platform.sh upgrade \
  --database pg --edition community --version 5.0.5 \
  --from-version 5.0.4 \
  --config /absolute/path/config.json \
  --confirm-database-backup
```

For the v5.0.4 to v5.0.5 transition, `--from-version 5.0.4` checks the actual
predecessor objects and APPLIED checksums before any new migration. PostgreSQL
then applies 121; the other supported backends retain terminal 119. Use the
matching historical package for each earlier transition; this command does not
support skipping releases. A resumed upgrade retains the declared
predecessor in its original journal; an older undeclared journal cannot be
relabelled as a checked transition. Do not use this argument for initialization
or another version transition.

Keep `--database pg --edition community` for this product.
The installer validates the baseline, source state, ordered script digests and
object postconditions. Already applied entries are accepted only when their
checksums and required structures match. A later migration can satisfy an
earlier structure check only after its own checksum-bound entry is APPLIED.

v5.0.0 republishes current product facts through existing Knowledge entities.
Only exact, unchanged historical product seeds are archived; user edits and
unrelated Knowledge remain. Snapshot publication, public entities, retirement
and audit commit in one transaction. This is not a bulk rewrite of customer
Knowledge or a database conversion.

## Limit the affected write boundary

Drain only writers affected by a migration. Stop new claims for those jobs,
allow bounded in-flight work to finish or reach a safe point, record leases and
resume after strict postflight. Do not impose an undocumented platform-wide
write outage.

The PostgreSQL migration chain retains existing Task history and dependencies.
Use the generated PostgreSQL manifest and inspect its real structure checks;
procedures for another database are not AgentX upgrade steps.

| Migrations | Main retained structure or boundary |
|---|---|
| 85 | Stable task/step relationships and safe status transitions |
| 86–88 | Continuity entities, bindings and typed native execution links |
| 89–93 | MCP discovery snapshots, exact tool contracts and request provenance |
| 94 | Immutable handoff-policy revisions |
| 95–96 | Worker context and original Gateway credential binding |
| 97 | Native source snapshots and source revalidation |
| 98–100 | Agent extensions, fixed-framework lock and root-filesystem digest |
| 101 | Unified A2A/DB4A2A Task Plan/Step association and fenced attempts |
| 102 | Source IP policy pointer, immutable revisions and rules; default disabled |
| 103 | Memory-time/reconciliation/restore facts, immutable working notes and explicit Task-linked retrospectives |
| 104 | Context budgets/representations, Agent asset bindings, configured source revisions and fenced sync/import checkpoints |
| 105 | Versioned answer rubrics, Task-linked runs, encrypted input/output, exact sources and independent Human reviews |
| 106–109 | Model capacity, processing recovery, governed model turns and observed-answer reviews |
| 110 (PostgreSQL) | Historical approval-constraint repair, preserving ordinary decision authority |
| 111–116 (backend-selected subset) | Guided Knowledge metadata, native shared-write boundaries and backend-specific body search |
| 117 | Observed Task Step start/completion times; historical unknowns stay NULL |
| 119 | Bounded STATUSPAGE Source kind; collection remains separate from review/promotion |
| 120 (PostgreSQL, before 119) | Exact historical Source-kind constraint repair |
| 121 (PostgreSQL) | ACTIVE Agent reads of its own context; no shared-context or write grant |

For a v5.0.1 target, verify all three added scripts and schema manifests, including
their actual tables, keys, constraints and native protection. A successful 105
ledger entry does not imply that 103/104 objects exist. Source/model jobs reuse
the existing Task continuity chain; do not introduce a second scheduler or grant
Agent SQL access to their control-plane tables. New time fields remain unknown
for historical evidence that has no reliable event time; never backfill an
invented local timestamp. See [memory evidence](memory-working-notes.md),
[Agent assets](agent-context-assets.md) and [answer quality](answer-quality.md).

PostgreSQL retains service-side stable-plan validation where the historical
status-partitioned Task Plan table has no global PLAN_ID key. This is an
explicit contract, not permission to skip verification.

## Resume and investigate failures

Inspect the returned run ID, local journal and database migration ledger before
taking action. Do not initialize an existing database, clear the ledger, edit a
checksum, skip a failed fragment or assume an interrupted statement committed.

```bash
bash scripts/install_platform.sh status \
  --database pg --edition community --version 5.0.5 \
  --config /absolute/path/config.json --run-id YOUR_RECORDED_RUN_ID
bash scripts/install_platform.sh resume \
  --database pg --edition community --version 5.0.5 \
  --config /absolute/path/config.json --run-id YOUR_RECORDED_RUN_ID
```

A resume uses the original plan and verified completed-action digests. Supply
the protected administrator password file if initialization stopped before the
administrator was committed. An already adopted administrator can be verified
without retaining plaintext. If the original plan or recovery state cannot be
verified, stop and use the database's documented recovery procedure.

## Verify and return to service

```bash
bash scripts/install_platform.sh verify \
  --database pg --edition community --version 5.0.5 \
  --config /absolute/path/config.json
```

Verify terminal migration, invalid objects, keys/constraints, native identity
denials, product identity and current capability posture. Then check health,
database readiness, login, an authorized read/write workflow, task status
transitions, cancellation/recovery and Agent enrollment where used.

Resume only the drained writers and monitor leases, attempts and errors.
Uncertain external effects require reconciliation; a restart does not authorize
a duplicate send. Retain the former program directory and database recovery
boundary for the approved rollback period.

A verified upgrade does not by itself establish customer capacity, database
cluster HA or RPO/RTO. See [recovery](recovery.md),
[continuity operations](continuity-operations.md) and [deployment](deployment.md).
