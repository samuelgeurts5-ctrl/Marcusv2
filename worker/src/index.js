const MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";
const ALLOWED_ORIGIN = "https://samuelgeurts5-ctrl.github.io";

function corsHeaders(origin) {
  const allowed = origin === ALLOWED_ORIGIN || origin === "http://localhost:8788";
  return {
    "Access-Control-Allow-Origin": allowed ? origin : ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}
function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(origin) }
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method === "GET" && url.pathname === "/health") {
      return json({ ok: true, service: "Marcus remote Llama API", model: MODEL }, 200, origin);
    }
    if (request.method !== "POST" || url.pathname !== "/v1/chat/completions") {
      return json({ error: { message: "Use POST /v1/chat/completions or GET /health." } }, 404, origin);
    }
    if (origin && origin !== ALLOWED_ORIGIN && origin !== "http://localhost:8788") {
      return json({ error: { message: "Origin not allowed." } }, 403, origin);
    }
    if (!env.MARCUS_API_SECRET) {
      return json({ error: { message: "Server is not configured. Set the MARCUS_API_SECRET Worker secret." } }, 503, origin);
    }
    const auth = request.headers.get("Authorization") || "";
    if (auth !== "Bearer " + env.MARCUS_API_SECRET) {
      return json({ error: { message: "Unauthorized. Enter the Marcus server key in Model connection." } }, 401, origin);
    }

    let body;
    try { body = await request.json(); }
    catch { return json({ error: { message: "Request body must be JSON." } }, 400, origin); }

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return json({ error: { message: "Provide a non-empty messages array." } }, 400, origin);
    }
    const messages = body.messages
      .filter(m => m && ["system", "user", "assistant"].includes(m.role) && typeof m.content === "string")
      .slice(-24);
    if (!messages.length) return json({ error: { message: "No valid chat messages were supplied." } }, 400, origin);

    try {
      const result = await env.AI.run(MODEL, {
        messages,
        max_tokens: Math.min(Math.max(Number(body.max_tokens) || 700, 1), 1200),
        temperature: Math.min(Math.max(Number(body.temperature) || 0.7, 0), 1.5)
      });
      const content = typeof result === "string" ? result : (result?.response || result?.output_text || "");
      if (!content) throw new Error("The model returned an empty response.");
      return json({
        id: "chatcmpl-marcus-" + crypto.randomUUID(),
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: MODEL,
        choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }]
      }, 200, origin);
    } catch (error) {
      return json({ error: { message: "Remote Llama request failed: " + (error?.message || "unknown error") } }, 502, origin);
    }
  }
};
