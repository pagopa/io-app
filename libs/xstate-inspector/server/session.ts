import { MAX_EVENTS, MAX_RETAINED_BYTES } from "../src/constants.ts";

export type InspectorSessionSnapshot = {
  connected: boolean;
  dropped: number;
  events: ReadonlyArray<RetainedInspectionEvent>;
  runtime?: RuntimeMetadata;
};

export type RetainedInspectionEvent = {
  event: unknown;
  size: number;
};

export type RuntimeMetadata = {
  appVersion: string;
  id: string;
  platform: string;
};

type RetentionLimits = {
  maxBytes: number;
  maxEvents: number;
};

const defaultLimits: RetentionLimits = {
  maxBytes: MAX_RETAINED_BYTES,
  maxEvents: MAX_EVENTS
};

/**
 * Owns one runtime and its bounded replay history. Replacing the runtime clears
 * every event, preventing data from separate app launches from mixing.
 */
export class InspectorSession {
  private connected = false;
  private dropped = 0;
  private readonly events: Array<RetainedInspectionEvent> = [];
  private retainedBytes = 0;
  private runtime: RuntimeMetadata | undefined;

  public constructor(private readonly limits = defaultLimits) {}

  public append(event: unknown, size: number): boolean {
    if (size > this.limits.maxBytes) {
      this.dropped += 1;
      return false;
    }
    this.events.push({ event, size });
    this.retainedBytes += size;
    while (
      this.events.length > this.limits.maxEvents ||
      this.retainedBytes > this.limits.maxBytes
    ) {
      const removed = this.events.shift();
      if (removed === undefined) {
        break;
      }
      this.retainedBytes -= removed.size;
      this.dropped += 1;
    }
    return true;
  }

  public disconnect(runtimeId: string): void {
    if (this.runtime?.id === runtimeId) {
      this.connected = false;
    }
  }

  public recordDropped(count: number): void {
    if (Number.isSafeInteger(count) && count > 0) {
      this.dropped += count;
    }
  }

  public replaceRuntime(runtime: RuntimeMetadata): void {
    this.connected = true;
    this.dropped = 0;
    this.events.splice(0, this.events.length);
    this.retainedBytes = 0;
    this.runtime = runtime;
  }

  public snapshot(): InspectorSessionSnapshot {
    return {
      connected: this.connected,
      dropped: this.dropped,
      events: this.events,
      runtime: this.runtime
    };
  }
}
