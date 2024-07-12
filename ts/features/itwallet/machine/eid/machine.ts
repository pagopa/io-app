import { assign, fromPromise, setup } from "xstate5";
import { Errors } from "@pagopa/io-react-native-wallet";
import { pipe } from "fp-ts/lib/function";
import * as J from "fp-ts/lib/Json";
import * as E from "fp-ts/lib/Either";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { ItwTags } from "../tags";
import { Context, InitialContext } from "./context";
import { EidIssuanceEvents } from "./events";
import { type RequestEidActorParams } from "./actors";
import { IssuanceFailureType, NativeAuthSessionClosed } from "./failure";

const notImplemented = () => {
  throw new Error("Not implemented");
};

export const itwEidIssuanceMachine = setup({
  types: {
    context: {} as Context,
    events: {} as EidIssuanceEvents
  },
  actions: {
    navigateToTosScreen: notImplemented,
    navigateToIdentificationModeScreen: notImplemented,
    navigateToIdpSelectionScreen: notImplemented,
    navigateToEidRequestScreen: notImplemented,
    navigateToEidPreviewScreen: notImplemented,
    navigateToSuccessScreen: notImplemented,
    navigateToFailureScreen: notImplemented,
    navigateToWallet: notImplemented,
    navigateToCredentialCatalog: notImplemented,
    storeIntegrityKeyTag: (_ctx, _params: { keyTag: string }) =>
      notImplemented(),
    storeEidCredential: notImplemented,
    closeIssuance: notImplemented,
    requestAssistance: notImplemented,
    setWalletInstanceToOperational: notImplemented,
    setWalletInstanceToValid: notImplemented
  },
  actors: {
    createWalletInstance: fromPromise<string>(notImplemented),
    requestEid: fromPromise<StoredCredential, RequestEidActorParams>(
      notImplemented
    )
  },
  guards: {
    isNativeAuthSessionClosed: ({ event }) => {
      if (
        "error" in event &&
        event.error instanceof Errors.AuthorizationError
      ) {
        return pipe(
          event.error.message,
          J.parse,
          E.map(NativeAuthSessionClosed.is),
          E.getOrElse(() => false)
        );
      }
      return false;
    }
  }
}).createMachine({
  id: "itwEidIssuanceMachine",
  context: InitialContext,
  initial: "Idle",
  states: {
    Idle: {
      entry: assign(() => InitialContext),
      description: "The machine is in idle, ready to start the issuance flow",
      on: {
        start: {
          target: "TosAcceptance"
        }
      }
    },
    TosAcceptance: {
      description:
        "Display of the ToS to the user who must accept in order to proceed with the issuance of the eID",
      entry: "navigateToTosScreen",
      on: {
        "accept-tos": [
          {
            guard: ({ context }) => !context.integrityKeyTag,
            target: "WalletInstanceCreation"
          },
          {
            target: "UserIdentification"
          }
        ]
      }
    },
    WalletInstanceCreation: {
      description:
        "This state generates the integrity hardware key and registers the wallet instance. The generated integrity hardware key is then stored and persisted to the redux store.",
      tags: [ItwTags.Loading],
      invoke: {
        src: "createWalletInstance",
        onDone: {
          actions: [
            assign(({ event }) => ({
              integrityKeyTag: event.output
            })),
            {
              type: "storeIntegrityKeyTag",
              params: ({ event }) => ({ keyTag: event.output })
            }
          ],
          target: "UserIdentification"
        },
        onError: {
          actions: assign(() => ({
            failure: IssuanceFailureType.UNSUPPORTED_DEVICE
          })),
          target: "#itwEidIssuanceMachine.Failure"
        }
      }
    },
    UserIdentification: {
      description:
        "User identification flow. Once we get the user token we can continue to the eID issuance",
      initial: "ModeSelection",
      states: {
        ModeSelection: {
          entry: "navigateToIdentificationModeScreen",
          on: {
            "select-identification-mode": [
              {
                guard: ({ event }) => event.mode === "spid",
                target: "Spid"
              },
              {
                guard: ({ event }) => event.mode === "ciePin",
                target: "CiePin"
              },
              {
                guard: ({ event }) => event.mode === "cieId",
                actions: assign(() => ({ identification: { mode: "cieId" } })),
                target: "#itwEidIssuanceMachine.UserIdentification.Completed"
              }
            ],
            back: "#itwEidIssuanceMachine.TosAcceptance"
          }
        },
        Spid: {
          entry: "navigateToIdpSelectionScreen",
          on: {
            "select-spid-idp": {
              target: "#itwEidIssuanceMachine.UserIdentification.Completed",
              actions: assign(({ event }) => ({
                identification: { mode: "spid", idpId: event.idp.id }
              }))
            },
            back: {
              target: "#itwEidIssuanceMachine.UserIdentification.ModeSelection"
            }
          }
        },
        CiePin: {
          // TODO
        },
        Completed: {
          type: "final"
        }
      },
      onDone: {
        target: "Issuance"
      }
    },
    Issuance: {
      entry: "navigateToEidRequestScreen",
      initial: "RequestingEid",
      states: {
        RequestingEid: {
          on: {
            back: { target: "#itwEidIssuanceMachine.UserIdentification" }
          },
          tags: [ItwTags.Loading],
          invoke: {
            src: "requestEid",
            input: ({ context }) => ({
              integrityKeyTag: context.integrityKeyTag,
              identification: context.identification
            }),
            onDone: {
              actions: assign(({ event }) => ({ eid: event.output })),
              target: "#itwEidIssuanceMachine.Issuance.DisplayingPreview"
            },
            onError: [
              {
                guard: "isNativeAuthSessionClosed",
                target: "#itwEidIssuanceMachine.UserIdentification"
              },
              {
                actions: assign(() => ({
                  failure: IssuanceFailureType.GENERIC
                })),
                target: "#itwEidIssuanceMachine.Failure"
              }
            ]
          }
        },
        DisplayingPreview: {
          entry: "navigateToEidPreviewScreen",
          on: {
            "add-to-wallet": {
              actions: ["storeEidCredential", "setWalletInstanceToValid"],
              target: "#itwEidIssuanceMachine.Success"
            },
            close: {
              actions: "closeIssuance"
            }
          }
        }
      }
    },
    Success: {
      entry: "navigateToSuccessScreen",
      on: {
        "add-new-credential": {
          actions: "navigateToCredentialCatalog"
        },
        "go-to-wallet": {
          actions: "navigateToWallet"
        },
        reset: {
          target: "Idle"
        }
      }
    },
    Failure: {
      entry: "navigateToFailureScreen",
      on: {
        close: {
          actions: "closeIssuance"
        },
        "request-assistance": {
          actions: "requestAssistance"
        },
        reset: {
          target: "Idle"
        }
      }
    }
  }
});

export type ItwEidIssuanceMachine = typeof itwEidIssuanceMachine;
