# OpenTenBase AgentX v5.0.5 运维与技术说明（中文）

> 当前软件包：**OpenTenBase AgentX**；支持底座：**pg**；版本类别：**Community**；许可：**Apache-2.0**。文中其他底座及企业专属能力用于说明差异，不表示此包包含或支持这些能力。

[English](operations.md)

外部 Agent 运行方须将[受管工作规约](managed-agent-work_zh.md)纳入可信配置。
接入验收检查知识、记忆及所需工作回执，不能只检查注册成功；企业运行方需将
组织规则落实到真实的平台及外部运行控制。

本文说明当前发行包的部署、迁移、恢复、权限、模型和验收操作。中文步骤与所链接的中文指南均可独立阅读。工作交接、上下文、候选审核与 Skill 客户端另有[完整中文操作手册](continuity-operations_zh.md)。

## 人员与 Agent 的选择

在频道成员、归属转移、分支、授权等操作中，按名称或用户名搜索并选择主体，无需手工填写随机 ID。人员和 Agent 可以同名，应核对类型；选择器会自动提交对应的不可变 ID。

添加频道成员时，先在“安全域”中将该人员或 Agent 加入频道所属安全域，再到“频道 → 管理 → 选择成员”搜索并添加。候选列表排除失效、过期或已在频道中的成员。频道不会自动授予安全域权限。平台管理频道只允许符合管理要求的主体和角色。

申请业务 Agent 时，负责人可填写现有用户名；审批后保留申请中的可读名称。Community 版允许有权限的管理员处理自己的申请；Enterprise 版要求另一名有权限的管理员审批。模板规定的最低隔离级别由服务端验证。

## 部署

OpenTenBase AgentX 是仅支持 PostgreSQL 的社区产品。准备独立 PostgreSQL 数据库和
受限 Owner，不能把基线、系统或已有业务库当作空库初始化。DBA 负责备份恢复、网络、
角色管理，以及 `scripts/deploy/0_pg_database_prerequisites.sql` 中的 AGE、向量和作业
扩展前置。Owner 和每个 Agent 的 LOGIN 角色独立，普通 Agent 不能绕过强制 RLS。
当前授权验证环境使用 PostgreSQL 18.6，实际部署仍须核对目标前置条件。

核对软件包摘要；需要签名时，按[发布验证](release-signing_zh.md)使用独立取得的公钥。
安装 Python 3.14+，采用受支持 Linux/glibc 环境，从解压后的包根目录执行：

```bash
install -m 600 config.example.json config.json
# 先填写私有 PostgreSQL 连接及安全配置，再继续。
export CX_CONFIG_PATH=/absolute/path/config.json
bash scripts/install_offline.sh --database pg
bash scripts/install_platform.sh initialize --version 5.0.5 \
  --database pg --edition community --config "$CX_CONFIG_PATH"
./start_web_server.sh start
```

保持 `database.type=pg`，填写真实 `host`、`port` 和 `dbname`。每个终端和服务管理器
保持同一配置路径和所选 `CX_VENV_DIR`。离线安装器创建本产品 `.venv` 并安装 PostgreSQL
依赖，无需全局安装。监听端口须为 1–65535，外部访问还取决于路由、防火墙和代理策略。

确定性的 Bootstrap Deployment Agent 执行初始化，不依赖外部 Agent 或模型。它检查
空目标、前置、基线和有序迁移，提示输入至少 12 位的部署专用密码，创建 Human 管理员
和原生管理身份，最后退休临时部署身份；没有通用默认密码。PostgreSQL 无需额外账户
状态视图。中断后检查账本，通过原入口恢复，不能跳过失败步骤或将未知对象认作空库。

私有配置和加密主密钥只由运行账户读取，保留既有 `~/.ai-agent-infra/master.key`，
新生成的不同密钥不能解密原密文。业务 Agent 只使用各自凭据，不携带 Owner 后备凭据。

分别检查 `/api/health`、`/api/ready`、登录和数据库治理，任何单项都不证明发布验收通过。
再次验证部署时执行：

```bash
export CX_CONFIG_PATH=/absolute/path/config.json
bash scripts/install_platform.sh verify --version 5.0.5 \
  --database pg --edition community --config "$CX_CONFIG_PATH"
```

批准的反向代理地址通过 `CX_PUBLIC_BASE_URL` 配置，平台模型转发地址不能改成任意第三方
中转。停止服务前确认安装目录、进程和端口，再使用 `./start_web_server.sh stop`。
详见[部署](deployment_zh.md)和[原生身份](native-identity_zh.md)。

## 升级与迁移

