import { initWorldHistoryAdminApp } from "../apps/world-history-admin/app.js";

const timelineConfig = {
  title: "世界史年表 管理",
  backLink: "../sub-index.html?slug=history",
  backLabel: "歴史ホーム",
  accentColor: "#1a2b3c",
  showSearch: false,
  showStats: false,

  async renderApp(ctx) {
    await initWorldHistoryAdminApp(ctx);
  },
};

export default timelineConfig;
