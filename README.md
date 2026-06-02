# 暑期未成年人保护观察仪表盘 · 2026

GitHub Pages 托管地址（部署后更新）：
👉 https://512505532-png.github.io/summer-watch/

## 本地预览

```bash
cd summer-watch
npx serve .
# 浏览器打开 http://localhost:3000
```

## 更新数据

编辑 `data.json` 后提交推送即可，仪表盘每10分钟自动刷新。

### data.json 字段说明

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

## GitHub Pages 部署步骤

1. 登录 GitHub：`gh auth login`（选 GitHub.com → HTTPS → 浏览器登录）
2. 创建仓库：
   ```bash
   gh repo create summer-watch --public --source=. --push
   ```
3. 开启 Pages：
   - 进入仓库 Settings → Pages
   - Source 选 `Deploy from a branch`
   - Branch 选 `main` / `root`
   - 保存，等待 1-2 分钟生效

## 企微周报推送

见 `weekly-push.js` 说明。
