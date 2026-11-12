import assert from "node:assert/strict";
import { test } from "node:test";

import { buildStateDiagram } from "../../../scripts/builders/stateDiagram.js";
import { transitionKey } from "../../../scripts/utils/transitionKeys.js";

test("draws and identifies transitions from the machine root", () => {
  const { code, edgeKeys } = buildStateDiagram({
    initial: "idle",
    on: { reset: { target: ".idle" } },
    states: { idle: {}, running: {} }
  });

  assert.match(code, /root --> s_idle : reset/);
  assert.equal(edgeKeys[1], transitionKey([], ["idle"], "reset"));
});
