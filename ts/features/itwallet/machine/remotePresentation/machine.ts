import { assign, setup } from "xstate";
import { RemotePresentationEvents } from "./events";
import { Context, InitialContext } from "./context";
import { mapEventToFailure } from "./failure";

export const itwRemotePresentationMachine = setup({
    types: {
        context: {} as Context,
        events: {} as RemotePresentationEvents
      },
  actions: {
    setFailure: assign(({ event }) => ({ failure: mapEventToFailure(event) }))
  },
  actors: {},
  guards: {}
}).createMachine({
  id: "itwRemotePresentationMachine",
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

export type ItwRemotePresentationMachine = typeof itwRemotePresentationMachine;
