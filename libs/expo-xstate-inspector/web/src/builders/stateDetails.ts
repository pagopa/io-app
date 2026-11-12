import type { ConfigRef, StateNodeConfig } from "../types/inspector.js";

import { nameOf, toArray } from "../utils/stateNodes.js";
import { labelledTransitions } from "./transitionEdges.js";

export type StateDetailsSection = { rows: Array<string>; title: string };

const names = (refs: Array<ConfigRef> | ConfigRef | undefined) =>
  toArray(refs).map(ref => nameOf(ref) || "(anonymous)");

const transitionRows = (node: StateNodeConfig) =>
  labelledTransitions(node).flatMap(([label, , transitions]) =>
    toArray(transitions).map(transition => {
      const { target, guard, actions } =
        typeof transition === "string"
          ? { target: transition, guard: undefined, actions: undefined }
          : transition;
      const targets = toArray(target);
      const actionNames = names(actions);
      return [
        label,
        guard ? ` [${nameOf(guard) || "(anonymous)"}]` : "",
        targets.length ? ` → ${targets.join(", ")}` : "",
        actionNames.length ? ` / ${actionNames.join(", ")}` : ""
      ].join("");
    })
  );

/** Groups the configured actions, invoked actors and transitions of `node`. */
export const describeState = (
  node: StateNodeConfig
): Array<StateDetailsSection> =>
  [
    { title: "Entry actions", rows: names(node.entry) },
    { title: "Exit actions", rows: names(node.exit) },
    {
      title: "Initial actions",
      rows: names(
        typeof node.initial === "object" ? node.initial.actions : undefined
      )
    },
    {
      title: "Invoked actors",
      rows: toArray(node.invoke).map(({ id, src }) =>
        [nameOf(src) || "(inline actor)", ...(id ? [`(${id})`] : [])].join(" ")
      )
    },
    { title: "Transitions", rows: transitionRows(node) }
  ].filter(({ rows }) => rows.length > 0);
