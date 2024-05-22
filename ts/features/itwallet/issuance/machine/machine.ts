import { assign, fromPromise, setup } from "xstate5";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { Context, InitialContext } from "./context";
import { Events } from "./events";
import { Tags } from "./tags";

const notImplemented = () => {
  throw new Error();
};

const identificationMachine = setup({
  types: {
    output: {} as { token: string }
  },
  actions: {
    navigateToIdentificationModeScreen: notImplemented
  }
}).createMachine({
  initial: "ModeSelection",
  states: {
    ModeSelection: {
      entry: "navigateToIdentificationModeScreen",
      on: {
        "select-identification-mode": [
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
        IdpSelection: {}
      }
    },
    CiePin: {},
    CieId: {}
  }
});

export const itwIssuanceMachine = setup({
  types: {
    context: {} as Context,
    events: {} as Events
  },
  actions: {
    storeWalletAttestation: notImplemented,
    navigateToTosScreen: notImplemented,
    navigateToEidPreviewScreen: notImplemented,
    storeEid: notImplemented,
    navigateToEidSuccessScreen: notImplemented,
    closeIssuance: notImplemented
  },
  actors: {
    checkUserOptIn: fromPromise<undefined>(notImplemented),
    issueWalletAttestation: fromPromise<string>(notImplemented),
    activateWalletAttestation: fromPromise<string>(notImplemented),
    identificationMachine,
    requestEid: fromPromise<StoredCredential, string | undefined>(
      notImplemented
    )
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
        start: {
          target: "PreliminaryChecks",
          actions: assign(({ event }) => ({
            credentialType: event.credentialType
          }))
        }
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
      invoke: {
        src: "issueWalletAttestation",
        onDone: {
          target: "TosAcceptance",
          actions: "storeWalletAttestation"
        },
        onError: {
          target: "Failure"
        }
      }
    },
    TosAcceptance: {
      entry: "navigateToTosScreen",
      on: {
        "accept-tos": "WalletActivation"
      }
    },
    WalletActivation: {
      tags: [Tags.Loading]
    },
    Identification: {
      description: "User identification flow, necessary for the eID issuance",
      always: {
        guard: "hasEid",
        target: "CredentialIssuance"
      },
      invoke: {
        src: "identificationMachine",
        onDone: {
          actions: assign(({ event }) => ({
            userToken: event.output.token
          })),
          target: "#itwIssuanceMachine.EidIssuance"
        }
      }
    },
    EidIssuance: {
      entry: "navigateToEidPreviewScreen",
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
      states: {}
    },
    Failure: {},
    Completed: {}
  }
});
