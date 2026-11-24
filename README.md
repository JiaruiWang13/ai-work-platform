# AI 工作平台

把一个业务问题从提问带到交付。你可以在对话中选择数据源，让助手查数，下载可编辑的 Word、PowerPoint 或 Excel，也可以把相同的指令设为每天自动执行的任务。首次访问附带可回放的业务案例。访客可以接入自己的服务，注册账号后可在多台设备间同步，也可受邀加入已有团队。

[打开公开工作台](https://jiaruiwang13.github.io/ai-work-platform/) · [云服务器直连](https://ai-work-platform-demo.freemyip.com:19558/) · [体验数据库查询](https://jiaruiwang13.github.io/ai-work-platform/#database) · [查看自动化任务](https://jiaruiwang13.github.io/ai-work-platform/#tasks)

网站前端从本仓库的 main 分支发布到 GitHub Pages。聊天、数据库查询、任务和文件生成由自建服务器处理。Pages 的静态资源使用项目相对路径，访客可直接从仓库右侧的 Website 进入。

## 用一次门店复盘体验产品

1. 打开「数据库 → 渠道经营数据 → 查询数据」。默认查询按渠道汇总订单。把 SQL 换成下面这条，可以核对整个数据集。
2. 新建对话，在输入框下方选择「数据库 → 渠道经营数据」，输入「按渠道比较净销售额，为我生成 Excel 明细和两页 PPT」。文件会出现在对应回复和会话空间中。
3. 在「定时任务 → 新建任务」填写「查询订单总数和净销售额，生成 Excel」，选择同一个演示库，设置北京时间和频率，保存并启用。关闭页面后由服务器执行；回来打开该任务的「记录」，即可查看结果和下载文件。

~~~sql
SELECT COUNT(*) AS 订单数, SUM(amount - refund) AS 净销售额
FROM orders;
~~~

演示经营库有 63 笔订单，上面的查询实际返回净销售额 32,946 元。客服库另有 42 条工单，支持按问题分类、状态、处理时长分析。两套库均采用 2026 年 11 月 1–21 日的合成样本。查询在服务器上的只读 SQLite 连接执行。内置数据仅用于案例。新增 PostgreSQL 或 MySQL 连接后，可直接查询自己授权的表或视图，也可把 UTF-8 CSV 导入成独立数据源。

## 接入自己的工作内容

1. **账号与团队。** 点右上角「登录」即可注册。直接注册会把当前浏览器的工作资料带进个人工作空间。管理员在「团队成员」生成一次性邀请码，成员可在注册时填写，也可在「个人设置 → 团队与账号」加入或切换团队。找回码在同一入口生成，请保存在自己的密码管理器中。
2. **模型。** 在「模型管理 → 添加模型」填写 HTTPS 基础地址或完整的 `/chat/completions` 地址、模型 ID 和可选的 Bearer API Key。保存会发送一次短测试。点「设为默认」后，对话、SQL 规划、可编辑 Office 文件和后台计划都使用选定的模型。检测和实际推理会消耗服务商的额度。对话需要兼容 OpenAI 的聊天流式协议，文档生成还需要模型能按指令返回 JSON。
3. **数据库。** 在「数据库」填写 PostgreSQL 或 MySQL 主机、端口、库名、表或视图、只读账号和密码。服务端校验 TLS 后读取字段。每个连接限定一张表或视图，支持单表 SELECT、筛选、分组、排序及常见聚合，单次最多返回 50 行。若需跨表分析，可由数据库管理员创建业务视图。没有数据库账号时可导入带表头的 UTF-8 CSV，最多 64 KB、500 行、32 列。
4. **文件、笔记与技能。** 文件管理支持上传最大 4 MB 的文件并保留原件。Word、Excel、PPT、Markdown、文本和 CSV 可提取文字。PDF 和中英文图片可在预览中点「提取文字」，在对话中引用也会触发提取。PDF 正文最多处理前 40 页，扫描件 OCR 处理前 3 页，预览文本上限 24,000 字。可在新建笔记时从文件填入正文、为技能编写执行要求、给员工绑定技能和默认数据源。聊天按问题选取适合模型上下文的文字节选。
5. **自动化。** 新建任务时可指定员工、技能、笔记、文件和数据库。选中文字作为保存时的快照，数据查询与模型调用在实际执行时发起。每个工作空间最多 8 个计划，保留各计划最近 8 次后台记录。预置任务需要保存并启用才会在服务器运行。
6. **MCP。** 在「个人设置 → MCP 工具」接入 HTTPS Streamable HTTP 服务，可设置 Bearer Token。打开后可浏览已声明的工具、读取文本资源、查看参数格式并手动确认调用。结果可整理为笔记，继续用于对话或任务。示例域名是待配置的样例。

### 存储与权限

- 访客的内容保存在浏览器，已验证的连接和后台计划属于该浏览器的工作空间。注册后，可用同一账号在其他设备登录。换设备前在「个人设置」确认状态为「已同步」。
- 团队同步包括会话、上传与生成的文件原件、知识笔记、技能、员工、团队分工和项目。不同记录独立同步，同一记录在两处同时修改会提示选择版本。单工作空间同步容量为 40 MB，最多 2000 项记录。个人对话偏好按账号保存。
- 管理员管理团队成员、邀请和服务凭据，成员可以使用已授权的连接及共享内容。服务凭据、同步文件块和个人偏好在服务端加密保存，连接列表不会返回 API Key 或数据库密码。选进对话或任务的资料和查询结果会发给当前模型服务商。
- 公共部署连接可路由的公网主机，模型和 MCP 使用 HTTPS，数据库使用校验主机名的 TLS。私有部署可通过 `WORKSPACE_PRIVATE_HOSTS` 明确列出允许的内网主机，并安装相应 CA。不要在公开实例中把回环地址或云元数据服务加入名单。
- 登录有效期为 14 天，邀请码有效期为 7 天且仅能使用一次。移除成员会撤销其团队会话。成员已下载到个人设备的文件仍由其持有。

## 本地预览

使用 Node.js 22 或更高版本。在仓库根目录运行：

~~~sh
node server/build.mjs
node server/preview.mjs
~~~

打开 http://127.0.0.1:5091 即可查看前端、预置案例和已有示例附件。仅接入兼容模型时，可为预览进程设置服务端变量 MODEL_CHAT_URL 和 MODEL_API_KEY。当前默认模型标识为 qwen3.8-27b。

## 运行查询、调度和文件服务

完整部署由网页服务、Python 后台和模型端点组成。网页服务负责请求模型与校验文件结构，Python 后台执行查询、轮询到期任务并保存执行结果。定时运行复用对话的模型和文件生成代码。公共仓库自带基于 python-docx、python-pptx 和 openpyxl 的可编辑文件渲染器。Word 生成原生表格、重复表头和动态页码。PPT 可按要求生成原生柱形图、条形图和折线图，数据随演示文稿保存。Excel 支持本工作簿内的跨表公式、绝对引用和百分比格式。含公式的工作簿会先用 LibreOffice Calc 重算，计算错误会阻止交付。部署 Excel 生成服务时，请在 Python 后台主机安装 LibreOffice Calc，并确保进程能调用 `soffice`。

以下为单机开发环境示例。需要 Python 3.11+、Node.js 22+，以及提供相同模型标识的兼容推理服务。默认推理服务位于本机 8000 端口；可用 MODEL_ORIGIN 指定其他主机。以下操作从仓库根目录开始：

~~~sh
mkdir -p .runtime
python3 -m venv .runtime/venv
.runtime/venv/bin/pip install -r server/requirements.txt
(umask 077; openssl rand -hex 32 > .runtime/bridge-key)
~~~

将推理服务的 API 密钥保存到 .runtime/api-key。两个凭据文件均仅供服务端使用。在一个终端启动后台：

~~~sh
cd .runtime
export WORKSPACE_DATA="$PWD/data"
./venv/bin/uvicorn --app-dir ../server autodl_bridge:app --host 127.0.0.1 --port 6006
~~~

在另一个终端从仓库根目录启动网页服务：

~~~sh
export MODEL_BRIDGE_URL=http://127.0.0.1:6006/workspace-bridge
export MODEL_BRIDGE_KEY="$(cat .runtime/bridge-key)"
node server/build.mjs
node server/preview.mjs
~~~

PDF 和图片文字识别另需安装 Poppler 工具及 Tesseract 的中英文语言包（Debian/Ubuntu 为 `poppler-utils tesseract-ocr tesseract-ocr-chi-sim`）。后台首次启动会创建订单库、工单库以及存放账号、团队、连接和任务记录的工作空间库。请备份工作数据及独立保管的 bridge-key，已有加密资料需要原密钥才能解密。恢复运行后，每项逾期任务补跑一次，再进入下一次计划。生产环境需为工作目录使用持久磁盘，并保持后台进程在线。

## 代码入口

- dist/app.js 包含工作台、会话、数据库与任务界面。dist/showcase.js 保存可回放案例。
- server/model.mjs 处理模型回复，server/office.mjs 和 server/office_render.py 负责文档生成。
- server/workspace.mjs 将自然语言问题转换为只读查询。server/workspace.py 管理实际数据库、查询限制、任务和文件归属。
- server/job-run.mjs 在调度触发时执行任务。server/build.mjs 将静态资产和服务端路由打包为可部署的 Worker。

~~~sh
node --test server/*.test.mjs
python3 -m unittest discover -s server -p 'test_*.py'
~~~


## 在 GitHub Pages 发布

在仓库 Settings → Pages 将 Source 设为 GitHub Actions。在 Settings → Secrets and variables → Actions 的 Variables 中设置 PUBLIC_API_ORIGIN 为自建服务的 HTTPS 源（含非标准端口，如有）。该值是公开地址。连接凭据只在提交时经 HTTPS 发往后台，仓库和静态资源中不含用户密钥。

同源部署直接使用页面所在的服务地址。跨域部署请为 Node 服务设置 SERVICE_ORIGIN 为它自己的公网 HTTPS 源、PAGES_ORIGIN 为允许访问的 GitHub Pages 源。多个来源用英文逗号分隔，例如 `https://jaredwangx.github.io,https://jiaruiwang13.github.io`；服务器仅允许精确匹配的来源。TLS 反向代理将请求转发到只监听回环地址的 Node 服务。修改 main 或手动运行 Publish workspace to GitHub Pages 后，将重新发布前端。
