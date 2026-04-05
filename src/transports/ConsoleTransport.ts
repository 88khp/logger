import { LogLevel, LogEntry, Transport } from "../types";

// ─── ANSI colour codes (terminal / Node) ─────────────────────────────────────
// React Native's Metro console and Chrome DevTools both strip these gracefully.

const RESET  = "\x1b[0m";
const BOLD   = "\x1b[1m";
const DIM    = "\x1b[2m";

const LEVEL_COLORS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]:  "\x1b[36m",  // cyan
  [LogLevel.INFO]:   "\x1b[32m",  // green
  [LogLevel.WARN]:   "\x1b[33m",  // yellow
  [LogLevel.ERROR]:  "\x1b[31m",  // red
  [LogLevel.FATAL]:  "\x1b[35m",  // magenta
  [LogLevel.SILENT]: "",
};

const LEVEL_LABELS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]:  "DBG",
  [LogLevel.INFO]:   "INF",
  [LogLevel.WARN]:   "WRN",
  [LogLevel.ERROR]:  "ERR",
  [LogLevel.FATAL]:  "FTL",
  [LogLevel.SILENT]: "---",
};

// ─── Environment detection ────────────────────────────────────────────────────

function getNodeEnv(): string | undefined {
  if (typeof process !== "undefined" && process.env["NODE_ENV"]) {
    return process.env["NODE_ENV"];
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
    return new Function("return import.meta.env?.MODE")() as string | undefined;
  } catch {
    return undefined;
  }
}

function isProduction(): boolean {
  return getNodeEnv() === "production";
}

/** True when running in a terminal that supports ANSI colours. */
function supportsColor(): boolean {
  if (typeof process === "undefined") return false;
  const { FORCE_COLOR, NO_COLOR, TERM } = process.env;
  if (NO_COLOR) return false;
  if (FORCE_COLOR) return true;
  return TERM !== "dumb" && process.stdout?.isTTY === true;
}

// ─── ConsoleTransport ────────────────────────────────────────────────────────

export interface ConsoleTransportOptions {
  /**
   * "pretty" — human-readable coloured output (default in development)
   * "json"   — machine-readable JSON lines (default in production)
   * "auto"   — pick based on NODE_ENV (default)
   */
  format?: "pretty" | "json" | "auto";

  /** Override which console method handles fatal entries (default: console.error) */
  fatalMethod?: "error" | "warn" | "log";
}

/**
 * Built-in transport that writes to the global `console`.
 *
 * Pretty mode  → readable coloured lines for local development.
 * JSON mode    → newline-delimited JSON for log aggregators (Datadog, CloudWatch, etc.).
 *
 * This is the ONLY built-in transport. Everything else (file, remote, SQLite, …)
 * is implemented externally via the Transport interface.
 */
export class ConsoleTransport implements Transport {
  readonly name = "console";
  minLevel?: LogLevel;

  private readonly useJson: boolean;
  private readonly useColor: boolean;

  constructor(options: ConsoleTransportOptions = {}) {
    const format = options.format ?? "auto";
    this.useJson  = format === "json" || (format === "auto" && isProduction());
    this.useColor = !this.useJson && supportsColor();
  }

  log(entry: LogEntry): void {
    if (this.useJson) {
      this._writeJson(entry);
    } else {
      this._writePretty(entry);
    }
  }

  // flush is a no-op for synchronous console output
  flush(): void {}

  // ── JSON output ────────────────────────────────────────────────────────────

  private _writeJson(entry: LogEntry): void {
    const record: Record<string, unknown> = {
      timestamp: entry.timestamp,
      level:     entry.levelName,
      message:   entry.message,
    };

    // Flatten context fields into top level for easy querying in log aggregators
    if (Object.keys(entry.context).length > 0) {
      Object.assign(record, entry.context);
    }

    // Nest meta under "data" to avoid key collisions
    if (Object.keys(entry.meta).length > 0) {
      record["data"] = entry.meta;
    }

    const line = JSON.stringify(record);
    this._consoleMethod(entry.level)(line);
  }

  // ── Pretty output ──────────────────────────────────────────────────────────

  private _writePretty(entry: LogEntry): void {
    const color = this.useColor ? LEVEL_COLORS[entry.level] : "";
    const label = LEVEL_LABELS[entry.level];
    const reset = this.useColor ? RESET : "";
    const bold  = this.useColor ? BOLD  : "";
    const dim   = this.useColor ? DIM   : "";

    // [HH:MM:SS.mmm] LEVEL module? message
    const time = entry.timestamp.slice(11, 23); // "HH:MM:SS.mmm"
    const module = entry.context.module ? ` ${dim}[${entry.context.module}]${reset}` : "";
    const reqId  = entry.context.requestId ? ` ${dim}req:${entry.context.requestId}${reset}` : "";

    let line = `${dim}${time}${reset} ${color}${bold}${label}${reset}${module}${reqId} ${entry.message}`;

    const hasMeta    = Object.keys(entry.meta).length > 0;
    const hasContext = Object.keys(entry.context).filter(
      (k) => k !== "module" && k !== "requestId" && k !== "userId"
    ).length > 0;

    if (hasMeta || hasContext) {
      const extra: Record<string, unknown> = {};
      if (entry.context.userId) extra["userId"] = entry.context.userId;
      if (entry.context.tags)   extra["tags"]   = entry.context.tags;
      if (hasContext) {
        for (const [k, v] of Object.entries(entry.context)) {
          if (!["module", "requestId", "userId", "tags"].includes(k)) {
            extra[k] = v;
          }
        }
      }
      Object.assign(extra, entry.meta);
      line += ` ${dim}${JSON.stringify(extra)}${reset}`;
    }

    this._consoleMethod(entry.level)(line);
  }

  // ── Route to the right console method ─────────────────────────────────────

  private _consoleMethod(level: LogLevel): (...args: unknown[]) => void {
    switch (level) {
      case LogLevel.DEBUG: return console.debug ?? console.log;
      case LogLevel.INFO:  return console.info  ?? console.log;
      case LogLevel.WARN:  return console.warn;
      case LogLevel.ERROR: return console.error;
      case LogLevel.FATAL: return console.error;
      default:             return console.log;
    }
  }
}
