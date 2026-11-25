const note = (title, text, table) => ({title, text, ...(table ? {table} : {})});
const table = (columns, rows, formats) => ({columns, rows, ...(formats ? {formats} : {})});
const pct = (part, total, digits = 2) => (100 * part / total).toFixed(digits) + '%';
const num = value => value.toLocaleString('zh-CN');
const delta = value => (value > 0 ? '+' : '') + value.toFixed(1);

const salesRaw = [
  ['官网', 191000, 214000, 2750, 3030, 56, 64],
  ['平台旗舰店', 133000, 142000, 2200, 2270, 70, 104],
  ['分销', 70000, 70000, 500, 500, 9, 9],
];
const totals = ['合计', ...salesRaw[0].slice(1).map((_, i) => salesRaw.reduce((sum, row) => sum + row[i + 1], 0))];
const [ , baseSales, currentSales, baseOrders, currentOrders, baseRefunds, currentRefunds] = totals;
const rawColumns = ['渠道', '上周支付额（元）', '本周支付额（元）', '上周支付单', '本周支付单', '上周退款单', '本周退款单'];
const rawFormats = ['text', 'integer', 'integer', 'integer', 'integer', 'integer', 'integer'];
const rawChannels = table(rawColumns, salesRaw, rawFormats);
const channels = table(['渠道', '上周（万元）', '本周（万元）', '增量（万元）', '本周支付单', '本周退款单', '本周退款率'],
  [...salesRaw, totals].map(([name, before, after, , orders, , refunds]) =>
    [name, (before / 10000).toFixed(1), (after / 10000).toFixed(1), delta((after - before) / 10000), num(orders), num(refunds), pct(refunds, orders)]));
const skuRaw = [
  ['A104', 290, 9, 338, 23, '平台运营', '批次记录、退款备注和质检记录'],
  ['B207', 256, 10, 278, 20, '履约', '承诺发货、出库和取消申请时间'],
];
const skuRates = table(['SKU', '上周退款／支付', '本周退款／支付', '退款单增量', '优先核对', '负责人'],
  skuRaw.map(([id, p0, r0, p1, r1, owner, evidence]) =>
    [id, `${r0}/${p0} · ${pct(r0, p0, 1)}`, `${r1}/${p1} · ${pct(r1, p1, 1)}`, `+${r1 - r0} 单`, evidence, owner]));
const weeklyScope = '经营演示样表。上周为 11 月 2–8 日，本周为 11 月 9–15 日（均为北京时间）。支付额指折扣后商品实付额，未减退款，不含运费和税费。订单按支付日归属，退款订单按订单号去重，每周都使用周末后七天作为观察窗。';
const weeklySummary = `支付额从 ${baseSales / 10000} 万元增至 ${currentSales / 10000} 万元，周环比 +${pct(currentSales - baseSales, baseSales, 1)}。官网增加 2.3 万元，占新增支付额 ${pct(23000, currentSales - baseSales, 1)}。整体退款率从 ${pct(baseRefunds, baseOrders)} 升至 ${pct(currentRefunds, currentOrders)}，旗舰店本周为 ${pct(104, 2270)}。`;
const weeklyActions = table(['行动', '负责人', '时限', '关闭证据'], [
  ['核对 A104 本周 23 笔退款，按批次分组', '平台运营', 'T+1 12:00', '附退款备注和批次号，标记无法关联的订单'],
  ['核对 B207 本周 20 笔退款的时间顺序', '履约', 'T+1 15:00', '列出承诺发货、实际出库、取消申请时间'],
  ['回访未归因订单并更新周报', '客服、经营分析', 'T+2 17:00', '逐单填写已确认原因或待核实，复核两周分母'],
]);
const weeklySections = [
  note('本周结论', weeklySummary + ' 建议维持官网当前动作，旗舰店新增投放等两款商品的退款证据核清后再评估。'),
  note('渠道表现', '本周支付订单 5,800 笔，上周 5,450 笔，增加 6.4%。单均支付额从 72.29 元升至 73.45 元。支付额的增长主要伴随订单增加。缺少曝光、券成本及访客数据，暂无法判断活动增量或利润变化。', channels),
  note('旗舰店异常', '旗舰店退款单从 70 笔升至 104 笔。A104 与 B207 共贡献 24 笔增量，占旗舰店退款增量 70.6%。批次问题和履约延迟是核查方向，目前都待证实。', skuRates),
  note('下一步分工', 'T 为复盘日。所有退款原因保留订单级证据，按场景回填至同一清单。', weeklyActions),
  note('统计口径', weeklyScope),
];

