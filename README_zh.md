# OpenTenBase AgentX v5.0.4

[English](README.md)

所有版本支持在“平台配置 → 能力与策略 → 访问 IP 限制”中设置 IPv4 / IPv6 白名单或黑名单，支持单个地址及 CIDR 网段，并保留 `127.0.0.1` 本机应急入口。参见[配置与恢复指南](docs/source-ip-access_zh.md)。

基于数据库的 AI Agent 管理平台。任务计划、协作关卡、记忆、知识、通用属性图、
权限和审计记录均以数据库实体保存。外部 Agent 通过受控注册和网关 API 接入；
Portal 对话分配平台托管的本地 Agent。

共享问答将授权检索、独立证据评估和来源标注结合。工作便签、时态记忆、Agent 资产
绑定、配置化来源同步和最终回答验收继续使用已有 Task/Step、Work/Handoff 与候选/
审核实体，保留权限、精确修订及显式发布边界。

v5.0.2 运行契约增加已登记模型资源的持久容量准入和请求观测。结构化回顾继续
进入独立候选审核；受控只读工具轮沿用 Action Card 与 Worker。处理诊断呈现已用
预算与显式恢复回执，MCP 按确切版本选择有界适配器。详见
[模型容量](docs/model-endpoint-capacity_zh.md)、[模型工作流](docs/model-workflows_zh.md)、
[处理恢复](docs/processing-recovery_zh.md)和[MCP 兼容范围](docs/mcp-versioned-interoperability_zh.md)。

本包名称为 **OpenTenBase-AgentX**，版本类型为 **Community**，许可证为
**Apache-2.0**。支持的数据库标识：**pg**。OpenTenBase AgentX 是独立的 PostgreSQL 社区产品。

## 安装与初始化

使用 Python 3.14+ 和 glibc 2.34+ 的受支持 Linux。完整解压并保留 `vendor/`，从包根操作：

1. 将 `config.example.json` 复制为权限 `0600` 的私有 `config.json`，保持
   `database.type=pg`，填写 PostgreSQL 连接、会话密钥及可选模型配置。
2. 执行 `bash scripts/install_offline.sh --database pg`，将本产品 PostgreSQL 依赖
   安装到独立虚拟环境。
3. 由 DBA 准备专用空 PostgreSQL 数据库、受限 Owner，并核对
   `scripts/deploy/0_pg_database_prerequisites.sql` 和[最小权限](docs/minimum-privileges_zh.md)。
   无需额外账户状态视图。
4. 将初始密码写入当前用户拥有、权限 `0600` 或更严格的普通文件，执行
   `bash scripts/install_platform.sh initialize --database pg --edition community
   --version 5.0.4 --config /absolute/path/config.json --admin-password-file
   /absolute/path/admin.password`。保持 `pg` 和 `community`，初始密码至少 12 位。
5. 执行 `./start_web_server.sh start`。Dashboard 为 `/app/`，Portal 为 `/portal`。
   `/api/health` 返回进程身份，`/api/ready` 检查数据库就绪状态。

外部私有配置须在安装前导出 `CX_CONFIG_PATH`，启动保持同一路径；初始化仍须显式传入
`--config`。设置 `CX_DATABASE_DIALECT` 时必须为 `pg`，缺失或冲突的选择在加载驱动前
停止。若设置 `CX_VENV_DIR`，安装、初始化和启动时都需保持一致。

### PostgreSQL 部署

使用 `config.example.json` 和根目录 `requirements.txt`。手工离线安装时，在已激活的
Python 3.14+ 独立虚拟环境中执行：

```bash
python -m pip install --no-index --find-links vendor -r requirements.txt
python scripts/verify_deps.py --database pg
```

使用独立安装目录和虚拟环境。完整前置、初始化、升级、验证及私有恢复状态见
[部署指南](docs/deployment_zh.md)。

## 使用与扩展

- [平台学习知识的独立交付与导入](docs/platform-learning-delivery_zh.md)

- [部署说明](docs/deployment_zh.md)与[迁移指南](docs/migration_zh.md)
- [架构说明](docs/architecture_zh.md)与[API 参考](docs/api-reference_zh.md)
- [Agent 扩展](docs/agent-extensions_zh.md)与[DB4A2A](docs/db4a2a_zh.md)
- [连续性操作](docs/continuity-operations_zh.md)
- [记忆证据、工作便签与任务复盘](docs/memory-working-notes_zh.md)
- [Agent 资产、上下文预算与来源同步](docs/agent-context-assets_zh.md)
- [共享问答与最终回答验收](docs/answer-quality_zh.md)
- [安全说明](docs/security_zh.md)与[交付验证](docs/release-signing_zh.md)
- [原生 Agent 退役与账户状态前置](docs/native-identity_zh.md)
- [访问 IP 配置与本机恢复](docs/source-ip-access_zh.md)
- [版本说明](RELEASE_NOTES_v5.0.4.md)

模型能力按供应商与模型逐项验证。受控集成继续执行授权、隔离、运行限额及数据库
审计检查。社区包不包含企业版专属代码和 SQL。人用户自助注册与外部 Agent 注册
分别配置。
