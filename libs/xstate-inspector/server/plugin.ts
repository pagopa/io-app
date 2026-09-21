import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import type { Plugin } from "vite";

import WebSocket, { WebSocketServer } from "ws";

import { INSPECTOR_PROTOCOL_VERSION } from "../src/constants.ts";
import {
  InspectorSession,
  type InspectorSessionSnapshot,
  type RuntimeMetadata
} from "./session.ts";

const RUNTIME_PATH = "/xstate-inspector/runtime";
const BROWSER_PATH = "/xstate-inspector/browser";
const MAX_FRAME_BYTES = 2 * 1024 * 1024;

type RecordValue = Record<string, unknown>;

const asRecord = (value: unknown): RecordValue | undefined =>
  typeof value === "object" && value !== null
    ? (value as RecordValue)
    : undefined;

const isLoopback = (address: string | undefined): boolean =>
  address === "127.0.0.1" ||
  address === "::1" ||
  address === "::ffff:127.0.0.1";

const parseRuntime = (value: unknown): RuntimeMetadata | undefined => {
  const record = asRecord(value);
  return record !== undefined &&
    typeof record.id === "string" &&
    typeof record.appVersion === "string" &&
    typeof record.platform === "string"
    ? {
        id: record.id,
        appVersion: record.appVersion,
        platform: record.platform
      }
    : undefined;
};

const send = (socket: WebSocket, frame: unknown): void => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(frame));
  }
};

const stateFrame = (snapshot: InspectorSessionSnapshot) => ({
  type: "session-state",
  protocolVersion: INSPECTOR_PROTOCOL_VERSION,
  status: snapshot.connected
    ? "connected"
    : snapshot.runtime === undefined
      ? "waiting"
      : "disconnected",
  dropped: snapshot.dropped,
  runtime: snapshot.runtime
});

/** Vite adapter owning WebSocket ingestion, replay, and loopback-only UI. */
export const xstateInspectorPlugin = (): Plugin => ({
  name: "io-xstate-inspector",
  configureServer: server => {
    const httpServer = server.httpServer;
    if (httpServer === null) {
      return;
    }

    const session = new InspectorSession();
    const browsers = new Set<WebSocket>();
    const sockets = new WebSocketServer({
      noServer: true,
      maxPayload: MAX_FRAME_BYTES
    });
    let runtimeSocket: undefined | WebSocket;
    let runtimeId: string | undefined;

    const broadcast = (frame: unknown) => {
      browsers.forEach(browser => send(browser, frame));
    };

    const broadcastState = () => broadcast(stateFrame(session.snapshot()));

    const connectBrowser = (socket: WebSocket) => {
      browsers.add(socket);
      const snapshot = session.snapshot();
      send(socket, { ...stateFrame(snapshot), reset: true });
      snapshot.events.forEach(({ event }) =>
        send(socket, {
          type: "inspection-event",
          protocolVersion: INSPECTOR_PROTOCOL_VERSION,
          event
        })
      );
      socket.on("close", () => browsers.delete(socket));
    };

    const rejectProtocol = (socket: WebSocket) => {
      const frame = {
        type: "protocol-error",
        protocolVersion: INSPECTOR_PROTOCOL_VERSION,
        message: `Inspector protocol ${INSPECTOR_PROTOCOL_VERSION} required`
      };
      send(socket, frame);
      broadcast(frame);
      socket.close(4002, "Inspector protocol mismatch");
    };

    const connectRuntime = (socket: WebSocket) => {
      let acceptedRuntime: string | undefined;
      socket.on("message", data => {
        let frame: RecordValue | undefined;
        try {
          frame = asRecord(JSON.parse(data.toString()));
        } catch {
          socket.close(4000, "Malformed inspector frame");
          return;
        }
        if (
          frame === undefined ||
          frame.protocolVersion !== INSPECTOR_PROTOCOL_VERSION
        ) {
          rejectProtocol(socket);
          return;
        }

        if (acceptedRuntime === undefined) {
          const runtime = parseRuntime(frame.runtime);
          if (frame.type !== "runtime-connected" || runtime === undefined) {
            socket.close(4000, "Runtime handshake required");
            return;
          }
          runtimeSocket?.close(4001, "Runtime replaced");
          runtimeSocket = socket;
          runtimeId = runtime.id;
          acceptedRuntime = runtime.id;
          session.replaceRuntime(runtime);
          broadcast({ ...stateFrame(session.snapshot()), reset: true });
          return;
        }

        if (socket !== runtimeSocket || acceptedRuntime !== runtimeId) {
          return;
        }
        if (frame.type === "events-dropped") {
          session.recordDropped(Number(frame.count));
          broadcastState();
          return;
        }
        if (frame.type !== "inspection-event") {
          socket.close(4000, "Unknown inspector frame");
          return;
        }
        const event = asRecord(frame.event);
        if (event === undefined || typeof event.type !== "string") {
          session.recordDropped(1);
          broadcastState();
          return;
        }
        const size = Buffer.byteLength(JSON.stringify(event));
        const droppedBefore = session.snapshot().dropped;
        const accepted = session.append(event, size);
        if (accepted) {
          broadcast({
            type: "inspection-event",
            protocolVersion: INSPECTOR_PROTOCOL_VERSION,
            event
          });
        }
        if (session.snapshot().dropped !== droppedBefore) {
          broadcastState();
        }
      });
      socket.on("close", () => {
        if (socket === runtimeSocket && acceptedRuntime !== undefined) {
          session.disconnect(acceptedRuntime);
          runtimeSocket = undefined;
          runtimeId = undefined;
          broadcastState();
        }
      });
    };

    sockets.on("connection", (socket, request) => {
      const path = new URL(request.url ?? "/", "http://localhost").pathname;
      if (path === BROWSER_PATH) {
        connectBrowser(socket);
      } else {
        connectRuntime(socket);
      }
      socket.on("error", () => undefined);
    });

    const onUpgrade = (
      request: IncomingMessage,
      socket: Duplex,
      head: Buffer
    ) => {
      const path = new URL(request.url ?? "/", "http://localhost").pathname;
      if (path !== RUNTIME_PATH && path !== BROWSER_PATH) {
        return;
      }
      if (path === BROWSER_PATH && !isLoopback(request.socket.remoteAddress)) {
        socket.destroy();
        return;
      }
      sockets.handleUpgrade(request, socket, head, upgraded =>
        sockets.emit("connection", upgraded, request)
      );
    };

    httpServer.on("upgrade", onUpgrade);
    httpServer.once("close", () => {
      httpServer.off("upgrade", onUpgrade);
      sockets.close();
    });

    server.middlewares.use((request, response, next) => {
      if (isLoopback(request.socket.remoteAddress)) {
        next();
        return;
      }
      response.statusCode = 403;
      response.end("Inspector UI is available only from this computer");
    });
  }
});
