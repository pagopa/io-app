import { assign, setup } from "xstate";
import { RemoteEvents } from "./events.ts";
import { Context, InitialContext } from "./context.ts";
import { mapEventToFailure } from "./failure.ts";

export const itwRemoteMachine = setup({
  types: {
    context: {} as Context,
    events: {} as RemoteEvents
  },
  actions: {
    setFailure: assign(({ event }) => ({ failure: mapEventToFailure(event) }))
  },
  actors: {},
  guards: {}
}).createMachine({
  id: "itwRemoteMachine",
  context: { ...InitialContext },
  initial: "Idle",
  states: {
    Idle: {
      description:
        "The machine is in idle, ready to start the remote presentation flow"
    },
    Failure: {
      description: "This state is reached when an error occurs"
    }
  }
});

export type ItwRemoteMachine = typeof itwRemoteMachine;
