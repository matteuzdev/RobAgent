import { createServer } from "node:http";
import { assertRuntimeConfig, config } from "./config.js";
import { authorized, ingest } from "./ingest.js";
import { json, readJson } from "./lib.js";

assertRuntimeConfig();

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

  if (req.method === "GET" && url.pathname === "/health") {
    return json(res, 200, {
      ok: true,
      service: "robagent-ai-radar",
      time: new Date().toISOString()
    });
  }

  if (req.method === "POST" && url.pathname === "/v1/ingest/android") {
    const secret = req.headers["x-radar-secret"];
    if (!authorized(Array.isArray(secret) ? secret[0] : secret)) {
      return json(res, 401, { error: "unauthorized" });
    }

    try {
      const input = await readJson(req);
      const result = await ingest(input);
      return json(res, result.duplicate ? 200 : 202, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown_error";
      const status = message === "payload_too_large" ? 413 : message === "text_required" ? 400 : 500;
      console.error("[server] ingest error", error);
      return json(res, status, { error: message });
    }
  }

  return json(res, 404, { error: "not_found" });
});

server.listen(config.port, "0.0.0.0", () => {
  console.log(`[robagent] AI Radar listening on :${config.port}`);
});
