-- 📊 科目別アクセス数（過去7日間）
SELECT 
    subject,
    COUNT(*) as total_access,
    COUNT(DISTINCT session_id) as unique_users
FROM access_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY subject
ORDER BY total_access DESC;

-- 📈 日別アクセス推移
SELECT 
    DATE(created_at) as access_date,
    subject,
    COUNT(*) as access_count
FROM access_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), subject
ORDER BY access_date DESC, subject;

-- 📥 人気ファイルランキング
SELECT 
    file_name,
    subject,
    semester,
    COUNT(*) as download_count
FROM access_logs
WHERE access_type = 'file_download'
    AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY file_name, subject, semester
ORDER BY download_count DESC
LIMIT 20;

-- 🕐 時間帯別アクセス（何時に多いか）
SELECT 
    EXTRACT(HOUR FROM created_at) as hour,
    COUNT(*) as access_count
FROM access_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hour;

-- ❌ ログイン失敗の監視（不正アクセス検出）
SELECT 
    subject,
    COUNT(*) as failed_attempts,
    MAX(created_at) as last_attempt
FROM access_logs
WHERE access_type = 'login_failed'
    AND created_at >= NOW() - INTERVAL '1 day'
GROUP BY subject
HAVING COUNT(*) > 5  -- 5回以上失敗
ORDER BY failed_attempts DESC;