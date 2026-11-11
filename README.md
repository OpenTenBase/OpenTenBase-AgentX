# OpenTenBase AgentX v5.0.5

[简体中文](README_zh.md)

A database-backed AI Agent management platform. Tasks, collaboration barriers,
memory, knowledge, property graphs, permissions and audit records are persisted
as database entities. External Agents use governed registration and gateway APIs;
Portal conversations allocate local managed Agents.

Shared answers combine authorized retrieval with separate evidence assessment
and source labels. Work notes, temporal Memory, Agent asset bindings, configured
source synchronization and final-answer evaluation extend the existing
Task/Step, Work/Handoff and candidate/review entities. Their permissions, exact
revisions and explicit publication boundaries remain enforced.

Registered model resources share durable
capacity admission and request observations. Structured retrospectives retain
independent candidate review; approved read-only tool turns retain the existing
Action Cards and Workers. Processing diagnosis shows consumed budgets and
explicit recovery receipts. MCP selects a bounded version-specific adapter.
See [model capacity](docs/model-endpoint-capacity.md),
[model workflows](docs/model-workflows.md), [processing recovery](docs/processing-recovery.md)
and [MCP compatibility](docs/mcp-versioned-interoperability.md).

This package is **OpenTenBase-AgentX**, **Community**, licensed under
**Apache-2.0**. Supported database keys: **pg**. OpenTenBase AgentX is an independent PostgreSQL-only Community product.

## Current release

v5.0.5 improves management-channel stream handling, separates retrieval
scores from evidence sufficiency, and checks bounded citation/expression rules
before publishing shared answers. These checks do not provide a calibrated
correctness probability or verify every claim. Knowledge/Memory pages use
independent bounded loading; Portal policy and Agent asset navigation are
aligned, including ordinary-HTTP request identifiers. Configured source intake
and incident-report drafts still require independent review and promotion.
See [release notes](RELEASE_NOTES_v5.0.5.md) and
[answer quality](docs/answer-quality.md) for the verified boundaries.

## Install and initialize

Use Python 3.14+ on supported Linux with glibc 2.34+. Extract the complete
archive, including `vendor/`. Work from its root:

1. Copy `config.example.json` to private `config.json` with mode `0600`.
   Keep `database.type=pg` and fill in PostgreSQL connection fields, session
   secret and optional model settings.
2. Run `bash scripts/install_offline.sh --database pg`. It installs this
   product's PostgreSQL dependency profile into a dedicated virtual environment.
3. Have the DBA prepare an empty dedicated PostgreSQL database, bounded Owner
   and `scripts/deploy/0_pg_database_prerequisites.sql`. Follow
   [minimum privileges](docs/minimum-privileges.md); no additional account-status
   view is required.
4. Store the initial password in a current-user-owned regular file, mode `0600`
   or stricter. Run `bash scripts/install_platform.sh initialize --database pg
   --edition community --version 5.0.5 --config /absolute/path/config.json
   --admin-password-file /absolute/path/admin.password`. Keep the parameters
   `pg` and `community`. The initial password must be at least 12 characters.
5. Run `./start_web_server.sh start`. Dashboard: `/app/`; Portal: `/portal`.
   `/api/health` reports process identity; `/api/ready` checks database readiness.

For an external private configuration, export `CX_CONFIG_PATH` before installing
and keep the same path for startup; initialization still requires explicit
`--config`. `CX_DATABASE_DIALECT`, when set, must be `pg`. Missing or conflicting
selection stops startup before driver import. Retain any selected `CX_VENV_DIR`
for installation, initialization and startup.

### PostgreSQL deployment

Use `config.example.json` and the root `requirements.txt`. For manual offline
installation in an activated Python 3.14+ virtual environment:

```bash
python -m pip install --no-index --find-links vendor -r requirements.txt
python scripts/verify_deps.py --database pg
```

Use a dedicated installation directory and virtual environment. Follow the
complete [deployment guide](docs/deployment.md) for prerequisites, initialization,
upgrade, verification and private recovery state.

## Operate and extend

- [Optional platform learning content](docs/platform-learning-delivery.md)

- [Deployment](docs/deployment.md) and [migration](docs/migration.md)
- [Architecture](docs/architecture.md) and [API reference](docs/api-reference.md)
- [Agent extensions](docs/agent-extensions.md) and [DB4A2A](docs/db4a2a.md)
- [Continuity operations](docs/continuity-operations.md)
- [Memory evidence, working notes and retrospectives](docs/memory-working-notes.md)
- [Agent assets, context budgets and source synchronization](docs/agent-context-assets.md)
- [Shared answers and final-answer evaluation](docs/answer-quality.md)
- [Security](docs/security.md) and [release verification](docs/release-signing.md)
- [Native Agent offboarding and account-status prerequisites](docs/native-identity.md)
- [Source IP access and local recovery](docs/source-ip-access.md)
- [Release notes](RELEASE_NOTES_v5.0.5.md)

Model features are verified per provider and model. Controlled integrations keep
their authorization, isolation, bounded execution and database audit checks.
Enterprise-only code and SQL are excluded from Community packages. Configure
human self-registration separately from external Agent registration.
