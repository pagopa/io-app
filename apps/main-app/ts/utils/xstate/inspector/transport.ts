import type { StatelyInspectionEvent } from "@statelyai/inspect";

import {
  INSPECTOR_PROTOCOL_VERSION,
  type InspectorClientFrame,
  type InspectorRuntime,
  type InspectorSocket
} from "./types";

/** Events retained while the optional inspector process is unavailable. */
const MAX_QUEUED_EVENTS = 200;

/** One pathological snapshot must not consume the whole development process. */
const MAX_EVENT_BYTES = 1024 * 1024;

/** Failed discovery stays brief; a later machine event starts a new attempt. */
const MAX_CONNECTION_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;
const OPEN_STATE = 1;

export type LazyInspectorTransport = {
  send: (event: StatelyInspectionEvent) => void;
  stop: () => void;
};

type TransportDependencies = {
  createSocket: (url: string) => InspectorSocket;
  schedule: (
    callback: () => void,
    delay: number
  ) => ReturnType<typeof setTimeout>;
  unschedule: (timer: ReturnType<typeof setTimeout>) => void;
};

const defaultDependencies: TransportDependencies = {
  createSocket: url => {
    const socket = new WebSocket(url);
    return socket;
  },
  schedule: (callback, delay) => setTimeout(callback, delay),
  unschedule: timer => clearTimeout(timer)
};

const serializedSize = (value: string): number =>
  typeof TextEncoder === "undefined"
    ? value.length
    : new TextEncoder().encode(value).length;

/**
 * Creates a transport that discovers the optional inspector only after XState
 * emits its first event. Connection failures never escape into the app.
 */
export const createLazyInspectorTransport = (
  url: string,
  runtime: InspectorRuntime,
  dependencies: TransportDependencies = defaultDependencies
): LazyInspectorTransport => {
  const pending: Array<string> = [];
  let socket: InspectorSocket | undefined;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let attempts = 0;
  let dropped = 0;
  let stopped = false;

  const serialize = (frame: InspectorClientFrame): string | undefined => {
    try {
      return JSON.stringify(frame);
    } catch {
      return undefined;
    }
  };

  const sendFrame = (target: InspectorSocket, frame: InspectorClientFrame) => {
    const serialized = serialize(frame);
    if (serialized !== undefined) {
      target.send(serialized);
    }
  };

  const abandonPending = () => {
    dropped += pending.length;
    pending.splice(0, pending.length);
    attempts = 0;
  };

  const connect = () => {
    if (
      stopped ||
      socket !== undefined ||
      retryTimer !== undefined ||
      pending.length === 0
    ) {
      return;
    }
    attempts += 1;
    try {
      const next = dependencies.createSocket(url);
      socket = next;
      next.onopen = () => {
        if (socket !== next || stopped) {
          return;
        }
        attempts = 0;
        sendFrame(next, {
          type: "runtime-connected",
          protocolVersion: INSPECTOR_PROTOCOL_VERSION,
          runtime
        });
        if (dropped > 0) {
          sendFrame(next, {
            type: "events-dropped",
            protocolVersion: INSPECTOR_PROTOCOL_VERSION,
            count: dropped
          });
          dropped = 0;
        }
        try {
          pending.splice(0, pending.length).forEach(frame => next.send(frame));
        } catch {
          next.close();
        }
      };
      next.onerror = () => next.close();
      next.onclose = () => {
        if (socket !== next) {
          return;
        }
        socket = undefined;
        if (stopped || pending.length === 0) {
          return;
        }
        if (attempts >= MAX_CONNECTION_ATTEMPTS) {
          abandonPending();
          return;
        }
        retryTimer = dependencies.schedule(() => {
          retryTimer = undefined;
          connect();
        }, RETRY_DELAY_MS);
      };
    } catch {
      socket = undefined;
      if (attempts >= MAX_CONNECTION_ATTEMPTS) {
        abandonPending();
      } else {
        retryTimer = dependencies.schedule(() => {
          retryTimer = undefined;
          connect();
        }, RETRY_DELAY_MS);
      }
    }
  };

  return {
    send: event => {
      if (stopped) {
        return;
      }
      const frame = serialize({
        type: "inspection-event",
        protocolVersion: INSPECTOR_PROTOCOL_VERSION,
        event
      });
      if (frame === undefined || serializedSize(frame) > MAX_EVENT_BYTES) {
        dropped += 1;
        return;
      }
      if (socket !== undefined && socket.readyState === OPEN_STATE) {
        try {
          socket.send(frame);
          return;
        } catch {
          socket.close();
        }
      }
      if (pending.length >= MAX_QUEUED_EVENTS) {
        pending.shift();
        dropped += 1;
      }
      pending.push(frame);
      connect();
    },
    stop: () => {
      stopped = true;
      pending.splice(0, pending.length);
      if (retryTimer !== undefined) {
        dependencies.unschedule(retryTimer);
      }
      socket?.close();
      socket = undefined;
    }
  };
};
