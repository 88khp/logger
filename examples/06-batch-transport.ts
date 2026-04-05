// Run: npx ts-node --compiler-options '{"module":"CommonJS","moduleResolution":"node"}' examples/06-batch-transport.ts
// Shows how BatchTransport holds logs and sends them together.

import { createLogger, BatchTransport } from "../src/index";

const logger = createLogger();

logger.addTransport(new BatchTransport({
  maxSize:         3,      // send when 3 logs pile up
  flushIntervalMs: 5_000,  // or every 5 seconds, whichever comes first

  async onFlush(entries) {
    console.log(`\n→ onFlush fired with ${entries.length} entries:`);
    entries.forEach(e => console.log(`  [${e.levelName}] ${e.message}`));
  },
}));

(async () => {
  logger.info("Event 1");
  logger.info("Event 2");
  logger.info("Event 3"); // ← batch is full, onFlush fires immediately

  logger.info("Event 4");
  logger.info("Event 5");
  // These two sit in memory until the 5s timer fires

  await logger.flush(); // force-send the remaining 2 before process exits
})();

// Output:
//
// → onFlush fired with 3 entries:
//   [info] Event 1
//   [info] Event 2
//   [info] Event 3
//
// → onFlush fired with 2 entries:
//   [info] Event 4
//   [info] Event 5
