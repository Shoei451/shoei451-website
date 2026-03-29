// netlify/functions/raindrop.js
// Raindrop.io API プロキシ
// 環境変数 RAINDROP_TOKEN にTest tokenを設定すること

exports.handler = async (event) => {
  const token = process.env.RAINDROP_TOKEN;

  if (!token) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "RAINDROP_TOKEN is not set" }),
    };
  }

  // クエリパラメータから path を取得
  // 例: /.netlify/functions/raindrop?path=/collections
  //     /.netlify/functions/raindrop?path=/raindrops/12345678
  const path = event.queryStringParameters?.path;

  if (!path || !path.startsWith("/")) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid path parameter" }),
    };
  }

  // perpage などの追加クエリを転送
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(event.queryStringParameters || {})) {
    if (key !== "path") params.set(key, val);
  }
  const qs = params.toString() ? `?${params}` : "";

  const url = `https://api.raindrop.io/rest/v1${path}${qs}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    return {
      statusCode: res.status,
      headers: {
        "Content-Type": "application/json",
        // 同一オリジンのみ許可（自サイトのみ）
        "Access-Control-Allow-Origin": "https://shoei451.netlify.app",
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: `Upstream error: ${err.message}` }),
    };
  }
};
