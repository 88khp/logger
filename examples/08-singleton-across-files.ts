// Demonstrates that createLogger() returns the same instance everywhere.
// In a real app, each of these would be a separate file.

import { createLogger } from "../src/index";

// ─── app entry point (e.g. src/index.ts) ─────────────────────────────────────

// Called once with config — sets up the singleton
createLogger({ level: "debug" });

// ─── AuthService (e.g. src/services/auth.ts) ─────────────────────────────────

function authServiceExample() {
  const logger = createLogger(); // no args — returns the same instance
  const log = logger.child({ module: "AuthService" });

  log.info("Token issued", { userId: "u_1" });
}

// ─── PaymentService (e.g. src/services/payment.ts) ───────────────────────────

function paymentServiceExample() {
  const logger = createLogger(); // same instance again
  const log = logger.child({ module: "PaymentService" });

  log.info("Charge successful", { amount: 2999, currency: "INR" });
  log.error("Refund failed",    { orderId: "ord_55x" });
}

authServiceExample();
paymentServiceExample();

// Output:
// 12:00:01.001 INF [AuthService] Token issued {"userId":"u_1"}
// 12:00:01.002 INF [PaymentService] Charge successful {"amount":2999,"currency":"INR"}
// 12:00:01.003 ERR [PaymentService] Refund failed {"orderId":"ord_55x"}
