import type { DinnerState, Order, OrderItem, OrderStatus } from "../src/types";

// /api/* 由这里处理，其余请求交给静态资源。所有接口都要带上 x-passcode 口令。
const statuses: OrderStatus[] = ["new", "cooking", "done"];
const doneHistoryLimit = 20;

class HttpError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}

function sameText(a: string, b: string) {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  let diff = left.length ^ right.length;
  for (let i = 0; i < Math.max(left.length, right.length); i++) diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  return diff === 0;
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (text.length > 64_000) throw new HttpError(413, "请求太大");
  try {
    const value: unknown = JSON.parse(text);
    if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  } catch {}
  throw new HttpError(400, "请求格式不对");
}

function text(value: unknown, field: string, max: number, required = false): string {
  if (value === undefined || value === null) value = "";
  if (typeof value !== "string") throw new HttpError(400, `${field} 必须是文字`);
  const trimmed = value.trim();
  if (required && !trimmed) throw new HttpError(400, `${field} 不能为空`);
  if (trimmed.length > max) throw new HttpError(400, `${field} 太长了`);
  return trimmed;
}

function textList(value: unknown, field: string, maxItems: number, maxLength: number): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > maxItems) throw new HttpError(400, `${field} 格式不对`);
  return value.map((entry) => text(entry, field, maxLength)).filter(Boolean);
}

function orderItem(value: unknown): OrderItem {
  if (!value || typeof value !== "object") throw new HttpError(400, "菜品格式不对");
  const raw = value as Record<string, unknown>;
  const dishId = text(raw.dishId, "dishId", 60) || undefined;
  const customName = text(raw.customName, "菜名", 40) || undefined;
  if (!dishId && !customName) throw new HttpError(400, "DIY 菜需要菜名");
  const quantity = raw.quantity;
  if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new HttpError(400, "份数要在 1 到 20 之间");
  const choices: Record<string, string[]> = {};
  if (raw.choices && typeof raw.choices === "object" && !Array.isArray(raw.choices)) {
    for (const [group, picked] of Object.entries(raw.choices as Record<string, unknown>).slice(0, 20)) choices[text(group, "选项", 40)] = textList(picked, "选项", 20, 40);
  }
  return {
    lineId: text(raw.lineId, "lineId", 60, true),
    dishId,
    customName: dishId ? undefined : customName,
    customIngredients: dishId ? undefined : textList(raw.customIngredients, "食材", 30, 30),
    quantity,
    choices,
    removed: textList(raw.removed, "不要的配料", 30, 30),
    note: text(raw.note, "备注", 200),
  };
}

type OrderRow = { id: string; created_at: string; created_by: string; note: string; status: OrderStatus; items: string };
function toOrder(row: OrderRow): Order {
  return { id: row.id, createdAt: row.created_at, createdBy: row.created_by, note: row.note, status: row.status, items: JSON.parse(row.items) as OrderItem[] };
}

async function loadState(db: D1Database): Promise<DinnerState> {
  const [open, done, checks, extras] = await db.batch([
    db.prepare("SELECT * FROM orders WHERE status != 'done' ORDER BY created_at DESC"),
    db.prepare("SELECT * FROM orders WHERE status = 'done' ORDER BY created_at DESC LIMIT ?").bind(doneHistoryLimit),
    db.prepare("SELECT order_id, item_key FROM shopping_checks"),
    db.prepare("SELECT id, name, checked FROM shopping_extras ORDER BY created_at"),
  ]);
  return {
    orders: [...(open.results as OrderRow[]), ...(done.results as OrderRow[])].map(toOrder),
    checks: (checks.results as { order_id: string; item_key: string }[]).map((row) => ({ orderId: row.order_id, key: row.item_key })),
    extras: (extras.results as { id: string; name: string; checked: number }[]).map((row) => ({ id: row.id, name: row.name, checked: row.checked === 1 })),
  };
}

