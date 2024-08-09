import { assign, fromPromise, setup } from "xstate5";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { WalletAttestationResult } from "../../common/utils/itwAttestationUtils";
import { assert } from "../../../../utils/assert";
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
  ({ event }: { event: EidIssuanceEvents }): Partial<Context> => ({
    failure: { type, reason: "error" in event ? event.error : undefined }
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
    navigateToEidPreviewScreen: notImplemented,
    navigateToSuccessScreen: notImplemented,
    navigateToFailureScreen: notImplemented,
    navigateToWallet: notImplemented,
    navigateToCredentialCatalog: notImplemented,
    navigateToCiePinScreen: notImplemented,
    navigateToCieReadCardScreen: notImplemented,
    navigateToNfcInstructionsScreen: notImplemented,
    storeIntegrityKeyTag: (_ctx, _params: { keyTag: string }) =>
      notImplemented(),
    storeEidCredential: notImplemented,
    closeIssuance: notImplemented,
    setWalletInstanceToOperational: notImplemented,
    setWalletInstanceToValid: notImplemented,
    disposeWalletAttestation: notImplemented,
    handleSessionExpired: notImplemented
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
    issuedEidMatchesAuthenticatedUser: notImplemented,
    isSessionExpired: notImplemented
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
        onError: [
          {
            guard: "isSessionExpired",
            target: "SessionExpired"
          },
          {
            actions: assign(setFailure(IssuanceFailureType.GENERIC)), // TODO: [SIW-1390] Use unsupported device from io-rn-wallet
            target: "#itwEidIssuanceMachine.Failure"
          }
        ]
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
        onError: [
          {
            guard: "isSessionExpired",
            target: "SessionExpired"
          },
          {
            actions: assign(setFailure(IssuanceFailureType.GENERIC)),
            target: "#itwEidIssuanceMachine.Failure"
          }
        ]
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
              target: "Completed",
              actions: assign(({ event }) => ({
                identification: { mode: "spid", idpId: event.idp.id }
              }))
            },
            back: {
              target: "ModeSelection"
            }
          }
        },
        CiePin: {
          description:
            "This state handles the entire CIE + pin identification flow",
          initial: "InsertingCardPin",
          states: {
            InsertingCardPin: {
              entry: [
                assign(() => ({ cieAuthContext: undefined })), // Reset the CIE context, otherwise retries will use stale data
                { type: "navigateToCiePinScreen" }
              ],
              on: {
                "cie-pin-entered": [
                  {
                    guard: ({ event }) => event.isNfcEnabled,
                    target: "StartingCieAuthFlow",
                    actions: assign(({ event }) => ({
                      identification: { mode: "ciePin", pin: event.pin }
                    }))
                  },
                  {
                    target: "ActivateNfc",
                    actions: assign(({ event }) => ({
                      identification: { mode: "ciePin", pin: event.pin }
                    }))
                  }
                ],
                back: {
                  target:
                    "#itwEidIssuanceMachine.UserIdentification.ModeSelection"
                }
              }
            },
            ActivateNfc: {
              entry: "navigateToNfcInstructionsScreen",
              on: {
                "nfc-enabled": {
                  target: "StartingCieAuthFlow"
                },
                back: {
                  target: "InsertingCardPin"
                }
              }
            },
            StartingCieAuthFlow: {
              description:
                "Start the preliminary phase of the CIE identification flow.",
              entry: "navigateToCieReadCardScreen",
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
                  actions: assign(
                    setFailure(IssuanceFailureType.ISSUER_GENERIC)
                  ),
                  target: "#itwEidIssuanceMachine.Failure"
                }
              },
              back: {
                target: "InsertingCardPin"
              }
            },
            ReadingCieCard: {
              description:
                "Read the CIE card and get back a url to continue the PID issuing flow. This state also handles errors when reading the card.",
              on: {
                "cie-identification-completed": {
                  target: "Completed",
                  actions: assign(({ context, event }) => {
                    assert(
                      context.cieAuthContext,
                      "cieAuthContext must be defined when completing CIE+pin flow"
                    );
                    return {
                      cieAuthContext: {
                        ...context.cieAuthContext,
                        callbackUrl: event.url
                      }
                    };
                  })
                },
                close: {
                  target: "#itwEidIssuanceMachine.UserIdentification"
                },
                back: {
                  target: "InsertingCardPin"
                }
              }
            },
            Completed: {
              type: "final"
            }
          },
          onDone: {
            target: "#itwEidIssuanceMachine.UserIdentification.Completed"
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
      entry: "navigateToEidPreviewScreen",
      initial: "RequestingEid",
      states: {
        RequestingEid: {
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
              target: "CheckingIdentityMatch"
            },
            onError: [
              {
                guard: "isNativeAuthSessionClosed",
                target: "#itwEidIssuanceMachine.UserIdentification"
              },
              {
                actions: assign(setFailure(IssuanceFailureType.ISSUER_GENERIC)),
                target: "#itwEidIssuanceMachine.Failure"
              }
            ]
          }
        },
        CheckingIdentityMatch: {
          tags: [ItwTags.Loading],
          description:
            "Checking whether the issued eID matches the identity of the currently logged-in user.",
          always: [
            {
              guard: "issuedEidMatchesAuthenticatedUser",
              target: "DisplayingPreview"
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
          on: {
            "add-to-wallet": {
              actions: [
                "storeEidCredential",
                "setWalletInstanceToValid",
                "disposeWalletAttestation"
              ],
              target: "#itwEidIssuanceMachine.Success"
            },
            close: {
              actions: ["closeIssuance", "disposeWalletAttestation"]
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
          actions: ["closeIssuance", "disposeWalletAttestation"]
        },
        reset: {
          target: "Idle"
        }
      }
    },
    SessionExpired: {
      entry: ["handleSessionExpired"],
      // Since the refresh token request does not change the current screen, restart the machine
      always: { target: "TosAcceptance" }
    }
  }
});

export type ItwEidIssuanceMachine = typeof itwEidIssuanceMachine;
