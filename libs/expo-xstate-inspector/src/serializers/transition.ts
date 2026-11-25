import type { AnyTransitionDefinition } from "xstate";

import type { SerializedTransition } from "../types/messages";

export const serializeTransition = ({
  eventType,
  source,
  target
}: AnyTransitionDefinition): SerializedTransition => ({
  eventType,
  source: source.path,
  targets: (target ?? []).map(node => node.path)
});
