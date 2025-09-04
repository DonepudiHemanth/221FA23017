import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_DIR = path.join(__dirname, "../../logs");
const LOG_FILE = path.join(LOG_DIR, "app.log");
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

function write(line) {
  fs.appendFile(LOG_FILE, line + "\n", () => {});
}

export function requestLogger(req, res, next) {
  const start = Date.now();
  const ts = new Date().toISOString();
  const entry = `[REQ] ${ts} ${req.method} ${req.originalUrl} ip=${req.ip || ""}`;
  write(entry);

  res.on("finish", () => {
    const ms = Date.now() - start;
    const exit = `[RES] ${new Date().toISOString()} ${req.method} ${req.originalUrl} status=${res.statusCode} duration_ms=${ms}`;
    write(exit);
  });

  next();
}

export function errorLogger(err, req, res, next) {
  const ts = new Date().toISOString();
  const entry = `[ERR] ${ts} ${req.method} ${req.originalUrl} status=${err.status || 500} msg=${(err && err.message) || "Unhandled"}`;
  write(entry);
  next(err);
}
process.on("uncaughtException", (e) => write(`[FATAL] ${new Date().toISOString()} uncaughtException ${e?.message || e}`));
process.on("unhandledRejection", (e) => write(`[FATAL] ${new Date().toISOString()} unhandledRejection ${e?.message || e}`));
