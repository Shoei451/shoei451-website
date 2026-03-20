// ============================================================
// js/supabase_config.js
// Supabase Project 1（学習コンテンツDB）の共通設定
//
// 使い方:
//   1. supabase CDN の <script> の直後に読み込む
//      <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//      <script src="../../js/supabase_config.js"></script>  ← パスは深さに合わせて調整
//
//   2. ページ側のスクリプトで db と TABLES をそのまま使う
//      const { data } = await db.from(TABLES.WH_QUIZ).select('*');
//
//   3. 既存の変数名（supabaseClient / apiClient など）を残したい場合は
//      このファイルを読み込んだあとに1行エイリアスを追加する
//      const supabaseClient = db;
//
// ============================================================

const SUPABASE_URL      = 'https://gjuqsyaugrsshmjerhme.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdXFzeWF1Z3Jzc2htamVyaG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NzA3NTYsImV4cCI6MjA4MjA0Njc1Nn0.V8q5ddz5tPy7wBaQ73aGtmCZyqzA6pPciPRwRIZjJcs'; // 置換済み

const TABLES = {
  WH_QUIZ:    'world_history_quiz',
  WH_DATES:   'wh_dates',
  WH_REGIONS: 'wh_regions',
  CHINESE:    'chinese_history',
  SEIKEI:     'seikei_events',
  ACCESS_LOG: 'access_logs',
};

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
