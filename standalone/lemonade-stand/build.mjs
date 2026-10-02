import { mkdir, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
const root = fileURLToPath(new URL(".", import.meta.url));
// 独立游戏无需框架构建，只把浏览器运行文件复制到部署目录。
await mkdir(join(root, "out"), { recursive: true });
for (const file of ["index.html", "app.mjs", "engine.mjs", "style.css"]) {
  await copyFile(join(root, file), join(root, "out", file));
}