const sources = {
  october: 'https://www.nea.gov.cn/20261120/b5c5d572988c4171982367855f9a1b26/c.html',
  december: 'https://www.nea.gov.cn/20260121/da0f536fbafe4545820a2f64465e773b/c.html',
  policy: 'https://www.ndrc.gov.cn/xwdt/tzgg/202510/P020251015596625238420.pdf',
  rollout: 'https://sre.google/workbook/canarying-releases/',
};
const charging = table(['全国充电枪（万个）', '2025 年末', '2026 年 10 月末', '期末净增'], [
  ['公共', 471.7, 528.3, 56.6], ['私人', 1537.5, 2010.8, 473.3], ['合计', 2009.2, 2539.1, 529.9],
]);
const evidence = table(['编号', '证据类型', '可支持的判断', '下一步或边界'], [
  ['P01 / P02', '国家能源局公开统计', '全国公共枪增长，私人枪占两期净增约 89.3%', '全国枪数不说明某个站点的高峰等待'],
  ['P03', '六部门行动方案', '2027 年底建设目标为 2,800 万个设施', '区分政策目标和已实现数量，暂不作为收入预测依据'],
  ['R01', '模拟站点记录', '12 个工作日通勤站中，5 个有晚间巡检时段', '补齐其余 7 站，并记录在线枪数和排队时长'],
  ['R02', '模拟访谈', '同一社群 6 人中 4 人提到下班后排队', '纳入其他社群与时段，记录实际等待分钟数'],
  ['R03', '模拟服务商报价', '甲方包安装，乙方单列安装费', '对齐地址、配置、施工范围和维保，再比较总价'],
]);
const researchSections = [
  note('建议优先验证晚高峰可用性', '先验证通勤场景的到站等待与可用枪数。对带实时状态的提示做低成本试点，先用小样本站点观察是否能帮司机在出发前作出更好的选择。扩站决策还需要客流、周转与成本数据。'),
  note('全国供给扩大，公共和私人分开看', '2026 年 10 月末，全国充电枪 2,539.1 万个，其中公共枪 528.3 万个，同比增长 16.5%。相较 2025 年末的期末净增为 529.9 万个，私人枪贡献 473.3 万个（89.3%）。表中的净增跨十个月，同比数据与其使用不同基期。', charging),
  note('政策与局部证据', '行动方案提出到 2027 年底建成 2,800 万个充电设施。这个目标反映供给方向。站点、访谈和报价为本案例模拟材料，适合提出局部假设。', evidence),
  note('下一轮如何验证', '先补齐 12 站的晚间记录。在两个工作日，分别按 18:00–19:00、19:00–20:00 记录到站数、在线枪数、排队人数、实际等待和未充离开数。把同一站点的不同时段分开，先列等待中位数和超 15 分钟比例，再看引导是否值得试点。'),
  note('公开来源与统计边界', `P01 · 国家能源局 2026 年 10 月充电设施数据：${sources.october}\nP02 · 国家能源局 2025 年 12 月充电设施数据：${sources.december}\nP03 · 电动汽车充电设施服务能力“三年倍增”行动方案：${sources.policy}`),
];

