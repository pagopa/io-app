import { assign, fromPromise, not, or, setup } from "xstate";
import { assert } from "../../../../utils/assert";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { ItwTags } from "../tags";
import {
  GetWalletAttestationActorParams,
  type RequestEidActorParams,
  StartCieAuthFlowActorParams
} from "./actors";
import { CieAuthContext, Context, InitialContext } from "./context";
import { EidIssuanceEvents } from "./events";
import { IssuanceFailureType, mapEventToFailure } from "./failure";

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
    navigateToIpzsPrivacyScreen: notImplemented,
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
    navigateToWalletRevocationScreen: notImplemented,
    storeIntegrityKeyTag: notImplemented,
    storeWalletInstanceAttestation: notImplemented,
    storeEidCredential: notImplemented,
    closeIssuance: notImplemented,
    setWalletInstanceToOperational: notImplemented,
    setWalletInstanceToValid: notImplemented,
    handleSessionExpired: notImplemented,
    abortIdentification: notImplemented,
    resetWalletInstance: notImplemented,
    trackWalletInstanceCreation: notImplemented,
    trackWalletInstanceRevocation: notImplemented,
    setFailure: assign(({ event }) => ({ failure: mapEventToFailure(event) })),
    onInit: notImplemented
  },
  actors: {
    createWalletInstance: fromPromise<string>(notImplemented),
    revokeWalletInstance: fromPromise<void>(notImplemented),
    getWalletAttestation: fromPromise<string, GetWalletAttestationActorParams>(
      notImplemented
    ),
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
    isSessionExpired: notImplemented,
    isOperationAborted: notImplemented,
    hasValidWalletInstanceAttestation: notImplemented
  }
}).createMachine({
  id: "itwEidIssuanceMachine",
  context: { ...InitialContext },
  initial: "Idle",
  entry: "onInit",
  states: {
    Idle: {
      description: "The machine is in idle, ready to start the issuance flow",
      on: {
        start: {
          target: "TosAcceptance"
        },
        close: {
          actions: "closeIssuance"
        },
        "revoke-wallet-instance": {
          target: "WalletInstanceRevocation"
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
            guard: not("hasValidWalletInstanceAttestation"),
            target: "WalletInstanceAttestationObtainment"
          },
          {
            target: "IpzsPrivacyAcceptance"
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
            { type: "storeIntegrityKeyTag" },
            { type: "setWalletInstanceToOperational" }
          ],
          target: "WalletInstanceAttestationObtainment"
        },
        onError: [
          {
            guard: "isSessionExpired",
            actions: "handleSessionExpired",
            target: "#itwEidIssuanceMachine.TosAcceptance"
          },
          {
            actions: "setFailure",
            target: "#itwEidIssuanceMachine.Failure"
          }
        ]
      }
    },
    WalletInstanceRevocation: {
      tags: [ItwTags.Loading],
      invoke: {
        src: "revokeWalletInstance",
        onDone: {
          actions: [
            "resetWalletInstance",
            "closeIssuance",
            "trackWalletInstanceRevocation"
          ]
        },
        onError: [
          {
            guard: "isSessionExpired",
            actions: "handleSessionExpired",
            target: "#itwEidIssuanceMachine.Idle"
          },
          {
            actions: assign(
              setFailure(IssuanceFailureType.WALLET_REVOCATION_GENERIC)
            ),
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
          actions: [
            assign(({ event }) => ({
              walletInstanceAttestation: event.output
            })),
            { type: "storeWalletInstanceAttestation" }
          ],
          target: "IpzsPrivacyAcceptance"
        },
        onError: [
          {
            guard: "isSessionExpired",
            actions: "handleSessionExpired",
            target: "#itwEidIssuanceMachine.TosAcceptance"
          },
          {
            actions: "setFailure",
            target: "#itwEidIssuanceMachine.Failure"
          }
        ]
      }
    },
    IpzsPrivacyAcceptance: {
      description:
        "This state handles the acceptance of the IPZS privacy policy",
      entry: "navigateToIpzsPrivacyScreen",
      on: {
        "accept-ipzs-privacy": {
          target: "UserIdentification"
        },
        error: {
          target: "#itwEidIssuanceMachine.Failure"
        },
        back: "#itwEidIssuanceMachine.TosAcceptance"
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
                actions: assign(() => ({
                  identification: {
                    mode: "cieId",
                    abortController: new AbortController()
                  }
                })),
                target: "#itwEidIssuanceMachine.UserIdentification.Completed"
              }
            ],
            back: "#itwEidIssuanceMachine.IpzsPrivacyAcceptance"
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
                  walletInstanceAttestation: context.walletInstanceAttestation
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
          on: {
            abort: { actions: "abortIdentification" }
          },
          tags: [ItwTags.Loading],
          invoke: {
            src: "requestEid",
            input: ({ context }) => ({
              identification: context.identification,
              cieAuthContext: context.cieAuthContext,
              walletInstanceAttestation: context.walletInstanceAttestation
            }),
            onDone: {
              actions: assign(({ event }) => ({ eid: event.output })),
              target: "CheckingIdentityMatch"
            },
            onError: [
              {
                guard: or(["isNativeAuthSessionClosed", "isOperationAborted"]),
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
                "trackWalletInstanceCreation"
              ],
              target: "#itwEidIssuanceMachine.Success"
            },
            close: {
              actions: ["closeIssuance"]
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
          actions: ["closeIssuance"]
        },
        retry: {
          target: "UserIdentification"
        },
        reset: {
          target: "Idle"
        },
        "revoke-wallet-instance": {
          actions: "navigateToWalletRevocationScreen",
          target: "WalletInstanceRevocation"
        }
      }
    }
  }
});

export type ItwEidIssuanceMachine = typeof itwEidIssuanceMachine;
