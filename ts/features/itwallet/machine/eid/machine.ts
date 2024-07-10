import { assertEvent, assign, fromPromise, setup } from "xstate5";
import { LocalIdpsFallback } from "../../../../utils/idps";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { ItwTags } from "../tags";
import { Context, InitialContext } from "./context";
import { EidIssuanceEvents } from "./events";

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
    navigateToEidPreviewScreen: notImplemented,
    navigateToSuccessScreen: notImplemented,
    navigateToFailureScreen: notImplemented,
    navigateToWallet: notImplemented,
    navigateToCredentialCatalog: notImplemented,
    storeWalletAttestation: notImplemented,
    storeEidCredential: notImplemented,
    closeIssuance: notImplemented,
    requestAssistance: notImplemented
  },
  actors: {
    registerWalletInstance: fromPromise<string>(notImplemented),
    getWalletAttestation: fromPromise<
      string,
      { hardwareKeyTag: string | undefined }
    >(notImplemented),
    showSpidIdentificationWebView: fromPromise<string, LocalIdpsFallback>(
      notImplemented
    ),
    requestEid: fromPromise<StoredCredential, string | undefined>(
      notImplemented
    )
  },
  guards: {}
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
        "accept-tos": {
          target: "WalletInitialization"
        }
      }
    },
    WalletInitialization: {
      tags: [ItwTags.Loading],
      description: "Wallet instance registration and attestation retrieval",
      initial: "WalletInstanceRegistration",
      states: {
        WalletInstanceRegistration: {
          description:
            "This state generates the integry hardware key and registers the wallet instance. The generated integrity hardware key is then stored and persisted to the redux store.",
          invoke: {
            src: "registerWalletInstance",
            onDone: {
              actions: [
                assign(({ event }) => ({
                  hardwareKeyTag: event.output
                })),
                ({ event }) => ({
                  type: "storeHardwareKeyTag",
                  params: { keyTag: event.output }
                })
              ],
              target: "WalletAttestationRetrieval"
            },
            onError: {
              target: "#itwEidIssuanceMachine.Failure"
            }
          }
        },
        WalletAttestationRetrieval: {
          description: "Obtainment of the wallet attestation",
          invoke: {
            src: "getWalletAttestation",
            input: ({ context }) => ({
              hardwareKeyTag: context.hardwareKeyTag
            }),
            onDone: {
              actions: assign(({ event }) => ({
                walletAttestation: event.output
              })),
              target: "#itwEidIssuanceMachine.UserIdentification"
            },
            onError: {
              target: "#itwEidIssuanceMachine.Failure"
            }
          }
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
                target: "CieId"
              }
            ],
            back: "#itwEidIssuanceMachine.TosAcceptance"
          }
        },
        Spid: {
          initial: "IdpSelection",
          states: {
            IdpSelection: {
              entry: "navigateToIdpSelectionScreen",
              on: {
                "select-spid-idp": {
                  target: "IdpIdentification"
                },
                back: {
                  target:
                    "#itwEidIssuanceMachine.UserIdentification.ModeSelection"
                }
              }
            },
            IdpIdentification: {
              tags: [ItwTags.Loading],
              invoke: {
                input: ({ event }) => {
                  assertEvent(event, "select-spid-idp");
                  return event.idp;
                },
                src: "showSpidIdentificationWebView",
                onDone: {
                  actions: assign(({ event }) => ({ userToken: event.output })),
                  target: "#itwEidIssuanceMachine.UserIdentification.Completed"
                }
              }
            }
          }
        },
        CiePin: {
          // TODO
        },
        CieId: {
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
      entry: "navigateToEidPreviewScreen",
      initial: "RequestingEid",
      states: {
        RequestingEid: {
          tags: [ItwTags.Loading],
          invoke: {
            src: "requestEid",
            input: ({ context }) => context.userToken,
            onDone: {
              actions: assign(({ event }) => ({ eid: event.output })),
              target: "#itwEidIssuanceMachine.Issuance.DisplayingPreview"
            },
            onError: {
              target: "#itwEidIssuanceMachine.Failure"
            }
          }
        },
        DisplayingPreview: {
          on: {
            "add-to-wallet": {
              actions: "storeEidCredential",
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
