import { createHash, timingSafeEqual } from "node:crypto";

export function json(res: import("node:http").ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload)
  });
  res.end(payload);
}

export async function readJson(req: import("node:http").IncomingMessage, maxBytes = 128_000) {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > maxBytes) throw new Error("payload_too_large");
    chunks.push(buffer);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

export function secureEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function extractLinks(text: string) {
  return Array.from(new Set(text.match(/https?:\/\/[^\s<>"')\]]+/gi) ?? []));
}

export function clampScore(value: number) {
  return Math.max(0, Math.min(10, Math.round(value)));
}
