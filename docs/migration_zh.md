# 迁移指南 v5.0.4

> 当前软件包：**OpenTenBase AgentX**；支持底座：**pg**；版本类别：**Community**；许可：**Apache-2.0**。文中其他底座及企业专属能力用于说明差异，不表示此包包含或支持这些能力。

[English](migration.md)

## 当前合同

OpenTenBase AgentX 仅支持 **PostgreSQL**。生成的基线清单和校验和定义有序部署合同。
产品标识变化不能成为修改已应用 SQL 或接管其他产品数据库的理由。

v5.0.0 通过 `102_v5_0_0_network_access.sql` 增加来源 IP 策略实体。
v5.0.1 新增 103–105，提供记忆质量、上下文资产及最终回答验收。
v5.0.2 新增 106–110，其中 110 修正历史审批约束。v5.0.3 保留该前序链，新增
**111–114，再执行 117**。逐项核对所选脚本及结构清单；终点 117 本身不代表
数据库或发布验收已完成。

111 保存知识入库引导元数据，112–114 实施原生知识写入保护。
117 为 Task Step 增加可空的开始、完成时间，无默认值，也不回填历史。
原有数据、授权及未知时间保持不变；历史时间为空不能作为步骤从未运行的证明。

本包唯一的 PostgreSQL 基线位于 `scripts/deploy/baseline_v*.json`，仅使用包内
PostgreSQL 脚本、驱动和 `config.example.json`。版本号相同不能授权将其他产品
改名为 OpenTenBase AgentX。

| 先前发布的版本 | 迁移终点 |
|---|---|
| v4.4.14 | 82 |
| v4.4.15, v4.4.16, v4.5.0 | 97 |
| v4.5.1 | 100 |
| v4.5.2 | 101 |
| v5.0.0 | 102 |
| v5.0.1 | 105 |
| v5.0.2 | 110 |

这些版本是常规发布。历史迁移文件名描述结构引入的时间，不是传给当前安装器的
目标版本。已撤回的 v4.4.8 和未知的部分架构不被假定为升级源；保留历史证据，
调查清楚后再继续。

## 准备现有目标

记录当前 OpenTenBase AgentX 产品身份、PostgreSQL 数据库、Owner、运行节点、配置、
密钥位置及 APPLIED 校验和。变更产品或版本类别不是自动迁移，仅共享 PostgreSQL
迁移链也不能授权接管其他产品的数据库。

DBA 负责原生备份与恢复，变更前建立并测试恢复边界。客户端不验证备份；
`--confirm-database-backup` 记录操作员明确承担的责任。保留私有配置、主加密密钥和
`.runtime/deployment/` 账本及密钥，不放入公开包或支持归档。

在确切 PostgreSQL 目标上核对 `scripts/deploy/0_pg_database_prerequisites.sql` 和
[最小权限](minimum-privileges_zh.md)。普通 Agent 不得持有部署凭据；PostgreSQL
无需额外账户状态视图，见[原生身份操作](native-identity_zh.md)。

## 按账本升级

使用已安装包中的 Python 环境，并从其根目录开始工作：

```bash
bash scripts/install_platform.sh upgrade \
  --database pg --edition community --version 5.0.4 \
  --from-version 5.0.2 \
  --config /absolute/path/config.json \
  --confirm-database-backup
```

从 v5.0.2 升到 v5.0.3 时，`--from-version 5.0.2` 会先检查前序真实结构及
APPLIED 校验和，再仅执行上表中的本底座新增链。续跑保留原日志声明的前序版本；
旧的未声明日志不能重新标成已核验的升级。初始化和其他版本迁移不使用此参数。

本产品固定使用 `--database pg --edition community`。
安装程序会验证基线、源状态、有序脚本摘要以及对象后置条件。仅当已应用条目的校验和与所需结构相匹配时，才会接受这些条目。后续迁移只有在自身绑定校验和的条目状态为 APPLIED 之后，才能满足较早的结构检查。

v5.0.0 通过现有的 Knowledge 实体重新发布当前的产品事实。
仅归档精确且未更改的历史产品知识种子；用户编辑和无关的 Knowledge 将保留。快照发布、公共实体、退役和审计在同一个事务中提交。这不是对客户 Knowledge 的批量重写，也不是数据库转换。

## 限制受影响的写入边界

