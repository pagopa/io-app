import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

import type { ConnectionStatus, InspectorRuntime } from "../types";

import { INSPECTOR_PROTOCOL_VERSION } from "../constants";
import { asRecord, asString } from "../lib/format";
import { ingest, reset, setDropped } from "./timeline";

export type StreamState = {
  error?: string;
  runtime?: InspectorRuntime;
  status: ConnectionStatus;
};

const runtimeFrom = (value: unknown): InspectorRuntime | undefined => {
  const record = asRecord(value);
  const id = asString(record?.id);
  const appVersion = asString(record?.appVersion);
  const platform = asString(record?.platform);
  return id !== undefined && appVersion !== undefined && platform !== undefined
    ? { id, appVersion, platform }
    : undefined;
};

const connectStream = (
  setState: Dispatch<SetStateAction<StreamState>>
): (() => void) => {
  let socket: undefined | WebSocket;
  let retry: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  let hasProtocolError = false;

  const connect = () => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    socket = new WebSocket(
      `${protocol}//${window.location.host}/xstate-inspector/browser`
    );
    socket.addEventListener("message", message => {
      let frame: Record<string, unknown> | undefined;
      try {
        frame = asRecord(JSON.parse(String(message.data)));
      } catch {
        return;
      }
      if (
        frame === undefined ||
        frame.protocolVersion !== INSPECTOR_PROTOCOL_VERSION
      ) {
        hasProtocolError = true;
        setState({
          status: "error",
          error: `Inspector protocol ${INSPECTOR_PROTOCOL_VERSION} required`
        });
        socket?.close();
        return;
      }
      if (frame.type === "protocol-error") {
        hasProtocolError = true;
        setState({
          status: "error",
          error: asString(frame.message) ?? "Inspector protocol mismatch"
        });
        return;
      }
      if (frame.type === "session-state") {
        const runtime = runtimeFrom(frame.runtime);
        const dropped = Number(frame.dropped) || 0;
        if (frame.reset === true) {
          reset(runtime, dropped);
        } else {
          setDropped(dropped);
        }
        setState({
          status:
            frame.status === "connected" ||
            frame.status === "disconnected" ||
            frame.status === "waiting"
              ? frame.status
              : "error",
          runtime
        });
        return;
      }
      if (frame.type === "inspection-event") {
        const serialized = JSON.stringify(frame.event);
        ingest(frame.event, serialized.length);
      }
    });
    socket.addEventListener("close", () => {
      if (disposed || hasProtocolError) {
        return;
      }
      setState(current => ({ ...current, status: "connecting" }));
      retry = setTimeout(connect, 1000);
    });
    socket.addEventListener("error", () => socket?.close());
  };

  connect();
  return () => {
    disposed = true;
    if (retry !== undefined) {
      clearTimeout(retry);
    }
    socket?.close();
  };
};

/** Connects the local browser UI to replay and live inspection events. */
export const useStream = (): StreamState => {
  const [state, setState] = useState<StreamState>({ status: "connecting" });

  useEffect(() => {
    const disconnect = connectStream(setState);
    return disconnect;
  }, []);

  return state;
};