const options = table(['路径', '验证价值', '主要代价', '决策'], [
  ['一次开放全部团队', '覆盖较多业务条件', '口径与权限遗漏会同时暴露', '暂缓'],
  ['两个团队先行试点', '在两个角色和真实核查步骤中验证交付', '需维护旧入口和人工复核', '采用'],
  ['维持旧表，暂不开放', '现有复核流程可持续', '无法验证新流程能否降低总耗时', '保留为回退'],
]);
const launch = table(['节点', '工作内容', '负责人', '完成标准'], [
  ['发布前两天', '固定订单口径、旧模板与 48 个任务样本', '产品、数据', '两团队逐项确认字段、权限和对照口径'],
  ['试点首日', '向两团队各开放 12 个账号', '运营、研发', '入口仅试点可见，关闭开关与模板入口复核通过'],
  ['第 2–7 天', '跟进重复任务、异常和复核耗时', '运营、客服、测试', '记录成功、超时、错数、退回及修订'],
  ['第 8 天', '复核可用率、关键数对账和端到端耗时', '产品、数据', '签字通过后评估扩大，未达标继续试点'],
]);
const launchGates = table(['指标', '扩大试点前的目标', '口径或处置', '负责'], [
  ['有效交付', '至少 46/48', '每次任务须有正文、可打开的 Excel 和同口径汇总。失败或重试不换分母。', '测试'],
  ['关键数字与权限', '错数 0 次，越权 0 次', '逐份核对销售额、退款单数和租户权限。命中即暂停试点入口。', '数据、研发'],
  ['等待时长', 'P90 ≤ 90 秒', '以提交至产物可预览为准，超时计入失败；列表同时呈现失败数。', '研发'],
  ['人工总耗时', '中位数 ≤ 13 分钟', '方案假设对照中位数 20 分钟，计准备、生成、核查和修改。用同批任务实测后再计算变化。', '产品'],
]);
const launchChecks = table(['检查项', '通过条件', '负责人', '失败时处理'], [
  ['桌面入口', '白名单账号能进入并下载可编辑工作簿', '产品', '暂停开放并切回手工模板'],
  ['手机入口', '可读结论、可预览附件、旧入口可达', '测试', '阻断发布，修复设备适配'],
  ['数据权限', '两团队只能取各自的只读数据，试点外账号无新入口', '研发', '立即关闭开关，按日志定位'],
  ['客服交接', '搜索下载失败可找到旧模板、工单字段与升级路径', '客服', '补齐客服口径后复核'],
  ['口径核查', '正文、Excel、源数据的支付额与退款单数一致', '数据', '封存错误产物并复核同批任务'],
]);
const launchSections = [
  note('立项建议', '为销售运营试点发布“经营周报助手”。先向两个团队的 24 个账号开放一周，保留手工模板入口。会议需要决定试点范围、验收负责人和暂停条件。24 个账号和 48 次任务均为演示方案的设计值。'),
  note('三种路径的取舍', '同两团队每个账号安排两个样本任务，共 48 次。范围固定为销售额和退款周报，扩展到经营预警另行评审。', options),
  note('排期和分工', '运营从白名单和任务样本准备开始，研发确保系统能关闭单独入口。测试同时检查手机和桌面。', launch),
  note('验收和扩围条件', '所有门槛是拟定目标。试点结果按用户和任务编号记录，准备和返工都计入人工耗时。', launchGates),
  note('成本与回退', '按额外投入 12 工时、每小时 150 元估算人工 1,800 元，工具和试验调用预留 100 元，合计 1,900 元，预算上限 2,000 元。发现关键错数、越权或阻断下载时，由研发关闭试点开关，运营发放旧模板，数据负责人复核已交付产物。修复后用原任务重跑并签字。'),
  note('放量原则', `每次评审同时看扩大条件和立即停止条件。方法参考：${sources.rollout}`),
];
export const briefingSlides = [
  note('先让两个团队跑通周报', '经营周报助手发布评审｜演示方案\n\n24 个试点账号 · 48 次对照任务 · 一周观察'),
  note('为什么先试点，再扩大', '1. 直接开放全员会把权限和口径风险同时放大。\n2. 两个团队已足以让经营、数据、客服走完交付流程。\n3. 保留原模板，用户遇到故障仍能交周报。'),
  note('一周的四个交接点', '1. 发布前确认只读权限、订单口径和 48 个任务样本。\n2. 首日由运营开放 24 个账号，验证回退入口。\n3. 第二至七天记录对账、失败与人工复核。\n4. 第八天按同一口径评审是否扩大。'),
  note('扩大范围前需要哪些证据', '1. 至少 46/48 次交付有效，错数和越权均为零。\n2. 端到端预览 P90 不超过 90 秒，失败单列。\n3. 同批任务对照，人工总耗时中位数目标 13 分钟以内。'),
  note('发现错误就切回旧模板', '1. 错数、越权或下载阻断触发暂停。\n2. 研发关试点开关，运营引导回手工模板。\n3. 数据负责人复核历史产物，原任务复验通过后恢复。'),
  note('今天需要拍板的事项', '1. 同意 24 个账号与 48 次任务的试点范围。\n2. 确认 1,900 元成本估算，预算上限 2,000 元。\n3. 确认数据验收人、研发回退人和第八天评审时间。'),
];

