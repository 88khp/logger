// Run: npx ts-node --compiler-options '{"module":"CommonJS","moduleResolution":"node"}' examples/04-json-output.ts
// Simulates what production logs look like.

import { createLogger, ConsoleTransport } from "../src/index";

const logger = createLogger({
  level:      "info",
  transports: [new ConsoleTransport({ format: "json" })],
});

logger.info("Server started", { port: 3000 });
logger.warn("Slow query detected", { queryMs: 1840, table: "orders" });
logger.error("Unhandled exception", { error: "TypeError: Cannot read property of undefined" });

// Output:
// {"timestamp":"2026-04-05T09:41:12.003Z","level":"info","message":"Server started","data":{"port":3000}}
// {"timestamp":"2026-04-05T09:41:12.005Z","level":"warn","message":"Slow query detected","data":{"queryMs":1840,"table":"orders"}}
// {"timestamp":"2026-04-05T09:41:12.007Z","level":"error","message":"Unhandled exception","data":{"error":"TypeError: Cannot read property of undefined"}}
