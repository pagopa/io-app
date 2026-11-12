import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { test } from "node:test";
import { createActor, createMachine } from "xstate";

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (specifier.startsWith(".") && error.code === "ERR_MODULE_NOT_FOUND") {
        return nextResolve(`${specifier}.ts`, context);
      }
      throw error;
    }
  }
});

const { createInspector } = await import("../inspectors/createInspector.ts");
const { createActorRegistry } = await import("../registries/actorRegistry.ts");
const { serializeValue } = await import("../serializers/value.ts");

test("serializes sets recursively and detects cycles", () => {
  const value = new Set(["credential", { nested: new Set([1, 2]) }]);
  value.add(value);

  assert.deepEqual(serializeValue(value), [
    "credential",
    { nested: [1, 2] },
    "[Circular]"
  ]);
});

test("replays actors only after they start, with their actual start time", t => {
  let now = 100;
  t.mock.method(Date, "now", () => now);
  const messages = [];
  let reconnect;
  const inspect = createInspector(
    {
      onConnected: listener => {
        reconnect = listener;
      },
      send: (method, payload) => messages.push({ method, payload })
    },
    createActorRegistry()
  );
  const actor = createActor(
    createMachine({ id: "machine", initial: "idle", states: { idle: {} } }),
    { inspect }
  );

  reconnect();
  assert.deepEqual(messages, []);

  now = 200;
  actor.start();
  assert.equal(messages[0].method, "actor");
  assert.equal(messages[0].payload.startedAt, 200);

  messages.length = 0;
  reconnect();
  assert.equal(messages.length, 1);
  assert.equal(messages[0].payload.sessionId, actor.sessionId);
  assert.equal(messages[0].payload.startedAt, 200);

  actor.stop();
  messages.length = 0;
  reconnect();
  assert.deepEqual(messages, []);
});
