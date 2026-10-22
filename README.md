<div align="center">

# Logger

> Production-grade, platform-independent logging for JavaScript & TypeScript.
> Works in **React Native**, **Node.js**, and the **browser** — zero runtime dependencies.

[![npm version](https://img.shields.io/npm/v/@88khp/logger)](https://www.npmjs.com/package/@88khp/logger)
[![license](https://img.shields.io/npm/l/@88khp/logger)](./LICENSE)
[![types](https://img.shields.io/npm/types/@88khp/logger)](https://www.npmjs.com/package/@88khp/logger)

</div>

---

## Is it for you?

### Why use it

- You want structured logs that work the same in React Native, Node.js and the browser.
- You want to send logs wherever you like through transports, with no runtime dependencies.

### The problem it solves

Most loggers are either too simple, with no structure or transports, or too heavy and Node-only. This one has typed metadata, child loggers, and pluggable transports, and it works in all three environments.

### Who it's not for

- Teams that want a hosted log service out of the box. Write a transport for the service you use.
- Projects that need the logger to store logs for you. It doesn't store logs.

### What it doesn't do

- It doesn't store or send logs by itself. Your transports decide where logs go.
- It doesn't collect crash reports or metrics.

---

## Why

Most loggers are either too simple (no structure, no transports) or too heavy (Node-only, tons of deps). This one is neither.

- Only logs. Never stores. Never sends.
- Your app decides where logs go via pluggable transports.
- Same API across React Native, Node, and the browser.
- Zero runtime dependencies.

---

## Features

| | |
|---|---|
| **5 log levels** | `debug` · `info` · `warn` · `error` · `fatal` |
| **Structured logging** | Attach typed metadata objects to every log entry |
| **Child loggers** | Scope a logger to a module or request — context stamps every line |
| **Pluggable transports** | Console, batch, or write your own in ~10 lines |
| **Smart defaults** | Pretty output in dev, JSON in production — auto-detected |
| **Singleton** | One instance across your entire app, no prop-drilling |
| **BatchTransport** | Buffer logs and flush in one batch instead of per-line HTTP calls |
| **Per-transport level filtering** | Console shows `debug`; Sentry only gets `error` and above |
| **Graceful shutdown** | `flush()` ensures buffered logs are sent before process exit |
| **Zero dependencies** | Nothing in `node_modules` that you didn't ask for |

---

## Install

```bash
npm install @88khp/logger
# or
yarn add @88khp/logger
```

---

## Quick Start

```ts
import { createLogger } from "@88khp/logger";

// Call once at your app entry point
const logger = createLogger({ level: "info" });

logger.info("Server started", { port: 3000 });
logger.warn("Disk usage high", { usedPercent: 91 });
logger.error("Request failed", { path: "/api/user", statusCode: 500 });
```

Call `createLogger()` with no arguments anywhere else — it returns the same singleton.

```ts
// some-other-file.ts
const logger = createLogger(); // same instance, no config needed
```

---

## Setup by Platform

**Node / Express**
```ts
// src/index.ts
const logger = createLogger({ level: "info" });
```

**React Native**
```ts
// App.tsx
import { createLogger, ConsoleTransport } from "@88khp/logger";

createLogger({
  level:      __DEV__ ? "debug" : "warn",
  transports: [new ConsoleTransport({ format: __DEV__ ? "pretty" : "json" })],
});
```

---

## Child Loggers

Scope a logger to a module or request. All context fields are stamped on every log line automatically.

```ts
const logger = createLogger();

// Module-scoped
const log = logger.child({ module: "AuthService" });
log.info("Token issued", { userId: "u_123" });
// → { module: "AuthService", userId: "u_123", message: "Token issued", ... }

// Request-scoped (nest deeper)
const reqLog = log.child({ requestId: "req_abc" });
reqLog.debug("Cache miss");
// → { module: "AuthService", requestId: "req_abc", message: "Cache miss", ... }
```

---

## Log Levels

```ts
logger.debug("DB query", { sql: "SELECT ..." });   // internal details
logger.info("User signed in", { userId: "u_1" });  // normal events
logger.warn("Rate limit approaching", { pct: 80 }); // degraded but alive
logger.error("Payment failed", { orderId: "o_9" }); // operation failed
logger.fatal("Out of memory");                       // app about to crash
```

| Level   | Numeric | When to use |
|---------|---------|-------------|
| `debug` | 0 | Internal details — queries, state changes |
| `info`  | 1 | Normal events — server started, user logged in |
| `warn`  | 2 | Something looks wrong but app is still running |
| `error` | 3 | A request or operation failed |
| `fatal` | 4 | App is about to crash |
| `silent`| 5 | Disables all output |

Change the level at runtime:

```ts
logger.setLevel("warn"); // drop debug + info from here on
```

---

## Transports

The logger never stores or sends anything itself. Transports decide what happens to each log entry.

```
Your Code → Logger (level gate) → ConsoleTransport   (prints to terminal)
                                → BatchTransport      (buffers → POST to server)
                                → YourCustomTransport (AsyncStorage / Sentry / file / anything)
```

### ConsoleTransport

Added automatically if you don't specify any transports. Prints pretty output in dev, JSON in production.

```ts
import { ConsoleTransport } from "@88khp/logger";

createLogger({
  transports: [
    new ConsoleTransport({ format: "pretty" }), // or "json" | "auto"
  ],
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `format` | `"pretty" \| "json" \| "auto"` | `"auto"` | Output format. `"auto"` picks pretty in dev, JSON in production |
| `fatalMethod` | `"error" \| "warn" \| "log"` | `"error"` | Which `console` method is used for `fatal` entries |

### BatchTransport

Buffers logs in memory and sends them in one batch. Avoids one HTTP call per log line.

```ts
import { BatchTransport } from "@88khp/logger";

createLogger({
  transports: [
    new BatchTransport({
      sendBatch: async (entries) => {
        await fetch("/api/logs", {
          method: "POST",
          body: JSON.stringify(entries),
        });
      },
      maxBatchSize: 50,
      flushIntervalMs: 5000,
    }),
  ],
});
```

### Custom Transport

Implement `{ name, log(entry) }` — that's the whole interface.

```ts
import { Transport, LogEntry } from "@88khp/logger";

class SentryTransport implements Transport {
  name = "sentry";
  minLevel = LogLevel.ERROR; // only errors and above

  log(entry: LogEntry): void {
    Sentry.captureMessage(entry.message, {
      level: entry.levelName,
      extra: entry.meta,
    });
  }
}

createLogger({
  transports: [new ConsoleTransport(), new SentryTransport()],
});
```

### Per-transport level filtering

```ts
createLogger({
  level: "debug", // root logger emits everything
  transports: [
    new ConsoleTransport(),                              // sees all levels
    new SentryTransport({ minLevel: LogLevel.ERROR }),   // only errors+
  ],
});
```

---

## Graceful Shutdown

If `BatchTransport` holds unsent logs when the process exits, they're lost. Call `flush()` before exiting.

```ts
process.on("SIGTERM", async () => {
  await logger.flush(); // drains all transport buffers
  process.exit(0);
});
```

---

## Environment Defaults

| `NODE_ENV`    | Default level | Console format   |
|---------------|---------------|------------------|
| `development` | `debug`       | pretty (colours) |
| `production`  | `warn`        | JSON             |
| unset         | `debug`       | pretty           |

Override at any time:

```ts
createLogger({ level: "info", forceJsonOutput: true });
```

---

## API Reference

### `createLogger(config?)`

Returns the singleton `Logger`. Config only applies on the **first** call.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `level` | `LogLevelName` | env-detected | Minimum level to emit |
| `transports` | `Transport[]` | `[ConsoleTransport]` | Active transports |
| `context` | `LogContext` | `{}` | Global context merged into every entry |
| `forceJsonOutput` | `boolean` | `false` | Force JSON format regardless of env |

### `Logger`

| Method | Description |
|--------|-------------|
| `debug / info / warn / error / fatal(msg, meta?)` | Emit a log entry |
| `child(context)` | Create a scoped child logger |
| `setLevel(level)` | Change minimum level at runtime |
| `getLevel()` | Returns current level name |
| `addTransport(transport)` | Register a transport |
| `removeTransport(name)` | Remove a transport by name (calls `flush`) |
| `setContext(context)` | Merge context into root logger |
| `flush()` | Drain all transport buffers |

---

## Examples

| # | What it covers | File |
|---|----------------|------|
| 1 | All 5 log levels and terminal output | [01-basic-logging.ts](examples/01-basic-logging.ts) |
| 2 | `setLevel()` — which logs are dropped vs shown | [02-level-filtering.ts](examples/02-level-filtering.ts) |
| 3 | Child loggers — module name, nested request context | [03-child-logger.ts](examples/03-child-logger.ts) |
| 4 | Production JSON output format | [04-json-output.ts](examples/04-json-output.ts) |
| 5 | Writing a custom transport, per-transport `minLevel` | [05-custom-transport.ts](examples/05-custom-transport.ts) |
| 6 | `BatchTransport` — buffer logs, send in one go | [06-batch-transport.ts](examples/06-batch-transport.ts) |
| 7 | `flush()` — don't lose logs on process exit | [07-flush-on-shutdown.ts](examples/07-flush-on-shutdown.ts) |
| 8 | Singleton — sharing one logger across multiple files | [08-singleton-across-files.ts](examples/08-singleton-across-files.ts) |

---

## License

[MIT](./LICENSE) © [88khp](https://github.com/88khp)
