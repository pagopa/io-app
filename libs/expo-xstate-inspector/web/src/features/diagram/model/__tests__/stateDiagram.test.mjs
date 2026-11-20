import assert from "node:assert/strict";
import { test } from "node:test";

import { buildStateDiagram } from "../stateDiagram.ts";
import { transitionKey } from "../../../../shared/inspector/transitionKeys.ts";

void test("draws and identifies transitions from the machine root", () => {
  const { code, edgeKeys } = buildStateDiagram({
    initial: "idle",
    on: { reset: { target: ".idle" } },
    states: { idle: {}, running: {} }
  });

  assert.match(code, /machine --> s_idle : reset/);
  assert.equal(edgeKeys[1], transitionKey([], ["idle"], "reset"));
});

void test("draws transitions to the machine without using ELK's reserved root id", () => {
  const { code, edgeKeys } = buildStateDiagram({
    id: "issuance",
    initial: "idle",
    states: { idle: { on: { restart: "#issuance" } } }
  });

  assert.match(code, /s_idle --> machine : restart/);
  assert.equal(edgeKeys[1], transitionKey(["idle"], [], "restart"));
});

void test("keeps diagram labels for each kind of transition", () => {
  const { code } = buildStateDiagram({
    states: {
      idle: {
        on: { submit: { guard: "canSubmit", target: "done" } },
        after: { 1000: "done" },
        always: "done",
        onDone: "done",
        invoke: {
          src: "loadData",
          onDone: "done",
          onError: "done",
          onSnapshot: "done"
        }
      },
      done: {}
    }
  });

  for (const label of [
    "submit [canSubmit]",
    "after 1000",
    "always",
    "onDone",
    "done loadData",
    "error loadData",
    "snapshot loadData"
  ]) {
    assert.ok(code.includes(`s_idle --> s_done : ${label}`), label);
  }
});
