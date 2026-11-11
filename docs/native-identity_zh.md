# 原生 Agent 身份操作 v5.0.5

> 当前软件包：**OpenTenBase AgentX**；支持底座：**pg**；版本类别：**Community**；许可：**Apache-2.0**。文中其他底座及企业专属能力用于说明差异，不表示此包包含或支持这些能力。

[English](native-identity.md)

## 身份与保留记录

Agent Principal、PostgreSQL LOGIN 角色和 Gateway 凭据是不同身份。退役保留 Principal、
原生映射、归属历史和审计，不删除角色或轮换密码。人管理员与平台系统 Agent 不是业务
Agent 退役目标，身份和状态始终以数据库实体为准。

每个受管 Agent 对应唯一且绑定本数据库的 PostgreSQL LOGIN 角色。适配器核对当前
数据库、配置 Owner、精确 Principal 和唯一映射后才变更一个角色。映射缺失、有歧义
或已改变时不能猜测角色名，也不能回退到 Owner。

## PostgreSQL 管理员前置

按 `scripts/deploy/0_pg_database_prerequisites.sql` 和[最小权限](minimum-privileges_zh.md)
准备专用数据库、受限 Owner、Agent 角色管理边界及必要扩展。PostgreSQL 角色状态使用
原生角色目录，OpenTenBase AgentX 无需管理员额外创建账户状态视图。运行配置不得存放
PostgreSQL 超级用户凭据。

由配置 Owner 执行包内预检或 `verify`。映射缺失、数据库绑定不符或权限不足应阻断
原生操作，不能据此认定 Agent 角色不存在。使用隔离验收账户核对独立 Agent 拒绝，
另一 Agent 和 Owner 访问不变。预检通过不等于 HTTP 注册或原生访问控制通过。
保留迁移 105 及历史 SQL、校验和不变。

## 退役一个受管 Agent

通过已认证的退役流程操作；操作者须具备 `agents.offboard` 权限，并能访问确切目标
Agent。Dashboard API 为 `POST /api/agents/{agent_id}/offboard`，使用 Dashboard
会话 Cookie 与 `X-CSRF-Token`，不使用普通 Agent 的原生凭据。填写明确原因以及
真实的负责人、责任组和运行环境处置条件。

例如，先独立确认以下处置条件确实适用于所选业务 Agent，再向包含其精确 ID 的
路由提交此 JSON：

```json
{
  "owner_type": "HUMAN",
  "has_responsible_group": false,
  "environment": "DEVELOPMENT",
  "reason": "退役这个已获准的开发环境 Agent"
}
```

这些字段用于处置判断，不能为了得到期望结果而将生产 Agent 改称开发 Agent。
应填写目标真实记录的责任和运行环境，检查返回处置；没有核实目标时不能照抄示例值。

流程先提交平台状态、令牌/凭据撤销、派发围栏和待处理审计。处置要求原生撤销时，
第二步重新核对精确映射，将确切 PostgreSQL 角色设置为 `NOLOGIN`，阻止新的原生登录。
同时仅关闭本进程跟踪的该 Agent 连接；不改其他 Agent、共享角色或 Owner 授权。
不执行 `DROP` 或密码轮换。

原生角色变更、平台状态和最终审计不是一个跨层原子事务。PostgreSQL 角色变更不会
使之前的平台提交和之后的结果审计自动成为一个事务。HTTP 成功或 Principal 已停用，
均不能单独证明原生撤销成功，
需继续检查 `native_identity_revocation` 及结果审计。

| 结果 | 本次原生操作范围内的含义 |
|---|---|
| `PENDING` | 前置条件不足，无法确认有权完成原生撤销；保留已停用的平台状态并调查。 |
| `PARTIAL` | 部分操作、观测或审计失败；检查后置快照、本地连接关闭失败与审计状态，不能报告完整成功。 |
| `COMPLETE` | 已观测新原生登录被阻断，本进程跟踪连接关闭无失败，当前身份核验通过。 |
| `SKIPPED` | 所选处置保留原生身份，不代表原生登录已经停用。 |

最终审计结果还需 `audit_status=RECORDED`。保留操作 ID、数据库指纹及前后观察；
未知字段保持未知，不能写成 false 或 0。处理原因后，只通过获授权流程重试；不能
为了获得成功状态而解锁、重新注册、清空历史或扩大权限。

## 存量会话与事件处置

`COMPLETE` 仅说明新登录和本地缓存范围的结果，不保证外部已建立数据库会话终止、
全部业务读写失效、其他应用进程的连接池关闭或远端 Agent 进程退出。
`existing_sessions_closed`、`business_access_blocked` 未另行观测时保持未知。
新连接被拒绝与旧外部连接仍能查询，可以同时成立。

如果事件处置要求终止存量会话或进程，应另行授权 DBA 或基础设施操作，解析确切
目标并验证实际结果；不能终止无关会话或整个平台工作。保留审计和独立对照账户的
观察。另见[安全](security_zh.md)、[恢复](recovery_zh.md)和[迁移](migration_zh.md)。
