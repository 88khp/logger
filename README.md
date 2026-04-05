# @devraj-labs/logger

Production-grade, platform-independent logging library for JavaScript/TypeScript.  
Works across **React Native**, **Node.js**, and the **browser**.

---

- **5 log levels** — `debug`, `info`, `warn`, `error`, `fatal`
- **Structured logging** — attach any object as metadata to every log
- **Child loggers** — scope a logger to a module or request, context stamps every line automatically
- **Pluggable transports** — the logger never stores or sends anything, your transports decide where logs go
- **Pretty output in dev, JSON in production** — auto-detected, no config needed
- **Singleton** — one instance shared across your entire app, no passing it around
- **BatchTransport built-in** — buffer logs and send in one batch instead of one call per line
- **Per-transport level filtering** — e.g. console shows debug, Sentry only gets errors
- **Graceful shutdown** — `flush()` ensures buffered logs are sent before the process exits
- **Zero runtime dependencies**
- **React Native + Node + browser** — works anywhere

---

## Examples

| # | What it covers | File |
|---|---------------|------|
| 1 | All 5 log levels and what the terminal output looks like | [01-basic-logging.ts](examples/01-basic-logging.ts) |
| 2 | `setLevel()` — which logs get dropped vs shown | [02-level-filtering.ts](examples/02-level-filtering.ts) |
| 3 | Child loggers — scoped module name, nested request context | [03-child-logger.ts](examples/03-child-logger.ts) |
| 4 | Production JSON output format | [04-json-output.ts](examples/04-json-output.ts) |
| 5 | Writing a custom transport, per-transport `minLevel` | [05-custom-transport.ts](examples/05-custom-transport.ts) |
| 6 | `BatchTransport` — logs held in memory, sent in one go | [06-batch-transport.ts](examples/06-batch-transport.ts) |
| 7 | `flush()` — don't lose logs when the process exits | [07-flush-on-shutdown.ts](examples/07-flush-on-shutdown.ts) |
| 8 | Singleton — sharing the same logger across multiple files | [08-singleton-across-files.ts](examples/08-singleton-across-files.ts) |

---

## Install

```bash
npm install @devraj-labs/logger
```

---

## Setup

Call `createLogger()` with config **once** at your app's entry point. Everywhere else call it with no args — it returns the same instance.

**Node / Express:**
```ts
// src/index.ts
const logger = createLogger({ level: "info" });
```

**React Native:**
```ts
// App.tsx
createLogger({
  level:      __DEV__ ? "debug" : "warn",
  transports: [new ConsoleTransport({ format: __DEV__ ? "pretty" : "json" })],
});
```

**Any other file:**
```ts
const logger = createLogger(); // no args — returns the already-configured singleton
const log = logger.child({ module: "AuthService" });
```

---

## Log Levels

| Level   | When to use |
|---------|-------------|
| `debug` | Internal details — DB queries, state changes |
| `info`  | Normal events — server started, user logged in |
| `warn`  | Something looks wrong but app is still running |
| `error` | A request or operation failed |
| `fatal` | App is about to crash |

---

## Transports — Where Logs Go

The logger never stores or sends anything itself. You plug in transports that decide what happens to each log entry.

```
Your Code  →  Logger (level filter)  →  ConsoleTransport   (prints to terminal)
                                     →  BatchTransport      (buffers → POST to server)
                                     →  YourTransport       (AsyncStorage / Sentry / anything)
```

**`ConsoleTransport`** — added automatically if you don't specify any transports.  
**`BatchTransport`** — holds logs in memory and sends them in one batch. Avoids one HTTP call per log line.  
**Custom transport** — implement `{ name, log(entry) }`. See [example 5](examples/05-custom-transport.ts).

### `flush()` — call on shutdown

If `BatchTransport` has unsent logs when the process exits, they're lost. `flush()` forces everything out immediately.

```ts
process.on("SIGTERM", async () => {
  await logger.flush();
  process.exit(0);
});
```

---

## Environment Defaults

| `NODE_ENV`    | Default level | Console format  |
|---------------|---------------|-----------------|
| `development` | `debug`       | pretty (colours)|
| `production`  | `warn`        | json            |
| unset         | `debug`       | pretty          |

---

## Why

- Only logs. Never stores. Never sends.
- Your app decides where logs go via transports.
- Works the same across React Native, Node, and the browser.
- Zero runtime dependencies.

---

## License

MIT