/**
 * weekly-push.js
 * 读取 data.json，生成暑期观察周报，推送到企业微信群机器人
 *
 * 用法：
 *   node weekly-push.js
 *
 * 环境变量（或直接在下方配置）：
 *   WECOM_WEBHOOK_URL - 企业微信群机器人 Webhook 地址
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ========== 配置区 ==========
const WEBHOOK_URL = process.env.WECOM_WEBHOOK_URL || '';
// =============================

const DATA_FILE = path.join(__dirname, 'data.json');

function loadData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

function buildMarkdown(data) {
  const { games = [], recentEvents = [], lastUpdate } = data;
  const now = new Date();
  const weekLabel = `2026年${getWeekLabel(now)}`;

  let md = `## 📊 暑期未成年人保护观察周报\n\n`;
  md += `> 数据周期：至 ${lastUpdate || '—'}  |  生成时间：${now.toLocaleString('zh-CN', {timeZone:'Asia/Shanghai'})}\n\n`;

  // 总览
  md += `**📌 四游戏本周总览**\n\n`;
  md += `| 游戏 | 风险等级 | 累计事件 | 高风险 | 趋势 |\n`;
  md += `|------|----------|----------|--------|------|\n`;
  for (const g of games) {
    const arrow = g.trend === 'up' ? '↑ 上升' : g.trend === 'down' ? '↓ 下降' : '→ 持平';
    md += `| ${g.name} | ${g.riskLevel} | ${g.eventCount || 0} | ${g.highRiskCount || 0} | ${arrow} |\n`;
  }
  md += `\n`;

  // 最新事件（最近7天）
  const recent7 = recentEvents.filter(e => {
    if (!e.date) return false;
    const d = new Date(e.date);
    return (now - d) / (1000 * 60 * 60 * 24) <= 7;
  }).slice(0, 10);

  if (recent7.length > 0) {
    md += `**📰 本周新增舆情（${recent7.length} 条）**\n\n`;
    for (const e of recent7) {
      const sev = e.severity === '高' ? '🔴' : e.severity === '中' ? '🟡' : '🟢';
      const link = e.url ? ` [查看](${e.url})` : '';
      md += `${sev} **${e.game || '—'}** ${e.date} ${e.title}${link}\n`;
    }
    md += `\n`;
  }

  // 仪表盘链接
  md += `---\n`;
  md += `🔗 [查看完整仪表盘](${process.env.DASHBOARD_URL || 'https://512505532-png.github.io/summer-watch/'} )\n`;
  md += `> 数据每周自动更新，点击链接查看实时趋势图 📈\n`;

  return md;
}

function getWeekLabel(date) {
  // 简单返回第几周（以5月第1周为起点）
  const start = new Date(2026, 4, 12); // 5月12日
  const diff = (date - start) / (1000 * 60 * 60 * 24);
  const weekNum = Math.floor(diff / 7) + 1;
  return `第 ${weekNum} 周（${date.getMonth()+1}月${date.getDate()}日）`;
}

function sendWecom(message) {
  return new Promise((resolve, reject) => {
    const url = WEBHOOK_URL;
    if (!url) {
      console.error('❌ 未配置 WECOM_WEBHOOK_URL');
      console.error('   请设置环境变量或在脚本中填写 Webhook 地址');
      process.exit(1);
    }

    const payload = JSON.stringify({
      msgtype: 'markdown',
      markdown: { content: message }
    });

    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.errcode === 0) {
            console.log('✅ 企微推送成功');
            resolve(result);
          } else {
            reject(new Error(`企微返回错误：errcode=${result.errcode} errmsg=${result.errmsg}`));
          }
        } catch (e) {
          reject(new Error('解析响应失败：' + body));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log('📡 读取数据…');
  const data = loadData();
  console.log(`   游戏数：${data.games?.length || 0}，事件数：${data.recentEvents?.length || 0}`);

  const message = buildMarkdown(data);
  console.log('📝 生成消息（前200字）：');
  console.log(message.slice(0, 200) + '…\n');

  console.log('🚀 推送到企业微信…');
  await sendWecom(message);
}

main().catch(err => {
  console.error('❌ 失败：', err.message);
  process.exit(1);
});
