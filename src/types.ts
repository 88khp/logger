// ─── Log Levels ──────────────────────────────────────────────────────────────

/**
 * Ordered numeric severity. Higher = more severe.
 * Consumers can compare: entry.level >= LogLevel.WARN
 */
export enum LogLevel {
  DEBUG = 0,
  INFO  = 1,
  WARN  = 2,
  ERROR = 3,
  FATAL = 4,
  SILENT = 5, // disables all output
}

/** String union that maps to LogLevel — used in public-facing API */
export type LogLevelName = "debug" | "info" | "warn" | "error" | "fatal" | "silent";

export const LOG_LEVEL_MAP: Record<LogLevelName, LogLevel> = {
  debug:  LogLevel.DEBUG,
  info:   LogLevel.INFO,
  warn:   LogLevel.WARN,
  error:  LogLevel.ERROR,
  fatal:  LogLevel.FATAL,
  silent: LogLevel.SILENT,
};

export const LOG_LEVEL_NAME: Record<LogLevel, LogLevelName> = {
  [LogLevel.DEBUG]:  "debug",
  [LogLevel.INFO]:   "info",
  [LogLevel.WARN]:   "warn",
  [LogLevel.ERROR]:  "error",
  [LogLevel.FATAL]:  "fatal",
  [LogLevel.SILENT]: "silent",
};

// ─── Structured Log Entry ────────────────────────────────────────────────────

/** Arbitrary key-value metadata attached to a log entry. */
export type LogMeta = Record<string, unknown>;

/**
 * The canonical log record passed to every transport.
 * Transports receive this object and decide how to serialize/send it.
 */
export interface LogEntry {
  /** ISO-8601 timestamp generated at the call site */
  readonly timestamp: string;
  /** Numeric severity */
  readonly level: LogLevel;
  /** Human-readable severity label */
  readonly levelName: LogLevelName;
  /** Primary message string */
  readonly message: string;
  /** Structured metadata provided by the caller */
  readonly meta: LogMeta;
  /** Optional context injected by a child logger (module, requestId, etc.) */
  readonly context: LogContext;
}

// ─── Context ─────────────────────────────────────────────────────────────────

/**
 * Immutable context that scopes a logger to a module or request.
 * All fields are optional so consumers only attach what makes sense.
 */
export interface LogContext {
  /** Source module / component / service name */
  module?: string;
  /** Correlation ID for tracing a single request end-to-end */
  requestId?: string;
  /** Authenticated user identifier */
  userId?: string;
  /** Freeform extra tags for filtering */
  tags?: string[];
  /** Any additional static fields the consumer wants on every entry */
  [key: string]: unknown;
}

// ─── Transport ───────────────────────────────────────────────────────────────

/**
 * Transport contract.
 *
 * Every transport receives a fully-formed LogEntry and is responsible for
 * deciding what to do with it (write to console, persist to disk, POST to a
 * remote server, etc.).
 *
 * Transports MUST NOT throw — catch errors internally and degrade gracefully.
 */
export interface Transport {
  /** Human-readable name used in debug introspection */
  readonly name: string;

  /**
   * Optional minimum level override for this specific transport.
   * When set, entries below this level are skipped even if the root logger
   * would have emitted them.
   */
  minLevel?: LogLevel;

  /**
   * Called synchronously (or fire-and-forget async) for every log entry that
   * passes level filtering.
   *
   * Returning a Promise is allowed but the logger will NOT await it —
   * async transports must manage their own queuing/batching.
   */
  log(entry: LogEntry): void | Promise<void>;

  /**
   * Optional lifecycle hook — called when the transport is removed or the
   * process is shutting down. Use to flush buffers or close file handles.
   */
  flush?(): void | Promise<void>;
}

// ─── Logger Config ────────────────────────────────────────────────────────────

export interface LoggerConfig {
  /**
   * Minimum level emitted by the root logger.
   * Defaults to "debug" in development, "warn" in production.
   */
  level?: LogLevelName;

  /**
   * Transports active from the moment the logger initialises.
   * Additional transports can be added later via addTransport().
   */
  transports?: Transport[];

  /**
   * Initial context merged into every log entry.
   */
  context?: LogContext;

  /**
   * When true, forces the ConsoleTransport to output JSON regardless of
   * NODE_ENV / environment detection.
   */
  forceJsonOutput?: boolean;
}
