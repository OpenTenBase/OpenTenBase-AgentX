# 数据库最小权限 v5.0.4

> 当前软件包：**OpenTenBase AgentX**；支持底座：**pg**；版本类别：**Community**；许可：**Apache-2.0**。文中其他底座及企业专属能力用于说明差异，不表示此包包含或支持这些能力。

[English](minimum-privileges.md)

## 身份与范围

OpenTenBase AgentX 仅使用 PostgreSQL。受运维控制的受限 Owner 创建和迁移平台对象。
人会话、平台 Agent 和外部 Agent 使用不同身份，普通运行请求不得回退到 Owner。
数据库授权和主机隔离分别验证。

授权前检查 `scripts/deploy/0_pg_database_prerequisites.sql`，使用专用应用数据库、
非超级用户 Owner 及有界存储。系统库、基线和受保护 TEST 库不能作为空库初始化。

## PostgreSQL

DBA 在独立应用数据库中执行 `0_pg_database_prerequisites.sql`，将 `schema_owner` 设置为配置中的非超级用户 Owner。先安装要求的 vector/AGE 扩展，再检查脚本的精确授权。受限 Owner 需要目标结构和数据库创建、AGE 目录/函数/序列访问以及 Agent 角色管理权限。

前置脚本在角色不存在时创建共享运行角色，属性为 NOLOGIN、NOSUPERUSER、NOCREATEDB、NOCREATEROLE、NOINHERIT、NOBYPASSRLS。Owner 需要 CREATEROLE 及该角色的 ADMIN OPTION；Agent 不获得管理权限。初始化前必须通过 `PG_AGE_OWNER_PRIVILEGES` 和 `PG_AGENT_ROLE_ADMIN` 预检。

每个 Agent 单独创建 LOGIN。事务局部的 `createrole_self_grant='set, inherit'` 使 Owner 仅能管理自己刚创建的角色。外部预先创建的角色在轮换凭据前，可能需要 DBA 显式补充 ADMIN OPTION，不能通过授予 SUPERUSER 或 BYPASSRLS 解决。

强制 RLS 与 SESSION_USER 绑定必须在注册后仍然有效。父表策略不会保护被直接授权的叶分区，应使用独立 Agent 登录分别验证父表和分区。收敛历史广泛授权后，连续性控制面表仍须拒绝 Agent 访问。

## 核验与变更授权

按[部署](deployment_zh.md)执行带账本预检与 `verify`，再完成[迁移](migration_zh.md)
后置检查。核对实际结构、迁移摘要、身份映射、凭据创建和原生拒绝测试，仅列出授权
不能证明安全有效。PostgreSQL 使用原生角色目录，无需额外账户状态视图，见
[原生身份操作](native-identity_zh.md)。

撤销过大权限前明确精确角色、依赖、替代授权和恢复路径。DDL 和拒绝测试使用独立
测试库，不操作基线或生产库。Owner 与 Agent 均不授予超级用户或 BYPASSRLS。
主机隔离要求独立验证的适配器和权限，数据库授权不授予 Host Manager 访问，见
[运行隔离](runtime-isolation_zh.md)。