const sales = [['1 月', 42], ['2 月', 48], ['3 月', 45], ['4 月', 62], ['5 月', 68], ['6 月', 84]];
const salesTable = table(['月份', '销售额（万元）', '环比'],
  sales.map(([month, value], i) => [month, value, i ? pct(value - sales[i - 1][1], sales[i - 1][1], 1) : '—']));

export const exampleFiles = [
  {id:'case-weekly-doc', name:'经营周报.docx', type:'文档', asset:'weekly-report.docx', title:'渠道经营周报', hint:'经营演示数据 · 渠道变化、异常与责任人', sections:weeklySections},
  {id:'case-weekly-sheet', name:'渠道明细.xlsx', type:'表格', asset:'channel-breakdown.xlsx', title:'渠道明细', hint:'两周渠道汇总 · SKU 核查 · 原始分母', sections:[
    note('渠道汇总', '合计退款率使用总退款单除以总支付单。', channels),
    note('商品异常', '同一旗舰店内比较两周支付和退款分母。', skuRates),
    note('渠道原始数据', weeklyScope, rawChannels),
  ]},
  {id:'case-weekly-input', name:'渠道经营记录.xlsx', type:'表格', asset:'channel-source.xlsx', title:'两周渠道经营记录', hint:'演示输入 · 支付额、支付和退款计数', sections:[
    note('渠道原始数据', weeklyScope, rawChannels),
    note('两款 SKU 记录', '支付与退款使用相同周归属和观察窗。两款单品订单均属于平台旗舰店。', table(
      ['SKU', '上周支付单', '上周退款单', '本周支付单', '本周退款单'], skuRaw.map(row => row.slice(0, 5)), ['text', 'integer', 'integer', 'integer', 'integer'])),
  ]},
  {id:'case-refunds', name:'退款核对清单.md', type:'文档', title:'退款核对清单', hint:'先验事实、待核原因和负责团队', sections:[
    note('复核范围', '平台旗舰店本周 104 笔退款订单中，A104 有 23 笔、B207 有 20 笔。先核查这 43 笔，再比对上周同样口径。', skuRates),
    note('分工与关闭条件', '经营分析按订单号去重。记录原因与证据后，由相应负责人复核。', weeklyActions),
  ]},
  {id:'case-sales', name:'月度销售明细.xlsx', type:'表格', asset:'monthly-sales.xlsx', title:'上半年销售明细', hint:'六个月实际用于示例图的数值', sections:[
    note('月度明细', '金额单位为万元。一月作为基期。', salesTable),
    note('复盘备注', '四月在低基数上环比增长 37.8%。六月销售额最高，84 万元，达到一月的两倍。'),
  ]},
  {id:'case-launch', name:'新品发布方案.docx', type:'文档', asset:'launch-plan.docx', title:'经营周报助手发布方案', hint:'三种方案对比 · 排期 · 验收与回退', sections:launchSections},
  {id:'case-launch-input', name:'新品需求笔记.md', type:'文档', title:'经营周报助手发布需求', hint:'试点范围、资源和待决定事项', sections:[
    note('需求背景', '销售运营每周都要交经营周报。团队考虑把核查和附件生成接入工作台。试点范围为两个团队，保留旧流程。'),
    note('评审所需材料', '请比较全量发布、小范围试点与维持原流程。写清人员安排、边界、评审门槛和降级通道，供产品、研发、数据及客服一起评审。'),
  ]},
  {id:'case-launch-deck', name:'新品发布启动会.pptx', type:'幻灯片', asset:'launch-brief.pptx', title:'经营周报助手试点启动会', hint:'6 页可编辑演示稿 · 供团队评审', sections:briefingSlides},
  {id:'case-launch-checks', name:'渠道上线验收.csv', type:'表格', title:'渠道上线验收', hint:'上线前检查项 · 验收标准和负责人', sections:[note('渠道验收', '以下为待执行的验收项目，现场签字后再放量。', launchChecks)]},
  {id:'case-research-input', name:'调研摘录.md', type:'文档', title:'充电服务调研摘录', hint:'3 条公开来源 · 3 组模拟材料', sections:[
    note('P01 / P02 · 设施供给数据', `国家能源局通过充电设施监测服务平台统计充电枪。P01 为 2026 年 10 月：${sources.october}\nP02 为 2025 年 12 月：${sources.december}`, charging),
    note('P03 · 行动方案', `六部门提出到 2027 年底建成 2,800 万个充电设施。原文：${sources.policy}`),
    note('R01–R03 · 局部模拟资料', '12 站中仅 5 站有晚间巡检记录。同一社群 6 名受访者中 4 人提到下班后排队。甲报价含安装，乙单列安装费。', evidence),
  ]},
  {id:'case-research', name:'行业研究简报.md', type:'文档', title:'城市公共充电服务机会分析', hint:'公开统计、局部样本与验证安排', sections:researchSections},
  {id:'case-evidence', name:'研究证据台账.csv', type:'表格', title:'充电研究证据台账', hint:'区分公开统计、政策目标和案例样本', sections:[note('证据与核查', '按 P01–P03 和 R01–R03 回到调研摘录。', evidence)]},
];

