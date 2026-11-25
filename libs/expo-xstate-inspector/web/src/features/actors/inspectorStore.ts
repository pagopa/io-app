import type { ActorEntry, InspectedActor } from "../../shared/inspector/types";

import { createActorStore } from "./actorStore";

type InspectorState = {
  children: Array<ActorEntry>;
  disconnected: boolean;
  machines: Array<ActorEntry>;
  selected: InspectedActor | undefined;
  selectedId: string | undefined;
};

export const createInspectorStore = () => {
  const actors = createActorStore();
  const state: { current: InspectorState } = {
    current: {
      children: [],
      disconnected: false,
      machines: [],
      selected: undefined,
      selectedId: undefined
    }
  };
  const listeners = new Set<() => void>();
  const update = (reduce: (current: InspectorState) => InspectorState) => {
    state.current = reduce(state.current);
    listeners.forEach(listener => listener());
  };
  const selection: { pinned: boolean; sessionId: string | undefined } = {
    sessionId: undefined,
    pinned: false
  };
  const publish = () =>
    update(current => ({
      ...current,
      children:
        selection.sessionId === undefined
          ? []
          : actors.childrenOf(selection.sessionId),
      machines: actors.machines(),
      selected: actors.get(selection.sessionId),
      selectedId: selection.sessionId
    }));

  return {
    getSnapshot: () => state.current,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    handleDisconnect: () =>
      update(current => ({ ...current, disconnected: true })),
    handleMessage: (method: string, payload: unknown) => {
      if (!actors.apply(method, payload)) {
        return;
      }
      if (
        method === "actor" &&
        !selection.pinned &&
        actors.isMachine(payload.sessionId)
      ) {
        selection.sessionId = payload.sessionId;
      }
      publish();
    },
    select: (sessionId: string) => {
      selection.pinned = true;
      selection.sessionId = sessionId;
      publish();
    }
  };
};
