import {
  LogLevel,
  LogLevelName,
  LOG_LEVEL_MAP,
  LOG_LEVEL_NAME,
  LogEntry,
  LogMeta,
  LogContext,
  LoggerConfig,
  Transport,
} from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function now(): string {
  return new Date().toISOString();
}

function getNodeEnv(): string | undefined {
  if (typeof process !== "undefined" && process.env["NODE_ENV"]) {
    return process.env["NODE_ENV"];
  }
  // Vite injects import.meta.env.MODE — use indirect eval so CJS compilers don't choke on the syntax
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
    return new Function("return import.meta.env?.MODE")() as string | undefined;
  } catch {
    return undefined;
  }
}

function detectDefaultLevel(): LogLevel {
  return getNodeEnv() === "production" ? LogLevel.WARN : LogLevel.DEBUG;
}

// ─── ChildLogger ─────────────────────────────────────────────────────────────

/**
 * A scoped view of the root Logger.
 * Carries immutable context (module, requestId, etc.) and delegates all
 * actual log dispatch back to the parent Logger singleton.
 */
export class ChildLogger {
  constructor(
    private readonly parent: Logger,
    private readonly context: LogContext
  ) {}

  debug(message: string, meta?: LogMeta): void {
    this.parent["_emit"](LogLevel.DEBUG, message, meta, this.context);
  }

  info(message: string, meta?: LogMeta): void {
    this.parent["_emit"](LogLevel.INFO, message, meta, this.context);
  }

  warn(message: string, meta?: LogMeta): void {
    this.parent["_emit"](LogLevel.WARN, message, meta, this.context);
  }

  error(message: string, meta?: LogMeta): void {
    this.parent["_emit"](LogLevel.ERROR, message, meta, this.context);
  }

  fatal(message: string, meta?: LogMeta): void {
    this.parent["_emit"](LogLevel.FATAL, message, meta, this.context);
  }

  /**
   * Derive a deeper child logger by merging additional context.
   * Does NOT create a new singleton — still delegates to the same root.
   */
  child(additionalContext: LogContext): ChildLogger {
    return new ChildLogger(this.parent, { ...this.context, ...additionalContext });
  }
}

// ─── Logger (Singleton) ───────────────────────────────────────────────────────

/**
 * Root logger singleton.
 *
 * Responsibilities:
 *   - Level filtering gate
 *   - Building LogEntry objects
 *   - Dispatching to registered transports
 *   - Providing child loggers with scoped context
 *
 * Non-responsibilities (by design):
 *   - Persisting logs            → delegate to a Transport
 *   - Buffering / batching       → delegate to a Transport
 *   - Network delivery           → delegate to a Transport
 *   - Throttling / rate-limiting → delegate to a Transport
 */
export class Logger {
  private static _instance: Logger | null = null;

  private _level: LogLevel;
  private _transports: Transport[];
  private _context: LogContext;

  // ── Singleton access ───────────────────────────────────────────────────────

  static getInstance(config?: LoggerConfig): Logger {
    if (!Logger._instance) {
      Logger._instance = new Logger(config);
    }
    return Logger._instance;
  }

  /**
   * Destroy the singleton — useful in tests so each test suite gets a fresh
   * instance without global state leaking.
   *
   * @internal
   */
  static _reset(): void {
    Logger._instance = null;
  }

  // ── Constructor (private — use getInstance) ────────────────────────────────

  private constructor(config: LoggerConfig = {}) {
    const resolvedLevel = config.level
      ? LOG_LEVEL_MAP[config.level]
      : detectDefaultLevel();

    this._level      = resolvedLevel;
    this._transports = config.transports ? [...config.transports] : [];
    this._context    = config.context ?? {};
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Set the minimum log level. Entries below this level are discarded. */
  setLevel(level: LogLevelName): void {
    this._level = LOG_LEVEL_MAP[level];
  }

  /** Returns the current minimum level name. */
  getLevel(): LogLevelName {
    return LOG_LEVEL_NAME[this._level];
  }

  /** Register a transport. No-ops if a transport with the same name already exists. */
  addTransport(transport: Transport): void {
    const exists = this._transports.some((t) => t.name === transport.name);
    if (!exists) {
      this._transports.push(transport);
    }
  }

  /** Remove a transport by name and call its flush() hook if present. */
  removeTransport(name: string): void {
    const idx = this._transports.findIndex((t) => t.name === name);
    if (idx !== -1) {
      const [removed] = this._transports.splice(idx, 1);
      removed?.flush?.();
    }
  }

  /** Returns a snapshot of registered transport names (for introspection). */
  getTransportNames(): string[] {
    return this._transports.map((t) => t.name);
  }

  /**
   * Merge additional context into the root logger.
   * Use child() when you want scoped context without touching the global state.
   */
  setContext(context: LogContext): void {
    this._context = { ...this._context, ...context };
  }

  /**
   * Create a child logger that inherits all root transports but carries its
   * own immutable context (module name, requestId, userId, etc.).
   */
  child(context: LogContext): ChildLogger {
    return new ChildLogger(this, { ...this._context, ...context });
  }

  /** Flush all transports (e.g. on graceful shutdown). */
  async flush(): Promise<void> {
    await Promise.all(this._transports.map((t) => t.flush?.()));
  }

  // ── Log methods ────────────────────────────────────────────────────────────

  debug(message: string, meta?: LogMeta): void {
    this._emit(LogLevel.DEBUG, message, meta, this._context);
  }

  info(message: string, meta?: LogMeta): void {
    this._emit(LogLevel.INFO, message, meta, this._context);
  }

  warn(message: string, meta?: LogMeta): void {
    this._emit(LogLevel.WARN, message, meta, this._context);
  }

  error(message: string, meta?: LogMeta): void {
    this._emit(LogLevel.ERROR, message, meta, this._context);
  }

  fatal(message: string, meta?: LogMeta): void {
    this._emit(LogLevel.FATAL, message, meta, this._context);
  }

  // ── Internal dispatch ──────────────────────────────────────────────────────

  /**
   * Core dispatch — builds the canonical LogEntry and routes it to transports.
   * Private, but accessible via ChildLogger using bracket notation.
   */
  private _emit(
    level: LogLevel,
    message: string,
    meta: LogMeta = {},
    context: LogContext = {}
  ): void {
    // Root-level gate: discard early, zero allocations past this point
    if (level < this._level) return;

    const entry: LogEntry = {
      timestamp: now(),
      level,
      levelName: LOG_LEVEL_NAME[level],
      message,
      meta,
      context,
    };

    for (const transport of this._transports) {
      // Per-transport level override
      const transportMinLevel = transport.minLevel ?? LogLevel.DEBUG;
      if (level < transportMinLevel) continue;

      try {
        transport.log(entry);
      } catch {
        // A broken transport must never crash the application.
        // We intentionally avoid recursive logging here.
      }
    }
  }
}
