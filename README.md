# OpenTenBase AgentX introduction website / 产品介绍网站

Standalone bilingual static website for OpenTenBase AgentX v5.0.5. It covers
product positioning, core capabilities, external enrollment and managed work,
deployment, official GitHub repository links and explicit boundaries.
There is no product demo, private configuration, account login or analytics.

独立中英文静态网站：概览、核心能力、Agent 接入、部署与获取四页。所有软件
与配套资料入口统一指向 https://github.com/OpenTenBase/OpenTenBase-AgentX 。
网站不附带软件 ZIP、学习 JSON 或本地下载目录。

Open `index.html` directly, or serve this directory with any static HTTP server.
For GitHub Pages, upload the **contents** of the website ZIP to the selected
Pages root. Keep assets and `.nojekyll`. No custom domain is assumed.
The owner selects publication and any custom-domain configuration separately.

直接打开 index.html 或以静态 HTTP 服务预览。发布 GitHub Pages 时将网站 ZIP
内容放入选定发布根，保留 assets 和 .nojekyll。没有预设域名；上传、
发布与域名配置由所有者决定。语言选择存于本地浏览器，无网络字体或第三方脚本。

Software scope: PostgreSQL/OpenTenBase foundation through the existing `pg` adapter; Community, Apache-2.0. Enterprise-only approval,
compliance and audit viewer modules are excluded. Protocol support is subject
to current capability posture. Operators must implement the managed-work duty
in their runtime; the server cannot compel arbitrary external processes.

The official OpenTenBase emblem is reused unchanged from the software's approved
asset. Marks retain their existing rights; this site does not claim sponsorship
or endorsement. Upstream: https://www.opentenbase.org/ .

Source builder: `build.py`; shared styles/behavior: `assets/site.css`, `assets/site.js`.
Build from the main project using Python 3.14 and explicit `--version`,
project-local `--output`. Each version must review content,
official repository links and layouts in both languages; deliver the same canonical
website filename, source recovery checkpoint, manifest and current pointer.
The canonical delivery is `build_output/v<version>/websites/agentx/` in the main
project. This independent site is not bundled into Chuanxu's public website.
