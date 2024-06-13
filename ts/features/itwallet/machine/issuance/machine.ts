import { assign, forwardTo, fromPromise, setup } from "xstate5";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { Events as IdentificationEvents } from "../identification/events";
import { itwIdentificationMachine } from "../identification/machine";
import { Tags } from "../tags";
import { Context, InitialContext } from "./context";
import { Events } from "./events";

const notImplemented = () => {
  throw new Error("Not implemented");
};

export const itwIssuanceMachine = setup({
  types: {
    children: {} as {
      identificationMachine: "identificationMachine";
    },
    context: {} as Context,
    events: {} as Events | IdentificationEvents
  },
  actions: {
    storeHardwareKeyTag: (_, _params: { keyTag: string }) => notImplemented(),
    storeEid: notImplemented,
    storeCredential: notImplemented,
    navigateToTosScreen: notImplemented,
    navigateToEidPreviewScreen: notImplemented,
    navigateToEidSuccessScreen: notImplemented,
    navigateToCredentialIdentificationScreen: notImplemented,
    navigateToCredentialPreviewScreen: notImplemented,
    navigateToCredentialSuccessScreen: notImplemented,
    navigateToWallet: notImplemented,
    navigateToFailureScreen: notImplemented,
    closeIssuance: notImplemented,
    requestAssistance: notImplemented
  },
  actors: {
    checkUserOptIn: fromPromise<undefined>(notImplemented),
    registerWalletInstance: fromPromise<string>(notImplemented),
    getWalletAttestation: fromPromise<
      string,
      { hardwareKeyTag: string | undefined }
    >(notImplemented),
    activateWalletAttestation: fromPromise<string>(notImplemented),
    identificationMachine: itwIdentificationMachine,
    requestEid: fromPromise<StoredCredential, string | undefined>(
      notImplemented
    ),
    requestCredential: fromPromise<StoredCredential>(notImplemented)
  },
  guards: {
    hasWalletAttestation: ({ context }) => !!context.walletAttestation,
    hasEid: ({ context }) => !!context.eid
  }
}).createMachine({
  id: "itwIssuanceMachine",
  context: InitialContext,
  initial: "Idle",
  states: {
    Idle: {
      on: {
        start: [
          {
            target: "PreliminaryChecks",
            actions: assign(({ event }) => ({
              credentialType: event.credentialType
            }))
          }
        ]
      }
    },
    PreliminaryChecks: {
      tags: [Tags.Loading],
      description:
        "We check if the user has requested the partecipation and if he has the authorization",
      always: {
        guard: "hasWalletAttestation",
        target: "Identification"
      },
      invoke: {
        src: "checkUserOptIn",
        onDone: {
          target: "WalletInitialization"
        },
        onError: {
          target: "Failure"
        }
      }
    },
    WalletInitialization: {
      tags: [Tags.Loading],
      description: "Wallet instance registration and attestation issuance",
      initial: "WalletInstanceRegistration",
      states: {
        WalletInstanceRegistration: {
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
              target: "WalletAttestationRegistration"
            },
            onError: {
              target: "#itwIssuanceMachine.Failure"
            }
          }
        },
        WalletAttestationRegistration: {
          invoke: {
            src: "getWalletAttestation",
            input: ({ context }) => ({
              hardwareKeyTag: context.hardwareKeyTag
            }),
            onDone: {
              actions: assign(({ event }) => ({
                walletAttestation: event.output
              })),
              target: "#itwIssuanceMachine.TosAcceptance"
            },
            onError: {
              target: "#itwIssuanceMachine.Failure"
            }
          }
        }
      }
    },
    TosAcceptance: {
      entry: "navigateToTosScreen",
      on: {
        "accept-tos": "Identification"
      }
    },
    Identification: {
      description: "User identification flow, necessary for the eID issuance",
      always: {
        guard: "hasEid",
        target: "CredentialIssuance"
      },
      invoke: {
        id: "identificationMachine",
        src: "identificationMachine",
        systemId: "identificationMachine",
        onDone: {
          actions: assign(({ event }) => ({
            userToken: event.output.token
          })),
          target: "#itwIssuanceMachine.EidIssuance"
        },
        onError: {
          target: "#itwIssuanceMachine.Failure"
        }
      },
      on: {
        back: {
          target: "TosAcceptance"
        },
        "identification.*": {
          actions: forwardTo("identificationMachine")
        }
      }
    },
    EidIssuance: {
      entry: "navigateToEidPreviewScreen",
      initial: "RequestingEid",
      states: {
        RequestingEid: {
          tags: [Tags.Loading],
          invoke: {
            src: "requestEid",
            input: ({ context }) => context.userToken,
            onDone: {
              actions: assign(({ event }) => ({ eid: event.output })),
              target: "#itwIssuanceMachine.EidIssuance.DisplayingEidPreview"
            },
            onError: {
              target: "#itwIssuanceMachine.Failure"
            }
          }
        },
        DisplayingEidPreview: {
          on: {
            "add-to-wallet": {
              actions: "storeEid",
              target: "DisplayingEidSuccess"
            },
            close: {
              actions: "closeIssuance"
            }
          }
        },
        DisplayingEidSuccess: {
          entry: "navigateToEidSuccessScreen",
          on: {
            next: {
              target: "#itwIssuanceMachine.CredentialIssuance"
            },
            close: {
              actions: "closeIssuance"
            }
          }
        }
      }
    },
    CredentialIssuance: {
      initial: "IdentityCheck",
      states: {
        IdentityCheck: {
          entry: "navigateToCredentialIdentificationScreen",
          on: {
            "confirm-identity": {
              target: "RequestingCredential"
            },
            close: {
              actions: "closeIssuance"
            }
          }
        },
        RequestingCredential: {
          tags: [Tags.Loading],
          invoke: {
            src: "requestCredential",
            onDone: {
              actions: assign(({ event }) => ({
                credential: event.output
              })),
              target: "DisplayingCredentialPreview"
            },
            onError: {
              target: "#itwIssuanceMachine.Failure"
            }
          }
        },
        DisplayingCredentialPreview: {
          entry: "navigateToCredentialPreviewScreen",
          on: {
            "add-to-wallet": {
              actions: "storeCredential",
              target: "DisplayingCredentialSuccess"
            },
            close: {
              actions: "closeIssuance"
            }
          }
        },
        DisplayingCredentialSuccess: {
          entry: "navigateToCredentialSuccessScreen",
          on: {
            "go-to-wallet": {
              actions: "navigateToWallet"
            },
            next: {
              actions: "closeIssuance"
            }
          }
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
        }
      }
    }
  }
});
