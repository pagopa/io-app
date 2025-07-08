import { assign, fromCallback, fromPromise, setup } from "xstate";
import { Context, getInitialContext } from "./context";
import { Input } from "./input";
import { CieEvents } from "./events";
import { StartCieManagerInput } from "./actors";

const notImplemented = () => {
  throw new Error("Not implemented");
};

export const itwCieMachine = setup({
  types: {
    context: {} as Context,
    input: {} as Input,
    events: {} as CieEvents
  },
  actors: {
    startCieManager: fromPromise<void, StartCieManagerInput>(notImplemented),
    cieManagerActor: fromCallback<CieEvents>(notImplemented)
  },
  actions: {
    configureStatusAlerts: notImplemented,
    updateStatusAlert: notImplemented,
    setFailure: notImplemented
  }
}).createMachine({
  id: "itwCieMachine",
  context: ({ input }) => getInitialContext(input),
  initial: "Init",
  invoke: {
    src: "cieManagerActor",
    id: "cieManagerActor"
  },
  states: {
    Init: {
      entry: "configureStatusAlerts",
      always: "ReadingCard"
    },
    ReadingCard: {
      invoke: {
        src: "startCieManager",
        id: "startCieManager",
        input: ({ context }) => ({
          pin: context.pin,
          authenticationUrl: context.authenticationUrl
        }),
        onDone: {
          target: "ReadingCard"
        },
        onError: {
          target: "Failure",
          actions: "setFailure"
        }
      },
      on: {
        "cie-read-event": {
          actions: [
            assign(({ event }) => ({
              readProgress: event.progress
            })),
            "updateStatusAlert"
          ]
        },
        "cie-read-error": {
          target: "Failure",
          actions: "setFailure"
        },
        "cie-read-success": {
          target: "Authorizing",
          actions: assign(({ event }) => ({
            authorizationUrl: event.authorizationUrl
          }))
        }
      }
    },
    Authorizing: {},
    Completed: {
      type: "final"
    },
    Failure: {
      type: "final"
    }
  }
});

export type ItwCieMachine = typeof itwCieMachine;
