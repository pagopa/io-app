import { assign, fromPromise, setup, ErrorActorEvent } from "xstate5";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { WalletAttestationResult } from "../../common/utils/itwAttestationUtils";
import { ItwTags } from "../tags";
import { CieAuthContext, Context, InitialContext } from "./context";
import { EidIssuanceEvents } from "./events";
import {
  GetWalletAttestationActorParams,
  StartCieAuthFlowActorParams,
  type RequestEidActorParams
} from "./actors";
import { IssuanceFailureType } from "./failure";

const notImplemented = () => {
  throw new Error("Not implemented");
};

const setFailure =
  (type: IssuanceFailureType) =>
  ({ event }: { event: ErrorActorEvent }): Partial<Context> => ({
    failure: { type, reason: event.error }
  });

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
    navigateToCiePinScreen: notImplemented,
    navigateToCieReadCardScreen: notImplemented,
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
    getWalletAttestation: fromPromise<
      WalletAttestationResult,
      GetWalletAttestationActorParams
    >(notImplemented),
    requestEid: fromPromise<StoredCredential, RequestEidActorParams>(
      notImplemented
    ),
    startCieAuthFlow: fromPromise<CieAuthContext, StartCieAuthFlowActorParams>(
      notImplemented
    )
  },
  guards: {
    isNativeAuthSessionClosed: notImplemented,
    issuedEidMatchesAuthenticatedUser: notImplemented
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
            guard: ({ context }) => !context.walletAttestationContext,
            target: "WalletInstanceAttestationObtainment"
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
            },
            { type: "setWalletInstanceToOperational" }
          ],
          target: "WalletInstanceAttestationObtainment"
        },
        onError: {
          actions: assign(setFailure(IssuanceFailureType.UNSUPPORTED_DEVICE)),
          target: "#itwEidIssuanceMachine.Failure"
        }
      }
    },
    WalletInstanceAttestationObtainment: {
      description:
        "This state obtains the wallet instance attestation and stores it in the context for later use in the issuance flow.",
      tags: [ItwTags.Loading],
      invoke: {
        src: "getWalletAttestation",
        input: ({ context }) => ({ integrityKeyTag: context.integrityKeyTag }),
        onDone: {
          actions: assign(({ event }) => ({
            walletAttestationContext: event.output
          })),
          target: "UserIdentification"
        },
        onError: {
          actions: assign(setFailure(IssuanceFailureType.UNSUPPORTED_DEVICE)),
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
          entry: "navigateToCiePinScreen",
          on: {
            "cie-pin-entered": {
              actions: assign(({ event }) => ({
                identification: { mode: "ciePin", pin: event.pin }
              })),
              target: "StartingCieAuthFlow"
            },
            back: {
              target: "ModeSelection"
            }
          }
        },
        StartingCieAuthFlow: {
          description:
            "Start the preliminary phase of the CIE identification flow.",
          tags: [ItwTags.Loading],
          invoke: {
            src: "startCieAuthFlow",
            input: ({ context }) => ({
              walletAttestationContext: context.walletAttestationContext
            }),
            onDone: {
              actions: assign(({ event }) => ({
                cieAuthContext: event.output
              })),
              target: "ReadingCieCard"
            },
            onError: {
              actions: assign(setFailure(IssuanceFailureType.GENERIC)),
              target: "#itwEidIssuanceMachine.Failure"
            }
          }
        },
        ReadingCieCard: {
          description:
            "Read the CIE card and get back a url to continue the PID issuing flow.",
          entry: "navigateToCieReadCardScreen",
          on: {
            "cie-identification-completed": {
              target: "#itwEidIssuanceMachine.UserIdentification.Completed",
              actions: assign(({ context, event }) => ({
                cieAuthContext: {
                  ...context.cieAuthContext!,
                  callbackUrl: event.url
                }
              }))
            },
            back: {
              target: "CiePin"
            }
          }
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
              identification: context.identification,
              cieAuthContext: context.cieAuthContext,
              walletAttestationContext: context.walletAttestationContext
            }),
            onDone: {
              actions: assign(({ event }) => ({ eid: event.output })),
              target: "#itwEidIssuanceMachine.Issuance.CheckingIdentityMatch"
            },
            onError: [
              {
                guard: "isNativeAuthSessionClosed",
                target: "#itwEidIssuanceMachine.UserIdentification"
              },
              {
                actions: assign(setFailure(IssuanceFailureType.GENERIC)),
                target: "#itwEidIssuanceMachine.Failure"
              }
            ]
          }
        },
        CheckingIdentityMatch: {
          description:
            "Checking whether the issued eID matches the identity of the currently logged-in user.",
          always: [
            {
              guard: "issuedEidMatchesAuthenticatedUser",
              target: "#itwEidIssuanceMachine.Issuance.DisplayingPreview"
            },
            {
              actions: assign(
                setFailure(IssuanceFailureType.NOT_MATCHING_IDENTITY)
              ),
              target: "#itwEidIssuanceMachine.Failure"
            }
          ]
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
