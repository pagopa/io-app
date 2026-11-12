import assert from "node:assert/strict";
import { test } from "node:test";

import { connectDevToolsClient } from "../../../scripts/clients/devToolsClient.js";

test("connects to the page origin even when devServer points elsewhere", t => {
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