export function fileText(file) {
  if (!file.sections) return file.content || '';
  return [file.title, ...file.sections.map(({title, text, table}) =>
    [title, text, ...(table ? [table.columns, ...table.rows].map(row => row.join(' | ')) : [])].join('\n'))].join('\n\n');
}

for (const file of exampleFiles) {
  if (file.asset) continue;
  if (file.name.endsWith('.csv')) {
    const {columns, rows} = file.sections[0].table;
    file.mime = 'text/csv;charset=utf-8';
    file.content = '\uFEFF' + [columns, ...rows].map(row => row.map(cell => '"' + String(cell).replaceAll('"', '""') + '"').join(',')).join('\r\n') + '\r\n';
  } else {
    file.mime = 'text/markdown;charset=utf-8';
    file.content = '# ' + file.title + '\n\n' + file.sections.map(({title, text, table}) => {
      const grid = table ? [table.columns, table.columns.map(() => '---'), ...table.rows].map(row => '| ' + row.join(' | ') + ' |').join('\n') : '';
      return '## ' + title + '\n\n' + text + (grid ? '\n\n' + grid : '');
    }).join('\n\n') + '\n';
  }
}

export const examples = [
  {
    id:'operations', label:'经营周报', icon:'clipboard-list', input:'case-weekly-input',
    summary:'从两周经营数据判断销售增量与退款风险',
    next:'如果旗舰店只有半天时间，先核查哪些订单？',
    prompt:'用这两周的渠道记录写一份经营周报。请回答销售增量来自哪里、退款风险有多大、接下来由谁核查，并附可继续编辑的 Word 和 Excel。',
    steps:['读取两周渠道和 SKU 数据','按同一观察窗复核支付与退款分母','拆解增量并写入可编辑的周报和明细'],
    reply:{title:'官网拉动增长，旗舰店退款先核查', text:`**经营判断。** ${weeklySummary}\n\n**异常优先级。** 旗舰店增加 34 笔退款，其中 A104 增加 14 笔、B207 增加 10 笔，两款合计占 70.6%。先查这两款的批次和时间记录，再决定是否调整商品或活动。\n\n**统计口径。** ${weeklyScope}`, ...channels, files:['case-weekly-doc','case-weekly-sheet']},
    follow:{prompt:'把两款商品的核查拆给运营与履约。需要采哪些证据？', steps:['用 SKU 记录复算退款率','拆出责任人、时限和关闭证据'],
      reply:{title:'优先核查 43 笔退款订单', text:'A104 本周 23/338 笔退款（6.8%），上周 9/290（3.1%）。请运营核对批次、退款备注和质检记录。B207 本周 20/278 笔（7.2%），上周 10/256（3.9%）。请履约核对承诺发货、出库和取消时间。原因不明的订单标记待核，客服回访后再归类。', files:['case-refunds']}},
  },
  {
    id:'sales', label:'上半年销售分析', icon:'chart-no-axes-combined',
    prompt:'上半年的销售额有什么变化？请画出月度趋势。',
    steps:['汇总 1–6 月销售额','核对四月环比增幅','写入月度销售明细.xlsx'],
    reply:{title:'上半年销售趋势', text:'6 月销售额为 84 万元，是 1 月的两倍。4 月从 45 万元增至 62 万元，环比增长约 37.8%。', chart:sales, files:['case-sales']},
  },
  {
    id:'launch', label:'方案策略', icon:'calendar-days', input:'case-launch-input',
    summary:'比较发布路径，确定试点范围、放量门槛和回退',
    next:'如果首日发现周报金额和 Excel 不一致，怎么暂停、复验和通知？',
    prompt:'我们要发布经营周报助手。请比较全量上线和小范围试点，给出建议、预算、排期、验收门槛和回退动作，输出 Word 方案与启动会 PPT。',
    steps:['整理周报发布需求和旧流程','比较三种发布路径','确定风险门槛并写入方案和六页启动会'],
    reply:{title:'建议先开放 24 个试点账号',
      text:'**选择小范围试点。** 两个团队各 12 个账号，每人安排两次任务，共 48 次。保留原模板。预算按 12 工时 × 150 元加工具预留 100 元，估算 1,900 元。\n\n**怎么决定扩大。** 至少 46/48 次能交付正确、可打开的文件。关键口径错数和越权为零，P90 预览时长不超过 90 秒。用同批任务测准备、生成、核查和修订总耗时。上述数字为拟定范围及验收门槛。\n\n**怎么回退。** 遇到关键错数、越权或阻断下载，关闭试点入口并切回旧模板。复核已交付的材料，修复后用原任务重新验证。',
      ...options, files:['case-launch','case-launch-deck']},
    follow:{prompt:'给产品、研发、数据和客服一份签收清单。', steps:['拆出两个终端与权限检查','对应失败处置和责任人'],
      reply:{title:'五项上线检查，任一阻断先暂停', text:'产品与测试复核桌面和手机的入口、预览及下载。研发验证白名单和只读权限，数据负责人逐份对照源表和交付。客服确认旧模板能获取，下载失败有工单记录字段。所有项目由对应负责人签字，联动验收后再开放。', files:['case-launch-checks']}},
  },
  {
    id:'research', label:'行业分析', icon:'book-open', input:'case-research-input',
    summary:'从公开充电设施数据到城市站点试点建议',
    next:'把晚高峰试点的样本、观测字段和成功标准写成一页调查方案。',
    prompt:'用公开资料和附带的站点样本判断城市公共充电的机会。请说明全国增长能证明什么、样本中还有哪些不确定性，并建议先验证哪项服务。',
    steps:['对照国家能源局两期充电枪统计','分开政策目标、站点记录、访谈和报价','写入行业研究简报与后续核对项'],
    reply:{title:'优先验证通勤晚高峰的充电可用性',
      text:`**全国数据。** 2026 年 10 月末共有 2,539.1 万个充电枪，其中公共 528.3 万个。对比 2025 年末，净增 529.9 万个，其中约 89.3% 来自私人枪。政策提出的 2027 年底 2,800 万是建设目标。\n\n**局部线索。** 模拟材料中，12 站只有 5 站附晚间巡检记录。同一社群 6 人中 4 人提到排队。建议先补齐分时段观察，再验证出发前展示可用枪和预计等待的价值。当前材料无法推算城市的平均等待。\n\n**公开资料。** [国家能源局 2026 年 10 月数据](${sources.october}) · [2025 年 12 月数据](${sources.december}) · [六部门行动方案](${sources.policy})`,
      ...charging, files:['case-research']},
    follow:{prompt:'评审会上怎么说明依据、适用范围和要补的证据？', steps:['对应 P01–P03 和 R01–R03','记录补采字段和可支持的判断'],
      reply:{title:'把每个判断和出处对上', text:'全国规模回看 P01/P02，建设目标回看 P03。R01、R02 只能决定下一轮观察位置和时段，先补剩余 7 站；记录到站、可用枪、等待分钟和未充离开。R03 的两份报价须按同一地址、配置和安装范围询价，再比较总成本。', files:['case-evidence']}},
  },
];

export const featuredCases = ['operations','research','launch'].map(id=>examples.find(example=>example.id===id));
