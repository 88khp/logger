// Run: npx ts-node --compiler-options '{"module":"CommonJS","moduleResolution":"node"}' examples/05-custom-transport.ts
// Shows how to write your own transport and plug it in.

import { createLogger, Transport, LogEntry, LogLevel } from "../src/index";

const logger = createLogger();

// A transport is just an object with a name and a log() function.
// This one only captures errors and above, and writes them to an array.

const errorStore: LogEntry[] = [];

const errorCollector: Transport = {
  name:     "error-collector",
  minLevel: LogLevel.ERROR,   // debug / info / warn never reach this transport

  log(entry: LogEntry): void {
    errorStore.push(entry);
  },
};

logger.addTransport(errorCollector);

logger.info("User logged in", { userId: "u_1" });   // goes to console only
logger.warn("Token expiring", { expiresIn: 60 });   // goes to console only
logger.error("DB query failed", { table: "users" }); // goes to console + errorCollector
logger.error("Cache miss",      { key: "session:u_1" }); // goes to console + errorCollector

console.log("\nerrorStore has", errorStore.length, "entries:");
console.log(errorStore.map(e => `[${e.levelName}] ${e.message}`));

// Output:
// 11:02:01.001 INF User logged in {"userId":"u_1"}
// 11:02:01.002 WRN Token expiring {"expiresIn":60}
// 11:02:01.003 ERR DB query failed {"table":"users"}
// 11:02:01.004 ERR Cache miss {"key":"session:u_1"}
//
// errorStore has 2 entries:
// [ '[error] DB query failed', '[error] Cache miss' ]