本产品唯一的 `scripts/deploy/baseline_v*.json` 定义 PostgreSQL 迁移合同。v5.0.1 在
v5.0.0 的 102 后新增 103–105。产品身份、APPLIED 校验和、实际前序结构、原生保护及
部署后检查必须匹配，不能只看迁移终点。历史 SQL 文件名为账本和校验连续性保留，不授权
跨产品升级。

v5.0.5 核验 PostgreSQL 至 **121** 的完整链，包括在 119 前执行的 120，
以及 121 的自有上下文读取、其他上下文/伪造身份/直接写入拒绝。
当前升级使用 `--from-version 5.0.4`，见[迁移](migration_zh.md)。

记录当前产品、数据库、Owner、配置、加密密钥、写入进程和校验和，完成原生备份及恢复
演练，不能重新初始化已有数据。按[迁移指南](migration_zh.md)执行固定 PostgreSQL /
Community 的账本流程，保留私有恢复状态。

仅排空受影响写入进程，保留租约和有界在途任务；严格检查结构、依赖、权限和就绪状态后
再恢复。保留任务历史、Work/Handoff 修订及原始 Gateway 凭据绑定，不修改已应用 SQL 或
结构清单的校验和。失败时保留旧目录和账本，从记录阶段恢复，不停无关服务，也不清库
掩盖缺陷。

## 恢复与隔离

运行状态、租约、围栏令牌、任务、检查点和审计记录以数据库为准。进程重启只回收
本节点已经过期的租约；旧 Worker 不能提交过期围栏令牌。数据库不可用时停止新的
副作用，不使用内存状态绕过授权。数据库复制、备份、主备切换、RPO/RTO 由部署方负责。

上下文模型请求的结果不确定时记录 UNOBSERVED，不自动再次发送。原始 Gateway 凭据已撤销时，新令牌不能替代原凭据继续旧请求。工作、交接、审核和输入回执保留数据库历史；权限撤销或来源删除会阻止后续读取，但不删除审计事实。

### 运行隔离

Web 控制面能运行与主机能安全承载不可信 Agent 是两种准入。强隔离要求独立 UID/GID、工作目录、namespace、cgroup v2、seccomp、只读根文件系统、最小能力和受保护的 Host Manager；具体镜像、内核、系统策略与补丁必须通过包内主机门禁。发行依赖要求 glibc 2.34+ 及对应支持的 Linux 基线，旧 RHEL/Oracle Linux 8 环境不能按当前包支持。

外部 Agent 绕过受管运行器时不能声称进程已隔离或已终止。协作式 Skill 客户端通过共享进程锁保护运行中的回合，在独占安全点原子切换，保留旧文件；它不能约束绕过客户端的独立后台进程。配置数据库权限不能替代主机隔离证据。

补充参考：[recovery 中文指南](recovery_zh.md)、[runtime-isolation 中文指南](runtime-isolation_zh.md)、[linux-platform-compatibility 中文指南](linux-platform-compatibility_zh.md)。

## 安全与权限

Human、平台 Agent、外部 Agent 和 Schema Owner 使用不同身份。凭据失效不能回退到
部署账户。知识按公司公开、组织子树、组织层级及 Human/Agent 私有范围过滤。安全域
授予协作权限，频道不扩大数据访问。AgentX 保留强制授权和审计写入，但不包含企业审批、
合规 Agent 或审计查看模块。详见[安全](security_zh.md)和[最小权限](minimum-privileges_zh.md)。

## 原生 Agent 退役

使用获授权的 Agent 退役流程，不能以直接账户 DDL 或兼容停用操作代替。检查
`native_identity_revocation`，只有 `status=COMPLETE` 且 `audit_status=RECORDED`
才能报告新登录/本地连接范围的结果。保留 PENDING/PARTIAL 失败供精确核对，保留
身份映射与审计。Principal 已停用、令牌已撤销或账户已锁定，均不能证明全部外部
存量会话或远端进程已停止。权限、处置条件、结果和事件阻断边界见
[原生身份操作](native-identity_zh.md)。

## 模型、MCP 与 A2A

模型及外部工具的治理姿态区分 `OFF`、`READ_ONLY`、`PROPOSAL_ONLY` 或 `GOVERNED_EXECUTOR`。MCP 连续性客户端通过已认证 Gateway 操作；动态工具必须逐项显式开放，调用时仍须当前授权。A2A 使用受控、有界的 HTTP JSON 1.0.1 路径，能力状态与实际授权分别检查，不宣称完整协议或 SDK 支持。模型生成的写入、策略变更、Agent 控制、外部联系和发布默认只能形成提案。
供应商证据记录模型身份、校验、工具调用、用量、延迟、超时、取消、重试和完成状态，
不保存隐藏推理内容或完整提示词。未被网关观测的直连流量不能报告为零消耗。

