export default async (request, context) => {
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const url = new URL(request.url);
  const path = url.searchParams.get("path") || "/";
  const referrer = url.searchParams.get("ref") || null;
  const userAgent = request.headers.get("user-agent") || null;
  const country = context.geo?.country?.code || null;

  // publishable keyを直書き（環境変数依存なし）
  const SUPABASE_URL = "https://gjuqsyaugrsshmjerhme.supabase.co";
  const SUPABASE_KEY = "sb_publishable_K-TVhPlOAGY7cLhanI9Tag_kKIDoIGU";

  await fetch(`${SUPABASE_URL}/rest/v1/access_logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({ path, referrer, user_agent: userAgent, country }),
  });

  return new Response("OK", { status: 200 });
};

export const config = { path: "/api/sw" };