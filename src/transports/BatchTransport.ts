import { LogEntry, Transport, LogLevel } from "../types";

export interface BatchTransportOptions {
  /**
   * Maximum number of entries to hold before flushing.
   * @default 50
   */
  maxSize?: number;

  /**
   * Flush interval in milliseconds. Set to 0 to disable time-based flushing.
   * @default 5000
   */
  flushIntervalMs?: number;

  /**
   * Called with the current batch. Returning a rejected promise is safe —
   * BatchTransport will not crash; it just clears the batch anyway.
   */
  onFlush: (entries: LogEntry[]) => void | Promise<void>;
}

/**
 * Transport decorator that buffers entries and flushes them in batches.
 *
 * Designed for remote transports (analytics, crash reporting, APM) that
 * benefit from amortised network calls.
 *
 * Usage:
 *   logger.addTransport(new BatchTransport({
 *     onFlush: (batch) => fetch("/api/logs", { method: "POST", body: JSON.stringify(batch) }),
 *     maxSize: 100,
 *     flushIntervalMs: 10_000,
 *   }));
 */
export class BatchTransport implements Transport {
  readonly name: string;
  minLevel?: LogLevel;

  private readonly _queue: LogEntry[] = [];
  private readonly _maxSize: number;
  private readonly _onFlush: (entries: LogEntry[]) => void | Promise<void>;
  private _timer: ReturnType<typeof setInterval> | null = null;

  constructor(options: BatchTransportOptions) {
    this.name      = "batch";
    this._maxSize  = options.maxSize ?? 50;
    this._onFlush  = options.onFlush;

    const interval = options.flushIntervalMs ?? 5_000;
    if (interval > 0) {
      this._timer = setInterval(() => void this._flush(), interval);
      // Don't block process exit in Node
      if (this._timer && typeof this._timer === "object" && "unref" in this._timer) {
        (this._timer as NodeJS.Timeout).unref();
      }
    }
  }

  log(entry: LogEntry): void {
    this._queue.push(entry);
    if (this._queue.length >= this._maxSize) {
      void this._flush();
    }
  }

  async flush(): Promise<void> {
    if (this._timer !== null) {
      clearInterval(this._timer);
      this._timer = null;
    }
    await this._flush();
  }

  private async _flush(): Promise<void> {
    if (this._queue.length === 0) return;
    const batch = this._queue.splice(0, this._queue.length);
    try {
      await this._onFlush(batch);
    } catch {
      // Swallow — caller's onFlush failure must not propagate
    }
  }
}