模型服务商配置需要地址、模型 ID 和适用范围；服务允许无密钥调用时，空 API Key 不应阻止请求。保存后的健康状态要求真实返回匹配模型的有效回答，仅能访问服务地址不算通过。Portal、原生活跃 Agent 或待处理申请仍引用的模型配置不能直接退休。网关可选，按配置选择直连、网关或两者并存；网关只计量实际经过且可观测的请求。

Portal 知识增强回答按用户与 Agent 双方授权过滤来源；没有可用知识时是否调用通用模型由策略决定，没有模型时可返回授权摘录。引用、无知识和模型不可用要明确区分。频道中通过英文显示名显式 @ 平台管理 Agent；Enterprise 还提供独立的合规 Agent。受控命令只执行当前获准操作，管理 Agent 不能借 Human 管理员或 Owner 身份扩大权限。

详细说明：[model-usage-and-wallboard 中文指南](model-usage-and-wallboard_zh.md)、[api-reference 中文指南](api-reference_zh.md)。

## 图、组织与 DB4A2A

Graph Runtime 的运行、租约、检查点和事件是数据库事实；图只是授权后的投影。DB4A2A
传递受版本、摘要和范围约束的上下文引用，接收 Agent 仍须独立认证授权，不代表标准
A2A 互操作。

组织用于表达人员、Agent 的责任和知识范围，安全域用于协作授权，频道用于沟通。调整组织或成员关系后重新检查当前权限，不能让图中的边或旧协作组代替授权。Graph Runtime 核心与授权检查可用；清单草稿导入、只读 SLO 和检查点分叉为受控能力。固定框架、A2A 与 OTLP 需要独立授权和证据；真实副作用回放、动态图在线迁移、任意框架及全局自主修复保持关闭。任何状态都不能由提示词或 Skill 自动改变。

### 实体化架构

Principal、组织、安全域、任务、步骤、执行、工作契约、交接、修订、来源、候选、审核、发布和诊断分别拥有明确实体与关系。正文用于承载内容，不能把责任、类型、状态和授权全部塞入无类型 JSON。事务负责状态与审计的一致提交，唯一键、外键和不可变历史约束负责并发及追溯。原生资源关联使用稳定标识，不将可变任务状态作为来源身份。

详细说明：[graph-engineering 中文指南](graph-engineering_zh.md)、[organization-governance 中文指南](organization-governance_zh.md)、
[db4a2a 中文指南](db4a2a_zh.md)。

## 记忆、资产与回答质量运维

启用 v5.0.1 对应服务前检查 103–105 和实际结构清单。在 Dashboard“工作区 →
工作交接”分别使用资产、便签、复盘/回答验收区域；平台配置保留在 Dashboard，
Portal 会话不授予管理权限。完整示例与授权要求见[记忆与便签](memory-working-notes_zh.md)、
[Agent 资产](agent-context-assets_zh.md)、[回答质量](answer-quality_zh.md)。

回答不可用时，检查请求/实际检索策略、通道降级、证据状态、当前人员/Agent 读者、
披露策略及模型健康/版本。区分没有证据、部分覆盖、来源矛盾和模型失败。通用模型
回答需要当前补充授权和独立来源说明；关闭后，旧排队补充在派发/发布前也会被阻止。

便签或资产过时，先读取 Work/便签/绑定版本、有效期和精确来源权限。不能通过静默
替换预期版本来消除并发冲突。到期/退役可阻止当前上下文使用，同时保留获准历史。
记忆恢复创建新后继并保存历史来源回执。

同步失败时检查配置 HTTPS 地址/固定提交、允许路径/类型、总字节限制、凭据引用、
来源状态、尝试次数、错误和当前租约栅栏。失败读取不能推进检查点，404 不授权删除
先前发布知识。复盘或验收失败时保留原任务关联、冻结的模型/策略/来源修订及输出摘要。
发送不明保持 `UNOBSERVED`，不自动重发或清理账本/租约。候选需独立审核并显式发布；
最终回答按标准另做事实/引用审核。私有配置、加密证据和凭据不进入公开包或支持摘录。

## 发布判断

本产品精确包摘要须与 PostgreSQL 验收证据一致，包括初始化、受支持升级、实际流程、
原生拒绝、页面和依赖。共享 PG 行为可复用明确绑定的等价性证据，但产品身份、安装、
注册和升级检查仍须对应 OpenTenBase AgentX，不能仅凭相同版本号或其他产品测试通过。

最终发布决定明确通过后才可按声明范围交付；它不保证客户容量、任意主机隔离或数据库
集群高可用。仅清理明确获准的临时 PostgreSQL 测试库，保留基线、系统和受保护 TEST 库。

