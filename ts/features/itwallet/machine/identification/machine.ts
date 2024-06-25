import { assertEvent, assign, fromPromise, setup } from "xstate5";
import { LocalIdpsFallback } from "../../../../utils/idps";
import { ItwTags } from "../tags";
import { Context, InitialContext } from "./context";
import { Events } from "./events";
import { Output } from "./output";

const notImplemented = () => {
  throw new Error("Not implemented");
};

export const itwIdentificationMachine = setup({
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
        "identification.select-mode": [
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
      initial: "IdpSelection",
      states: {
        IdpSelection: {
          entry: "navigateToIdpSelectionScreen",
          on: {
            "identification.select-spid-idp": {
              target: "IdpIdentification"
            }
          }
        },
        IdpIdentification: {
          tags: [ItwTags.Loading],
          invoke: {
            input: ({ event }) => {
              assertEvent(event, "identification.select-spid-idp");
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
            "identification.input-cie-pin": {
              target: "ReadingCard"
            }
          }
        },
        ReadingCard: {
          entry: "navigateToCieReadScreen",
          invoke: {
            input: ({ event }) => {
              assertEvent(event, "identification.input-cie-pin");
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

export type ItwIdentificationMachine = typeof itwIdentificationMachine;
