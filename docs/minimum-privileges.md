# Minimum database privileges v5.0.4

> Installed product: **OpenTenBase AgentX**; supported backends: **pg**; edition: **Community**; license: **Apache-2.0**. Other backends and Enterprise-only capabilities discussed below describe differences; they do not extend this package's scope.

[简体中文](minimum-privileges_zh.md)

## Identity and scope

OpenTenBase AgentX uses PostgreSQL only. Its operator-controlled bounded Owner
creates and migrates platform objects. Human sessions, platform Agents and
external Agents are distinct; ordinary runtime requests never fall back to
Owner access. Database authorization and host isolation remain independent.

Review `scripts/deploy/0_pg_database_prerequisites.sql` before granting rights.
Use a dedicated application database, non-superuser Owner and bounded storage.
System, baseline and protected TEST databases are not empty initialization targets.

## PostgreSQL

A database administrator runs `0_pg_database_prerequisites.sql` in the
dedicated application database, with `schema_owner` set to the configured
non-superuser Owner. Install the required vector/AGE extensions and inspect the
script's exact grants. The bounded Owner needs target schema/database creation,
AGE catalog/function/sequence access and per-Agent role management.

The prerequisite creates the shared runtime role as NOLOGIN, NOSUPERUSER,
NOCREATEDB, NOCREATEROLE, NOINHERIT and NOBYPASSRLS when absent. The Owner
requires CREATEROLE and ADMIN OPTION on that role; Agents do not acquire those
management privileges. Preflight must pass `PG_AGE_OWNER_PRIVILEGES` and
`PG_AGENT_ROLE_ADMIN` before initialization.

New Agent LOGIN roles are provisioned individually. Transaction-local
`createrole_self_grant='set, inherit'` gives the creating Owner management
of only the newly created role. An existing externally created role may need
an explicit DBA ADMIN OPTION grant before credential rotation. Never solve
that problem by making the Owner or an Agent SUPERUSER or BYPASSRLS.

Forced RLS and SESSION_USER binding must survive registration. Parent-table
policy does not protect directly granted leaf partitions; test parent and
partition access with independent Agent logins. Control-plane continuity
tables must remain denied after broad legacy grants are reconciled.

## Verify and change grants

Run journaled preflight and `verify` from [deployment](deployment.md), followed by
[migration](migration.md) postflight. Check actual structures, migration digests,
identity mappings, credential provisioning and native negative tests. An
inventory of grants alone does not demonstrate enforcement. PostgreSQL uses its
native role catalog and needs no extra account-status view; see
[native identity operations](native-identity.md).

Before removing excessive privileges, resolve the exact role, dependencies,
replacement grants and recovery route. Use an isolated test database for DDL
and denial checks, not a baseline or production database. Keep the Owner and
Agents non-superuser and without BYPASSRLS. Host isolation needs its own verified
adapter and permissions; database grants do not authorize Host Manager access.
See [runtime isolation](runtime-isolation.md).

