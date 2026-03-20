export default async (request, context) => {
  // GETリクエスト以外は無視
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const url = new URL(request.url);
  const path = url.searchParams.get("path") || "/";
  const referrer = url.searchParams.get("ref") || null;
  const userAgent = request.headers.get("user-agent") || null;
  const country = context.geo?.country?.code || null;

  const res = await fetch(
    "https://gjuqsyaugrsshmjerhme.supabase.co/rest/v1/access_logs",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": Deno.env.get("SUPABASE_ANON_KEY"),
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({ path, referrer, user_agent: userAgent, country }),
    }
  );

  if (!res.ok) {
    return new Response("Log failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
};

export const config = { path: "/api/track" };