import assert from "node:assert/strict";
import { test } from "node:test";
import { and, createActor, createMachine, not, or, stateIn } from "xstate";

import { serializeActor } from "../../../../../../src/serializers/actor.ts";
import { describeState } from "../stateDetails.ts";

const describeSerializedGuard = guard => {
  const actor = createActor(
    createMachine({
      initial: "Idle",
      states: { Idle: {}, EvaluateFlow: { always: { guard } } }
    })
  );
  const { definition } = serializeActor(actor, 0);
  return describeState(definition.states.EvaluateFlow).transitions[0].options[0]
    .guard;
};

void test("shows the conditions inside a serialized composite guard", () => {
  const guard = describeSerializedGuard(
    and([
      ({ context }) => context.mode === "issuance",
      ({ context }) => !context.resolvedCredentialOffer,
      "hasCredentialIntroContent",
      or(["ready", not("expired")]),
      stateIn({ Review: "Editing" })
    ])
  );

  assert.match(guard, /hasCredentialIntroContent/);
  assert.match(guard, /context\.mode/);
  assert.match(guard, /resolvedCredentialOffer/);
  assert.match(guard, /or\(\s*ready,\s*not\(expired\)\s*\)/);
  assert.match(guard, /stateIn\(\{"Review":"Editing"\}\)/);
});

void test("shows the expression of a serialized inline guard", () => {
  const config = { guard: ({ context }) => context.mode === "issuance" };
  assert.match(describeSerializedGuard(config.guard), /context\.mode/);
});

void test("keeps the complete source of inline guards", () => {
  const source = `({ context }) =>
  context.mode === "issuance" && context.isEligible`;
  const { transitions } = describeState({
    always: { guard: { type: "guard", source } }
  });
  assert.equal(transitions[0].options[0].guard, source);
});

void test("identifies inline guards whose source is unavailable", () => {
  const { transitions } = describeState({
    always: { guard: { type: "guard", source: null } }
  });
  assert.equal(
    transitions[0].options[0].guard,
    "(inline guard; source unavailable)"
  );
  assert.equal(
    describeSerializedGuard(Boolean),
    "Boolean (source unavailable)"
  );
});

void test("includes parameters of named guards", () => {
  assert.equal(
    describeSerializedGuard({ type: "hasMinimumAge", params: { minimum: 18 } }),
    'hasMinimumAge({"minimum":18})'
  );
});

void test("handles cycles in composite guards", () => {
  const guard = and([]);
  guard.guards.push(guard);
  assert.equal(describeSerializedGuard(guard), "and([Circular])");
});

void test("describes the initial state and its configured actions", () => {
  const details = describeState({
    entry: ["track", { type: "assign" }, { type: "" }],
    exit: "cleanup",
    initial: { target: "waiting", actions: "initializeChild" }
  });

  assert.deepEqual(details.initial, {
    actions: ["initializeChild"],
    target: "waiting"
  });
  assert.deepEqual(details.entryActions, ["track", "assign", "(anonymous)"]);
  assert.deepEqual(details.exitActions, ["cleanup"]);
  assert.deepEqual(describeState({ initial: "waiting" }).initial, {
    actions: [],
    target: "waiting"
  });
  assert.deepEqual(
    describeState({ initial: { actions: { type: "" } } }).initial,
    { actions: ["(anonymous)"], target: undefined }
  );
});

void test("preserves ordered alternatives, guards, multiple targets and targetless transitions", () => {
  const { transitions } = describeState({
    on: {
      retry: [
        {
          guard: "canRetry",
          actions: ["reset", { type: "" }],
          target: ["#m.a", "#m.b"]
        },
        { guard: { type: "" }, actions: "log" },
        "idle"
      ]
    }
  });

  assert.deepEqual(transitions, [
    {
      trigger: { label: "Event", value: "retry" },
      options: [
        {
          guard: "canRetry",
          targets: ["#m.a", "#m.b"],
          actions: ["reset", "(anonymous)"]
        },
        { guard: "(anonymous)", targets: [], actions: ["log"] },
        { guard: undefined, targets: ["idle"], actions: [] }
      ]
    }
  ]);
});

void test("distinguishes event, delay, automatic and state-completion triggers", () => {
  const { transitions } = describeState({
    on: { "xstate.done.state": "done" },
    after: { 1000: "done", retryDelay: "done" },
    always: "done",
    onDone: "done"
  });

  assert.deepEqual(
    transitions.map(({ trigger }) => trigger),
    [
      { label: "Event", value: "xstate.done.state" },
      { label: "After", value: "1000 ms" },
      { label: "After", value: "retryDelay" },
      { label: "Automatic" },
      { label: "State completes" }
    ]
  );
});

void test("identifies actors and their completion, error and snapshot transitions", () => {
  const { actors, transitions } = describeState({
    invoke: [
      {
        id: "request",
        src: "loadData",
        onDone: { actions: "save", target: "done" },
        onError: { actions: "report" },
        onSnapshot: { actions: "observe" }
      },
      { id: "inline", src: { config: {} }, onDone: { actions: "finish" } }
    ]
  });

  assert.deepEqual(actors, [
    { id: "request", source: "loadData" },
    { id: "inline", source: "(inline actor)" }
  ]);
  assert.deepEqual(
    transitions.map(({ trigger, options }) => ({ trigger, options })),
    [
      {
        trigger: {
          label: "Actor completes",
          value: "loadData",
          actorId: "request"
        },
        options: [{ actions: ["save"], guard: undefined, targets: ["done"] }]
      },
      {
        trigger: {
          label: "Actor fails",
          value: "loadData",
          actorId: "request"
        },
        options: [{ actions: ["report"], guard: undefined, targets: [] }]
      },
      {
        trigger: {
          label: "Actor snapshot",
          value: "loadData",
          actorId: "request"
        },
        options: [{ actions: ["observe"], guard: undefined, targets: [] }]
      },
      {
        trigger: {
          label: "Actor completes",
          value: "(inline actor)",
          actorId: "inline"
        },
        options: [{ actions: ["finish"], guard: undefined, targets: [] }]
      }
    ]
  );
});

void test("leaves empty configuration sections empty", () => {
  assert.deepEqual(describeState({}), {
    actors: [],
    entryActions: [],
    exitActions: [],
    initial: undefined,
    transitions: []
  });
});
