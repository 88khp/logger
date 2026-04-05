// Run: npx ts-node --compiler-options '{"module":"CommonJS","moduleResolution":"node"}' examples/03-child-logger.ts

import { createLogger } from "../src/index";

const logger = createLogger();

// Every log from authLogger automatically includes module: "AuthService"
const authLogger = logger.child({ module: "AuthService" });

authLogger.info("OTP sent", { userId: "u_123" });
authLogger.warn("OTP expired", { userId: "u_123" });

// Output:
// 10:15:01.220 INF [AuthService] OTP sent {"userId":"u_123"}
// 10:15:04.780 WRN [AuthService] OTP expired {"userId":"u_123"}


// Nest deeper — add requestId for a specific request
const reqLogger = authLogger.child({ requestId: "req_77b2f1", userId: "u_123" });

reqLogger.info("Validating token");
reqLogger.error("Token signature invalid");

// Output:
// 10:15:10.001 INF [AuthService] req:req_77b2f1 Validating token {"userId":"u_123"}
// 10:15:10.004 ERR [AuthService] req:req_77b2f1 Token signature invalid {"userId":"u_123"}
