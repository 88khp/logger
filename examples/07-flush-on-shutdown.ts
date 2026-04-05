// Run: npx ts-node --compiler-options '{"module":"CommonJS","moduleResolution":"node"}' examples/07-flush-on-shutdown.ts
// Shows why flush() matters when using BatchTransport.

import { createLogger, BatchTransport } from "../src/index";

const logger = createLogger();

logger.addTransport(new BatchTransport({
  maxSize:         50,
  flushIntervalMs: 30_000,
  async onFlush(entries) {
    console.log(`→ Sending ${entries.length} logs to server`);
    // await fetch("https://logs.example.com/ingest", { ... })
  },
}));

logger.info("App started");
logger.info("User signed up", { userId: "u_99" });
logger.warn("Slow response",  { ms: 2100 });
// All 3 sit in the batch — maxSize is 50, timer is 30s

async function shutdown() {
  logger.info("Shutting down...");
  await logger.flush(); // forces the batch to send right now
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT",  shutdown); // Ctrl+C

// Without flush():  logs are lost when process exits
// With flush():
// → Sending 4 logs to server
// (process exits cleanly)
