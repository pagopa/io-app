import { assertEvent, assign, fromPromise, setup } from "xstate5";
import { LocalIdpsFallback } from "../../../../utils/idps";
import { Context, InitialContext } from "./context";
import { Events } from "./events";
import { Output } from "./output";

const notImplemented = () => {
  throw new Error();
};

export const identificationMachine = setup({
  types: {
    output: {} as Output,
    context: {} as Context,
    events: {} as Events
  },
  actors: {
    showSpidIdentificationWebView: fromPromise<string, LocalIdpsFallback>(
      notImplemented
    ),
    showCieIdWebView: fromPromise<string>(notImplemented),
    showCiePinWebView: fromPromise<string, string>(notImplemented),
    readCieCard: fromPromise<string, string>(notImplemented)
  },
  actions: {
    navigateToIdentificationModeScreen: notImplemented,
    navigateToIdpSelectionScreen: notImplemented,
    navigateToCiePinInputScreen: notImplemented,
    navigateToCieReadScreen: notImplemented,
    navigateToCieFailureScreen: notImplemented
  }
}).createMachine({
  id: "itwIdentificationMachine",
  initial: "ModeSelection",
  context: InitialContext,
  states: {
    ModeSelection: {
      entry: "navigateToIdentificationModeScreen",
      on: {
        "select-mode": [
          {
            guard: ({ event }) => event.mode === 0,
            target: "Spid"
          },
          {
            guard: ({ event }) => event.mode === 1,
            target: "CiePin"
          },
          {
            guard: ({ event }) => event.mode === 2,
            target: "CieId"
          }
        ]
      }
    },
    Spid: {
      states: {
        IdpSelection: {
          entry: "navigateToIdpSelectionScreen",
          on: {
            "select-spid-idp": {
              target: "IdpIdentification"
            }
          }
        },
        IdpIdentification: {
          invoke: {
            input: ({ event }) => {
              assertEvent(event, "select-spid-idp");
              return event.idp;
            },
            src: "showSpidIdentificationWebView",
            onDone: {
              actions: assign(({ event }) => ({ token: event.output })),
              target: "#itwIdentificationMachine.Completed"
            }
          }
        }
      }
    },
    CiePin: {
      initial: "RequestingPin",
      states: {
        RequestingPin: {
          entry: "navigateToCiePinInputScreen",
          on: {
            "input-cie-pin": {
              target: "ReadingCard"
            }
          }
        },
        ReadingCard: {
          entry: "navigateToCieReadScreen",
          invoke: {
            input: ({ event }) => {
              assertEvent(event, "input-cie-pin");
              return event.pin;
            },
            src: "readCieCard",
            onDone: {
              target: "RequestingDataAccess"
            },
            onError: {
              target: "Failure"
            }
          }
        },
        RequestingDataAccess: {
          invoke: {
            input: () => "",
            src: "showCiePinWebView",
            onDone: {
              actions: assign(({ event }) => ({ token: event.output })),
              target: "#itwIdentificationMachine.Completed"
            }
          }
        },
        Failure: {
          entry: "navigateToCieFailureScreen"
        }
      }
    },
    CieId: {
      invoke: {
        src: "showCieIdWebView",
        onDone: {
          actions: assign(({ event }) => ({ token: event.output })),
          target: "#itwIdentificationMachine.Completed"
        }
      }
    },
    Completed: {
      type: "final"
    }
  },
  output: ({ context }) => context
});
