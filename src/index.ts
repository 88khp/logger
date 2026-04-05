// ─── Public API surface ───────────────────────────────────────────────────────
// Everything a consumer needs is exported from here.
// Internals (e.g. detectDefaultLevel) are intentionally not re-exported.

// Core factory + classes
export { createLogger }         from "./createLogger";
export { Logger, ChildLogger }  from "./logger";

// Built-in transports
export { ConsoleTransport }     from "./transports/ConsoleTransport";
export type { ConsoleTransportOptions } from "./transports/ConsoleTransport";
export { BatchTransport }       from "./transports/BatchTransport";
export type { BatchTransportOptions }   from "./transports/BatchTransport";

// Types — re-export everything so consumers never need to import from sub-paths
export {
  LogLevel,
  LOG_LEVEL_MAP,
  LOG_LEVEL_NAME,
} from "./types";

export type {
  LogLevelName,
  LogEntry,
  LogMeta,
  LogContext,
  LoggerConfig,
  Transport,
} from "./types";
