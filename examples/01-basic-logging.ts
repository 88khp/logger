// Run: npx ts-node --compiler-options '{"module":"CommonJS","moduleResolution":"node"}' examples/01-basic-logging.ts

import { createLogger } from "../src/index";

const logger = createLogger({ level: "debug" });

logger.debug("Connecting to database", { host: "localhost", port: 5432 });
logger.info("Server started", { port: 3000 });
logger.warn("Memory usage high", { usedMb: 480, limitMb: 512 });
logger.error("Request failed", { status: 500, endpoint: "/api/users" });
logger.fatal("Disk full", { diskUsage: "100%" });

// Output:
// 09:41:12.001 DBG Connecting to database {"host":"localhost","port":5432}
// 09:41:12.003 INF Server started {"port":3000}
// 09:41:12.005 WRN Memory usage high {"usedMb":480,"limitMb":512}
// 09:41:12.007 ERR Request failed {"status":500,"endpoint":"/api/users"}
// 09:41:12.009 FTL Disk full {"diskUsage":"100%"}
