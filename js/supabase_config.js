// ============================================================
// js/supabase_config.js
// Supabase 共通設定
//
// 2026-03-20 anon key → publishable key に移行
//   Project 1: sb_publishable_K-TVhPlOAGY7cLhanI9Tag_kKIDoIGU
//   Project 2: Supabase Dashboard > Settings > API > Publishable key
//              で確認して SUPABASE_KEY_2 を更新すること
//
// 使い方:
//   1. supabase CDN の <script> を先に読み込む
//      <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//
//   2. ページ側の module script から import する
//      import { db, tables } from "../../js/supabase_config.js";
//      const { data } = await db.from(tables.WH_DATES).select('*');
//
// ============================================================

// ── Project 1（学習コンテンツDB）────────────────────────────
const SUPABASE_URL = "https://gjuqsyaugrsshmjerhme.supabase.co";
const SUPABASE_KEY = "sb_publishable_K-TVhPlOAGY7cLhanI9Tag_kKIDoIGU";

// ── Project 2（生産性・東進トラッカー）──────────────────────
const SUPABASE_URL_2 = "https://qmtlsxuoewdajgnjxfkb.supabase.co";
const SUPABASE_KEY_2 = "YOUR_PROJECT2_PUBLISHABLE_KEY"; // ← 要更新

// ── テーブル名定数 ───────────────────────────────────────────
export const tables = {
  WH_QUIZ: "world_history_quiz",
  WH_DATES: "wh_dates",
  WH_REGIONS: "wh_regions",
  CHINESE: "chinese_history",
  SEIKEI: "seikei_events",
  ACCESS_LOG: "access_logs",
  ENGLISH_IDIOMS: "english_idioms",
};

// ── クライアント生成 ─────────────────────────────────────────
export const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
export const db2 = window.supabase.createClient(
  SUPABASE_URL_2,
  SUPABASE_KEY_2,
);
