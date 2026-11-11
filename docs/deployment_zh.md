# 部署指南 v5.0.5

> 当前软件包：**OpenTenBase AgentX**；支持底座：**pg**；版本类别：**Community**；许可：**Apache-2.0**。文中其他底座及企业专属能力用于说明差异，不表示此包包含或支持这些能力。

[English](deployment.md)

## 产品与数据库选择

本包为 **OpenTenBase AgentX**，是采用 **Apache-2.0** 的独立 **PostgreSQL 社区产品**。
配置使用 `database.type=pg` 和包内 `config.example.json`。任务、步骤、记忆、知识、
属性图、身份授权和审计继续以数据库实体保存。初始化和升级检查产品身份；版本号相同
不表示其他产品的软件包可以直接互换。

## 环境准备

使用 Python 3.14+、glibc 2.34+ 的受支持 Linux，完整保留包括 `vendor/` 在内的软件包。
由 DBA 准备专用 PostgreSQL 数据库和非超级用户的受限 Schema Owner。数据库及扩展
前置见 `scripts/deploy/0_pg_database_prerequisites.sql` 和
[最小权限](minimum-privileges_zh.md)。不要将主机管理员或 PostgreSQL 超级用户凭据
写入运行配置。

控制面能启动不代表具备本地 Agent 隔离能力；按[平台兼容性](linux-platform-compatibility_zh.md)
和[运行隔离](runtime-isolation_zh.md)验证确切主机。

## 配置和安装

1. 在可信的独立安装目录完整解压，从包根目录操作。将 `config.example.json` 复制为
   权限 `0600` 的 `config.json`。
2. 保持 `database.type` 为 `pg`，填写 `user`、`password`、`host`、`port`、`dbname`、
   `security.secret_key`、可选模型/Embedding 配置及 `server.host`、`server.port`。
   部署和管理使用受限 Owner，不使用超级用户或普通 Agent 凭据。
3. 使用外部私有配置时，在安装前导出 `CX_CONFIG_PATH=/absolute/path/config.json`。
   启动器读取该变量，部署 CLI 仍须显式传入 `--config "$CX_CONFIG_PATH"`。
   后续终端和服务管理器都保持同一路径。
4. 执行 `bash scripts/install_offline.sh --database pg`，创建包内 `.venv`。
   `PYTHON_BIN` 选择解释器，`CX_VENV_DIR` 选择独立环境。若指定 `CX_VENV_DIR`，
   安装、初始化和启动时须保持一致。安装器仅安装 PostgreSQL 依赖。

设置 `CX_DATABASE_DIALECT` 时必须为 `pg`，并与配置一致；不支持或冲突的选择会在
加载驱动前停止。本产品完整依赖在根目录 `requirements.txt`，不使用
`requirements/数据库标识.txt` 或其他底座的配置文件。

需要手工离线安装时，先创建并激活独立的 Python 3.14+ 虚拟环境，再执行：

```bash
python -m pip install --no-index --find-links vendor -r requirements.txt
python scripts/verify_deps.py --database pg
```

依赖检查验证包内文件；数据库就绪仍需后续初始化或验证。外部访问还受监听、路由、
防火墙和代理配置约束。反向代理场景配置 HTTPS、可信代理和 `CX_PUBLIC_BASE_URL`；
不能仅凭请求中的转发地址就将其作为可信模型网关。

## 初始化数据库

先由 DBA 按 `scripts/deploy/0_pg_database_prerequisites.sql` 准备专用空 PostgreSQL
数据库、受限 Owner 和必要扩展。Agent 身份由 PostgreSQL 原生角色隔离，无需额外的
账户状态视图。普通 Agent 不得持有 Owner 后备凭据，见[原生身份操作](native-identity_zh.md)。

包内恰有一个 `scripts/deploy/baseline_v*.json`。本版 PostgreSQL 迁移链在 102 后增加
`103_v5_0_1_memory_quality.sql`、`104_v5_0_1_context_assets.sql` 和
`105_v5_0_1_answer_quality.sql`，每项均带结构清单。历史 SQL 和已应用校验和保持原身份。

