# 暑期未成年人保护观察仪表盘 · 2026

🌐 **在线访问**：https://512505532-png.github.io/summer-watch/

## 功能

- 📊 四游戏总览卡片（暗区突围 / 火影忍者手游 / 元梦之星 / 三角洲行动）
- 📈 舆情趋势折线图（近12周）
- ⚠️ 风险类别分布图
- 📰 最新舆情事件表格
- 📊 四游戏暑期数据对比图
- 🔄 每10分钟自动刷新数据

## 本地预览

```bash
cd summer-watch
npx serve .
# 浏览器打开 http://localhost:3000
```

## 更新数据

编辑 `data.json` 后提交推送，仪表盘自动刷新：

```bash
# 手动编辑 data.json 后：
git add data.json
git commit -m "update: 0602数据"
git push origin main
```

### 使用 CLI 工具更新

```bash
# 添加一条舆情事件
node update-data.js add-event \
  --game "暗区突围" \
  --date 2026-06-03 \
  --title "XXX投诉" \
  --category 风险 \
  --severity 高 \
  --url "https://..."

# 设置某游戏某周计数（用于趋势图）
node update-data.js set-weekly \
  --game "暗区突围" \
  --week "6月W1" \
  --count 3

# 设置风险等级
node update-data.js set-risk \
  --game "暗区突围" \
  --level 高

# 增减事件计数
node update-data.js bump-event \
  --game "暗区突围" \
  --delta 1 \
  --high 1
```

## 企微周报推送

已配置企业微信群机器人，每周一 9:00 自动推送。

手动触发：
```bash
node weekly-push.js
```

## 自动化

- ✅ GitHub Pages 自动部署（`main` 分支推送即更新）
- ✅ 企微周报自动推送（每周一 9:00，自动化任务 ID：`automation-1780371152313`）

## data.json 字段说明

```jsonc
{
  "lastUpdate": "2026-06-02",          // 最后更新日期
  "games": [{
    "name": "暗区突围",
    "riskLevel": "高|中|低",
    "eventCount": 12,                    // 暑期累计事件数
    "highRiskCount": 3,                 // 高风险事件数
    "trend": "up|down|flat",          // 趋势方向
    "trendDesc": "较上周上升 2 起",    // 趋势描述
    "weeklyCounts": [1,3,5,2,...]     // 每周事件数（按周顺序）
  }],
  "trendWeeks": ["5月W3","5月W4",...], // X轴周标签
  "riskDistribution": {                   // 风险类别分布
    "政策": 5, "行业": 8, "风险": 12, "案例": 3
  },
  "recentEvents": [{                     // 最新事件列表
    "date": "2026-06-01",
    "game": "暗区突围",
    "title": "事件标题",
    "category": "风险",                  // 政策/行业/风险/案例
    "severity": "高",                    // 高/中/低
    "url": "https://..."                 // 原文链接（可选）
  }]
}
```