async function handleApi(request: Request, env: Env, path: string[]): Promise<Response> {
  const db = env.DB;
  const method = request.method;
  const [resource, id] = path;

  if (resource === "state" && method === "GET" && !id) return json(await loadState(db));

  if (resource === "orders") {
    if (method === "POST" && !id) {
      const body = await readJson(request);
      if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 30) throw new HttpError(400, "订单里要有 1 到 30 道菜");
      const order: Order = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        createdBy: text(body.createdBy, "名字", 20, true),
        note: text(body.note, "备注", 500),
        status: "new",
        items: body.items.map(orderItem),
      };
      await db.prepare("INSERT INTO orders (id, created_at, created_by, note, status, items) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(order.id, order.createdAt, order.createdBy, order.note, order.status, JSON.stringify(order.items)).run();
      return json(order, 201);
    }
    if (id && method === "PATCH") {
      const body = await readJson(request);
      if (!statuses.includes(body.status as OrderStatus)) throw new HttpError(400, "状态不对");
      const result = await db.prepare("UPDATE orders SET status = ? WHERE id = ?").bind(body.status, id).run();
      if (result.meta.changes === 0) throw new HttpError(404, "订单不存在");
      if (body.status === "done") await db.prepare("DELETE FROM shopping_checks WHERE order_id = ?").bind(id).run();
      return json({ ok: true });
    }
    if (id && method === "DELETE") {
      await db.batch([
        db.prepare("DELETE FROM shopping_checks WHERE order_id = ?").bind(id),
        db.prepare("DELETE FROM orders WHERE id = ?").bind(id),
      ]);
      return json({ ok: true });
    }
  }

  if (resource === "checks" && method === "PUT" && !id) {
    const body = await readJson(request);
    const key = text(body.key, "key", 80, true);
    const orderIds = textList(body.orderIds, "orderIds", 50, 60);
    const statements = orderIds.map((orderId) => body.checked === true
      ? db.prepare("INSERT OR IGNORE INTO shopping_checks (order_id, item_key) SELECT id, ? FROM orders WHERE id = ? AND status != 'done'").bind(key, orderId)
      : db.prepare("DELETE FROM shopping_checks WHERE order_id = ? AND item_key = ?").bind(orderId, key));
    if (statements.length > 0) await db.batch(statements);
    return json({ ok: true });
  }

  if (resource === "extras") {
    if (method === "POST" && !id) {
      const body = await readJson(request);
      const extra = { id: crypto.randomUUID(), name: text(body.name, "名字", 40, true), checked: false };
      await db.prepare("INSERT INTO shopping_extras (id, name, checked, created_at) VALUES (?, ?, 0, ?)").bind(extra.id, extra.name, new Date().toISOString()).run();
      return json(extra, 201);
    }
    if (id && method === "PATCH") {
      const body = await readJson(request);
      if (typeof body.checked !== "boolean") throw new HttpError(400, "checked 必须是 true 或 false");
      await db.prepare("UPDATE shopping_extras SET checked = ? WHERE id = ?").bind(body.checked ? 1 : 0, id).run();
      return json({ ok: true });
    }
    if (id && method === "DELETE") {
      await db.prepare("DELETE FROM shopping_extras WHERE id = ?").bind(id).run();
      return json({ ok: true });
    }
  }

  throw new HttpError(404, "接口不存在");
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    const prefix = "/api/dinner/";
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    if (!url.pathname.startsWith(prefix)) return json({ error: "接口不存在" }, 404);
    try {
      if (!env.ORDER_PASSCODE) throw new HttpError(503, "还没有设置口令");
      if (!sameText(request.headers.get("x-passcode") ?? "", env.ORDER_PASSCODE)) throw new HttpError(401, "口令不对");
      const path = url.pathname.slice(prefix.length).split("/").filter(Boolean).map(decodeURIComponent);
      return await handleApi(request, env, path);
    } catch (error) {
      if (error instanceof HttpError) return json({ error: error.message }, error.status);
      console.error(error);
      return json({ error: "服务器出错了" }, 500);
    }
  },
} satisfies ExportedHandler<Env>;
