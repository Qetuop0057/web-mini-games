import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

// Polling avoids macOS file watcher limits during local development.
const next = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const child = spawn(process.execPath, [next, "dev", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: { ...process.env, WATCHPACK_POLLING: process.env.WATCHPACK_POLLING ?? "true" },
});
child.on("error", (error) => { console.error(error); process.exitCode = 1; });
child.on("exit", (code) => { process.exitCode = code ?? 0; });
