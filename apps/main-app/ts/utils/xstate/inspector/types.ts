import type { StatelyInspectionEvent } from "@statelyai/inspect";

/** Wire protocol shared by compatible inspector processes. */
export const INSPECTOR_PROTOCOL_VERSION = 1;

/** Fixed port keeps discovery configuration-free on simulators and devices. */
export const INSPECTOR_PORT = 5173;

export type InspectorClientFrame =
  | {
      count: number;
      protocolVersion: number;
      type: "events-dropped";
    }
  | {
      event: StatelyInspectionEvent;
      protocolVersion: number;
      type: "inspection-event";
    }
  | {
      protocolVersion: number;
      runtime: InspectorRuntime;
      type: "runtime-connected";
    };

/** Runtime metadata shown by the browser inspector. */
export type InspectorRuntime = {
  appVersion: string;
  id: string;
  platform: string;
};

/** Minimal WebSocket surface used by the lazy transport and its tests. */
export type InspectorSocket = Pick<
  WebSocket,
  "close" | "onclose" | "onerror" | "onopen" | "readyState" | "send"
>;
