-- 点菜 app：订单、买菜清单的勾选状态和手动添加的买菜项。
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('new', 'cooking', 'done')),
  items TEXT NOT NULL
);
CREATE INDEX orders_status_created ON orders (status, created_at);

-- 勾选按订单记录，订单做完或取消时一起删掉。
CREATE TABLE shopping_checks (
  order_id TEXT NOT NULL,
  item_key TEXT NOT NULL,
  PRIMARY KEY (order_id, item_key)
);

CREATE TABLE shopping_extras (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  checked INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
