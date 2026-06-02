/**
 * update-data.js
 * 程序化更新 data.json（供自动化脚本调用）
 *
 * 用法：
 *   node update-data.js add-event --game "暗区突围" --date 2026-06-03 --title "XXX" --category 风险 --severity 高 --url "https://..."
 *   node update-data.js set-weekly --game "暗区突围" --week "5月W3" --count 3
 *   node update-data.js set-risk   --game "暗区突围" --level 高
 *   node update-data.js bump-event --game "暗区突围" --high 1
 */

const fs   = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

function load() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}
function save(data) {
  data.lastUpdate = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log('✅ data.json 已更新 →', data.lastUpdate);
}

function findGame(data, name) {
  const g = (data.games || []).find(g => g.name === name);
  if (!g) throw new Error(`未找到游戏：「${name}」，可选：${(data.games||[]).map(g=>g.name).join('、')}`);
  return g;
}

// ---------- subcommands ----------

/** 添加一条舆情事件 */
function addEvent(data, opts) {
  if (!data.recentEvents) data.recentEvents = [];
  data.recentEvents.unshift({
    date:     opts.date     || new Date().toISOString().slice(0, 10),
    game:      opts.game    || '',
    title:     opts.title   || '',
    category:  opts.category|| '',
    severty:   opts.severity|| '中',
    url:       opts.url     || '',
  });
  // 只保留最近200条
  data.recentEvents = data.recentEvents.slice(0, 200);

  // 同步更新游戏事件计数
  const g = findGame(data, opts.game);
  g.eventCount = (g.eventCount || 0) + 1;
  if (opts.severity === '高') g.highRiskCount = (g.highRiskCount || 0) + 1;

  // 风险分布
  const cat = opts.category || '风险';
  data.riskDistribution[cat] = (data.riskDistribution[cat] || 0) + 1;
}

/** 设置某游戏某周的计数（用于周趋势图） */
function setWeekly(data, opts) {
  const g = findGame(data, opts.game);
  if (!g.weeklyCounts) g.weeklyCounts = [];
  // week 格式："5月W3" → 找到或追加
  const wi = (data.trendWeeks || []).indexOf(opts.week);
  if (wi === -1) {
    if (!data.trendWeeks) data.trendWeeks = [];
    data.trendWeeks.push(opts.week);
    g.weeklyCounts.push(opts.count);
  } else {
    g.weeklyCounts[wi] = opts.count;
  }
}

/** 设置风险等级 */
function setRisk(data, opts) {
  const g = findGame(data, opts.game);
  g.riskLevel = opts.level;
}

/** 直接增减事件计数 */
function bumpEvent(data, opts) {
  const g = findGame(data, opts.game);
  g.eventCount = Math.max(0, (g.eventCount || 0) + (opts.delta || 0));
  if (opts.high) g.highRiskCount = Math.max(0, (g.highRiskCount || 0) + opts.high);
}

// ---------- CLI ----------

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) { opts[key] = next; i++; }
      else opts[key] = true;
    } else if (i === 0) opts._cmd = a;
  }
  return opts;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const data = load();

  switch (opts._cmd) {
    case 'add-event':
      if (!opts.game || !opts.title) { console.error('用法: add-event --game XXX --title YYY [--date][--category][--severity][--url]'); process.exit(1); }
      addEvent(data, opts);
      break;
    case 'set-weekly':
      if (!opts.game || !opts.week || opts.count === undefined) { console.error('用法: set-weekly --game XXX --week "5月W3" --count 3'); process.exit(1); }
      setWeekly(data, opts);
      break;
    case 'set-risk':
      if (!opts.game || !opts.level) { console.error('用法: set-risk --game XXX --level 高|中|低'); process.exit(1); }
      setRisk(data, opts);
      break;
    case 'bump-event':
      if (!opts.game) { console.error('用法: bump-event --game XXX --delta 1 [--high 1]'); process.exit(1); }
      bumpEvent(data, { game: opts.game, delta: Number(opts.delta)||0, high: Number(opts.high)||0 });
      break;
    default:
      console.error('未知命令：「' + (opts._cmd||'') + '」');
      console.error('支持：add-event | set-weekly | set-risk | bump-event');
      process.exit(1);
  }

  save(data);
}

main();
