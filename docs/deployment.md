# Deployment guide v5.0.4

> Installed product: **OpenTenBase AgentX**; supported backends: **pg**; edition: **Community**; license: **Apache-2.0**. Other backends and Enterprise-only capabilities discussed below describe differences; they do not extend this package's scope.

[简体中文](deployment_zh.md)

## Product and database selection

This is **OpenTenBase AgentX**, an independent **PostgreSQL-only Community**
product under **Apache-2.0**. Use `database.type=pg` and the packaged
`config.example.json`. Tasks, Steps, Memory, Knowledge, property graphs,
identities, grants and audit remain database entities. Product identity is
checked during initialization and upgrade; a shared version number does not
make packages for other products interchangeable.

## Prepare the environment

Use Python 3.14+ and supported Linux with glibc 2.34+. Retain the complete
archive, including `vendor/`. Use a dedicated PostgreSQL database and a bounded,
non-superuser Schema Owner. The packaged
`scripts/deploy/0_pg_database_prerequisites.sql` and
[minimum privileges](minimum-privileges.md) describe the database and extension
prerequisites. Keep host-administrator and PostgreSQL-superuser credentials out
of runtime configuration.

Control-plane startup does not prove local Agent isolation. Verify the exact
host through [platform compatibility](linux-platform-compatibility.md) and
[runtime isolation](runtime-isolation.md).

## Configure and install

1. Extract into a trusted, dedicated installation directory. From its root,
   copy `config.example.json` to `config.json` with mode `0600`.
2. Keep `database.type` as `pg`. Fill in `user`, `password`, `host`, `port` and
   `dbname`, `security.secret_key`, optional model/Embedding configuration,
   and `server.host`/`server.port`. Use the bounded Owner for deployment and
   management, never a superuser or an Agent's credentials.
3. If using an external private configuration, export
   `CX_CONFIG_PATH=/absolute/path/config.json` before installing. The launcher
   reads it; the deployment CLI still requires `--config "$CX_CONFIG_PATH"`.
   Keep the same path in every shell and service-manager environment.
4. Run `bash scripts/install_offline.sh --database pg` to create the package's
   `.venv`. `PYTHON_BIN` selects Python and `CX_VENV_DIR` selects a private
   environment. If set, retain `CX_VENV_DIR` for installation, initialization
   and startup. Only the PostgreSQL dependency profile is installed.

`CX_DATABASE_DIALECT`, when set, must be `pg` and agree with configuration.
Unsupported or conflicting choices stop before driver import. The complete
dependency list is the root `requirements.txt`; this product does not use
`requirements/<database>.txt` profiles or backend-specific configuration files.

For manual offline installation, create and activate a dedicated Python 3.14+
virtual environment, then run:

```bash
python -m pip install --no-index --find-links vendor -r requirements.txt
python scripts/verify_deps.py --database pg
```

The dependency check verifies bundled files; database readiness still requires
initialization or verification below. External access depends on the listener,
routing, firewall and reverse proxy. Configure HTTPS, explicit trusted proxies
and `CX_PUBLIC_BASE_URL` where used. A forwarded address is not a trusted model
gateway endpoint merely because it appeared in a request.

## Initialize a prepared empty target

The DBA first prepares a dedicated empty PostgreSQL database, bounded Owner and
required extensions according to `scripts/deploy/0_pg_database_prerequisites.sql`.
PostgreSQL native roles provide the Agent identity boundary; no additional
account-status view is required. Ordinary Agents never receive Owner fallback
credentials. See [native identity operations](native-identity.md).

The package has exactly one `scripts/deploy/baseline_v*.json`. Its PostgreSQL
chain extends migration 102 with `103_v5_0_1_memory_quality.sql`,
`104_v5_0_1_context_assets.sql` and `105_v5_0_1_answer_quality.sql`, each with
its own structure manifest. Historical SQL and applied checksums keep their
original identities.

Postflight verifies the actual time/note/retrospective, context/asset/source and
answer-quality structures, APPLIED entries and script digests. A terminal 105
ledger row cannot substitute for missing 103 or 104 objects. Existing data,
Agent SQL denials and Task/Step/continuity dependencies remain part of upgrade
verification. Fresh initialization does not prove an existing-data transition.

Write the initial administrator password into a current-user-owned regular
file with mode `0600` or stricter, then run from the package root:

```bash
export CX_CONFIG_PATH=/absolute/path/config.json
bash scripts/install_platform.sh initialize \
  --database pg --edition community --version 5.0.4 \
  --config "$CX_CONFIG_PATH" \
  --admin-password-file /absolute/path/admin.password
```

Keep the database and edition parameters as shown. Interactive initialization
can prompt instead; the password must meet the existing 12-character policy.
There is no universal default administrator password. Initialization checks an
empty target, executes the checksum-bound manifest, creates the Human
administrator and native management identity, publishes product facts, checks
readiness and retires the temporary deployment identity. It does not need a
live model or external Agent.

## Upgrade, resume and verify

An existing database must not be initialized as empty. Confirm database-side
backup/recovery responsibility before `upgrade --confirm-database-backup`.
Inspect journals and select the original `--run-id` for `resume` after an
interrupted, classified deployment. Unknown partial schemas require investigation.
Do not edit applied SQL or delete the migration ledger. See [migration](migration.md).

Private journals and keys are in `.runtime/deployment/`. Preserve configuration,
encryption keys and recovery journals before replacing a program directory.
They must not enter public archives.

```bash
export CX_CONFIG_PATH=/absolute/path/config.json
bash scripts/install_platform.sh verify \
  --database pg --edition community --version 5.0.4 \
  --config "$CX_CONFIG_PATH"
./start_web_server.sh start
./start_web_server.sh status
```

Dashboard is at `/app/` and Portal at `/portal`. `/api/health` reports process
identity and version; `/api/ready` checks database/control-plane readiness.
Neither alone proves release acceptance. The launcher defaults to the package's
`.runtime/web.pid`, so separate installations have separate PID files.

## Configure governance, registration and models

`CX_RUNTIME_PROFILE` defaults to `production`; it does not change database
governance records. Platform, Graph and model capability matrices remain
authoritative. Missing records or an unavailable database do not mean enabled.
Environment variables cannot expand a license or identity's authority.

Human self-registration and external Agent enrollment have independent controls.
Portal uses local managed Agents. Channel Agents require membership, activation,
a valid runtime target and data/model grants. Policy-permitted answers without
Knowledge matches use the model and show a separate source label.

Save model endpoint, model ID and any private key, then run health and individual
capability probes. Structured output, tools, images and cancellation depend on
the actual provider. MCP, A2A, framework execution, telemetry and diagnostics
retain their specific capability, authorization and isolation gates. See
[Agent extensions](agent-extensions.md) and [operations](operations.md).

The additional workflows are documented in [memory and working notes](memory-working-notes.md),
[Agent assets and source synchronization](agent-context-assets.md) and
[final-answer evaluation](answer-quality.md). Source synchronization and model
retrospectives are explicit jobs; neither deployment nor a page visit enables
automatic publication, schedules or new controlled-capability defaults.

Stop with `./start_web_server.sh stop`, or use `restart`. Preserve Task and
Worker lease records for recovery rather than deleting state to clear errors.