v5.0.5 继续执行 106–114、117、120、119、121；当前 PostgreSQL 终点为
**121**，120 是在 119 前执行的前置。核验 121 的原生自有上下文读取、其他上下文/
伪造身份/直接写入拒绝及完整历史链。从 v5.0.4 的明确升级流程见
[迁移](migration_zh.md)，历史引入脚本不是当前终点。

部署后同时核对时间/便签/复盘、上下文/资产/来源和回答质量的实际对象、APPLIED 记录
及脚本摘要。不能用终点 105 的账本记录代替缺失的 103 或 104 对象。已有数据、Agent
SQL 拒绝和 Task/Step/连续性依赖仍属升级验证范围；空库初始化不证明已有数据转换通过。

将初始管理员密码写入当前用户拥有、权限为 `0600` 或更严格的普通文件，从包根目录执行：

```bash
export CX_CONFIG_PATH=/absolute/path/config.json
bash scripts/install_platform.sh initialize \
  --database pg --edition community --version 5.0.5 \
  --config "$CX_CONFIG_PATH" \
  --admin-password-file /absolute/path/admin.password
```

保持上述数据库和版本类别参数。交互模式可提示输入密码，须满足现有的至少 12 位策略；
没有通用默认管理员密码。初始化检查空目标、执行绑定校验和的清单、创建 Human 管理员
及原生管理身份、发布产品事实、核对就绪状态后退休临时部署身份，不依赖真实模型或外部 Agent。

## 升级、恢复和验证

已有平台数据不能走空库初始化。确认数据库侧备份和恢复责任后，使用
`upgrade --confirm-database-backup`；未知或部分结构先查看部署日志，选择
原 `--run-id` 执行 `resume`。不要修改已应用迁移，也不要删除迁移账本。
详见[迁移指南](migration_zh.md)。

部署日志与密钥保存在包的私有 `.runtime/deployment/` 中。重建或替换程序目录
前保留配置、密钥和恢复日志，不要把它们放进公开软件包。

```bash
export CX_CONFIG_PATH=/absolute/path/config.json
bash scripts/install_platform.sh verify \
  --database pg --edition community --version 5.0.5 \
  --config "$CX_CONFIG_PATH"
./start_web_server.sh start
./start_web_server.sh status
```

Dashboard 入口是 `/app/`，Portal 入口是 `/portal`。`/api/health` 表示进程存活，
返回产品与版本；`/api/ready` 检查数据库和控制面结构就绪，二者不能互相代替。
启动器默认使用包内 `.runtime/web.pid`，不同安装目录互不复用 PID 文件。

## 治理、注册和模型

启动模式来自 `CX_RUNTIME_PROFILE`，默认 `production`，它不修改数据库治理记录。
平台能力以 `CX_PLATFORM_CAPABILITIES` 为准，图工程细分能力以
`CX_GRAPH_CAPABILITY_MATRIX` 为准；缺记录、配置不一致或数据库不可达时不可
按已启用处理。环境变量不能扩大许可证或身份权限。

人用户注册入口由人注册策略控制，外部 Agent 注册由独立策略控制。
Portal 使用本地托管 Agent；频道中的 Agent 需要成员关系、激活、运行条件和
数据访问授权。知识库未命中且问答策略允许模型补充时，才可由模型回答，并显示
独立的来源标注。

为模型服务配置地址、模型名称和必要的私有密钥后，执行健康检查和能力探测。
结构化输出、工具调用或取消能力依赖具体服务，不由模型名称推断。
MCP、A2A、框架 Agent、遥测和回放能力仍受各自开关、授权和隔离条件约束。
当前能力评估见[Agent 扩展](agent-extensions_zh.md)。

新增工作流见[记忆与工作便签](memory-working-notes_zh.md)、
[Agent 资产与来源同步](agent-context-assets_zh.md)、[最终回答验收](answer-quality_zh.md)。
来源同步和模型复盘均为显式作业，部署或访问页面不会自动启用发布、定时计划或新的
受控能力默认值。

停止服务使用 `./start_web_server.sh stop`；重启使用 `restart`。保留任务和
Worker 租约状态以便数据库驱动恢复，不要通过删表或清空任务来消除报错。
