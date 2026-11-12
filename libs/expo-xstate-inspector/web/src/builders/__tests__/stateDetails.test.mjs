import assert from "node:assert/strict";
import { test } from "node:test";

import { describeState } from "../../../scripts/builders/stateDetails.js";

test("describes the actions, invoked actors and transitions of a state", () => {
  assert.deepEqual(
    describeState({
      entry: ["track", { type: "assign" }, { type: "" }],
      exit: "cleanup",
      initial: { target: "waiting", actions: "initializeChild" },
      invoke: [
        {
          id: "request",
          src: "loadData",
          onDone: { actions: "save", target: "done" },
          onError: { actions: "report" },
          onSnapshot: { actions: "observe" }
        },
        { src: { config: {} } }
      ],
      on: {
        retry: [
          { guard: "canRetry", actions: ["reset", "log"], target: "#m.a" },
          "idle"
        ]
      },
      after: { 1000: { actions: "timeout" } }
    }),
    [
      {
        title: "Entry actions",
        rows: ["track", "assign", "(anonymous)"]
      },
      { title: "Exit actions", rows: ["cleanup"] },
      { title: "Initial actions", rows: ["initializeChild"] },
      {
        title: "Invoked actors",
        rows: ["loadData (request)", "(inline actor)"]
      },
      {
        title: "Transitions",
        rows: [
          "retry [canRetry] → #m.a / reset, log",
          "retry → idle",
          "after 1000 / timeout",
          "done loadData → done / save",
          "error loadData / report",
          "snapshot loadData / observe"
        ]
      }
    ]
  );
});

test("leaves out empty sections", () => {
  assert.deepEqual(describeState({}), []);
});
