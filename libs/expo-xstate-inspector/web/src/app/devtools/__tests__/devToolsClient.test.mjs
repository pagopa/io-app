import assert from "node:assert/strict";
import { test } from "node:test";

import { connectDevToolsClient } from "../devToolsClient.ts";

void test("closes the socket without notifying an unmounted component", t => {
  const originalSocket = globalThis.WebSocket;
  globalThis.location = { host: "localhost:8081", protocol: "http:" };
  let socket;
  let closed = false;
  let notified = false;
  globalThis.WebSocket = class {
    constructor() {
      socket = this;
    }
    close() {
      closed = true;
      this.onclose?.();
    }
  };
  t.after(() => {
    delete globalThis.location;
    globalThis.WebSocket = originalSocket;
  });

  const disconnect = connectDevToolsClient({
    onClose: () => {
      notified = true;
    },
    onMessage() {}
  });
  disconnect();

  assert.equal(closed, true);
  assert.equal(notified, false);
  assert.equal(socket.onmessage, null);
  assert.equal(socket.onopen, null);
});

void test("connects to the page origin even when devServer points elsewhere", t => {
  globalThis.location = {
    host: "localhost:8081",
    protocol: "https:",
    search: "?devServer=untrusted.example"
  };
  let url;
  globalThis.WebSocket = class {
    constructor(value) {
      url = value;
    }
  };
  t.after(() => {
    delete globalThis.location;
    delete globalThis.WebSocket;
  });

  connectDevToolsClient({ onClose() {}, onMessage() {} });
  assert.equal(url, "wss://localhost:8081/expo-dev-plugins/broadcast");
});
