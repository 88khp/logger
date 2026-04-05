// Run: npx ts-node --compiler-options '{"module":"CommonJS","moduleResolution":"node"}' examples/02-level-filtering.ts

import { createLogger } from "../src/index";

const logger = createLogger({ level: "debug" });

// Default: everything shows
logger.debug("debug message");
logger.info("info message");
logger.warn("warn message");

// Output:
// 10:00:01.001 DBG debug message
// 10:00:01.002 INF info message
// 10:00:01.003 WRN warn message

logger.setLevel("warn");

// Now debug and info are silently dropped — no output, no processing
logger.debug("this is dropped");
logger.info("this is dropped");
logger.warn("this shows up");
logger.error("this shows up");

// Output:
// 10:00:01.005 WRN this shows up
// 10:00:01.006 ERR this shows up