仅排空受迁移影响的写入进程。停止这些任务的新任务领取，允许有界的在途工作完成或达到安全点，记录租约并在严格的迁移后检查后恢复。不要强加未记录的平台级写入中断。

PostgreSQL 迁移链保留已有 Task 历史和依赖，按本包生成的 PostgreSQL 清单核对实际结构；
其他数据库的迁移操作不属于 AgentX 升级步骤。

| 迁移 | 主要保留的结构或边界 |
|---|---|
| 85 | 稳定的任务/步骤关系和安全的状态转换 |
| 86–88 | 连续性实体、绑定和类型化的原生执行链接 |
| 89–93 | MCP 发现快照、精确的工具契约和请求来源 |
| 94 | 不可变的交接策略修订 |
| 95–96 | Worker 上下文和原始 Gateway 凭据绑定 |
| 97 | 原生源快照和源重新验证 |
| 98–100 | Agent 扩展、固定框架锁和根文件系统摘要 |
| 101 | 统一的 A2A/DB4A2A Task Plan/Step 关联和带围栏令牌的执行尝试 |
| 102 | 来源 IP 策略指针、不可变修订及规则，初始关闭 |
| 103 | 记忆时间/协调/恢复事实、不可变工作便签及显式关联任务的复盘 |
| 104 | 上下文预算/表示、Agent 资产绑定、配置来源修订及带栅栏的同步/导入检查点 |
| 105 | 版本化回答标准、关联任务的运行、加密输入/输出、精确来源及独立人工审核 |
| 106–109 | 模型容量、处理恢复、受控模型轮次及已观测回答审核 |
| 110（PostgreSQL） | 修正历史审批约束，保留正常审批权限 |
| 111–116（按底座选择） | 知识引导元数据、原生共享写入边界及底座特定的正文检索 |
| 117 | 实际观测的步骤开始、完成时间，未知历史保持为空 |
| 118（Oracle） | 显式子文档键，保留完整协作组 JSON 投影 |

v5.0.1 目标需检查三项新脚本及结构清单，包括实际表、键、约束和原生保护。
终点 105 账本成功不代表 103、104 对象存在。来源/模型作业复用既有任务连续性链，
不另建调度器，也不授予 Agent 对控制面表的 SQL 访问。历史证据缺少可靠事件时间时，
新时间字段保持未知，不得补造本地时间戳。见[记忆证据](memory-working-notes_zh.md)、
[Agent 资产](agent-context-assets_zh.md)及[回答验收](answer-quality_zh.md)。

PostgreSQL 在历史状态分区 Task Plan 表没有全局 PLAN_ID 键的情况下，保留服务端的稳定计划验证。这是一个明确的契约，而不是跳过验证的许可。

## 恢复并调查故障

在采取行动之前，检查返回的运行 ID、本地日志和数据库迁移账本。不要初始化现有数据库、清除账本、编辑校验和、跳过失败的片段，或假设中断的语句已提交。

```bash
bash scripts/install_platform.sh status \
  --database pg --edition community --version 5.0.4 \
  --config /absolute/path/config.json --run-id YOUR_RECORDED_RUN_ID
bash scripts/install_platform.sh resume \
  --database pg --edition community --version 5.0.4 \
  --config /absolute/path/config.json --run-id YOUR_RECORDED_RUN_ID
```

恢复操作使用原始计划和已验证的已完成操作摘要。如果初始化在管理员提交之前停止，请提供受保护的管理员密码文件。已完成接管的管理员可以在不保留明文的情况下进行验证。如果无法验证原始计划或恢复状态，请停止操作并使用数据库文档中记载的恢复程序。

## 验证并恢复服务

```bash
bash scripts/install_platform.sh verify \
  --database pg --edition community --version 5.0.4 \
  --config /absolute/path/config.json
```

验证迁移终点、无效对象、键/约束、原生身份拒绝、产品身份以及当前能力状态。然后检查健康状态、数据库就绪情况、登录、授权的读写工作流、任务状态转换、取消/恢复以及（如果使用了）Agent 注册。

仅恢复已排空的写入进程，并监控租约、尝试次数和错误。不确定的外部影响需要核对；重启并不授权重复发送。在批准的回滚期间内，保留旧程序目录和数据库恢复边界。

经过验证的升级本身并不建立客户容量、数据库集群高可用性（HA）或 RPO/RTO。请参阅 [恢复](recovery_zh.md)、
[连续性操作](continuity-operations_zh.md) 和 [部署](deployment_zh.md)。
