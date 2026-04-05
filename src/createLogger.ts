import { Logger } from "./logger";
import { ConsoleTransport } from "./transports/ConsoleTransport";
import { LoggerConfig } from "./types";

/**
 * Factory that returns the singleton Logger, optionally bootstrapped with
 * a ConsoleTransport if no transports are configured.
 *
 * Calling this multiple times is safe — configuration is only applied on the
 * first call (when the singleton is created).
 *
 *   // Application entry point
 *   const logger = createLogger({ level: "info" });
 *
 *   // Anywhere else in the codebase
 *   const logger = createLogger(); // returns the same instance
 */
export function createLogger(config?: LoggerConfig): Logger {
  const instance = Logger.getInstance(config);

  // Bootstrap with a console transport if nothing was provided
  if (instance.getTransportNames().length === 0) {
    instance.addTransport(new ConsoleTransport());
  }

  return instance;
}
