import { differenceInSeconds, isPast } from "date-fns";
import { assign, fromPromise, setup } from "xstate";
import { ItwTags } from "../../machine/tags";
import {
  GetCredentialTrustmarkUrlActorInput,
  GetCredentialTrustmarkUrlActorOutput,
  GetWalletAttestationActorOutput
} from "./actors";
import { Context } from "./context";
import { TrustmarkEvents } from "./events";
import { mapEventToFailure } from "./failure";
import { Input } from "./input";

const notImplemented = () => {
  throw new Error("Not implemented");
};

export const itwTrustmarkMachine = setup({
  types: {
    context: {} as Context,
    input: {} as Input,
    events: {} as TrustmarkEvents
  },
  actions: {
    onInit: notImplemented,
    handleSessionExpired: notImplemented,
    updateExpirationSeconds: assign(({ context }) => ({
      expirationSeconds: context.expirationDate
        ? differenceInSeconds(context.expirationDate, new Date())
        : undefined
    })),
    resetTrustmark: assign({
      trustmarkUrl: undefined,
      expirationDate: undefined,
      expirationSeconds: undefined
    }),
    showFailureToast: notImplemented,
    setFailure: assign({
      failure: ({ event }) => mapEventToFailure(event)
    })
  },
  actors: {
    getWalletAttestationActor:
      fromPromise<GetWalletAttestationActorOutput>(notImplemented),
    getCredentialTrustmarkActor: fromPromise<
      GetCredentialTrustmarkUrlActorOutput,
      GetCredentialTrustmarkUrlActorInput
    >(notImplemented)
  },
  guards: {
    isTrustmarkExpired: ({ context }) =>
      context.expirationDate ? isPast(context.expirationDate) : true,
    isSessionExpired: notImplemented,
    hasValidWalletInstanceAttestation: notImplemented
  }
}).createMachine({
  id: "itwTrustmarkMachine",
  context: ({ input }) => ({
    credentialType: input.credentialType
  }),
  entry: "onInit",
  initial: "CheckingWalletInstanceAttestation",
  states: {
    CheckingWalletInstanceAttestation: {
      tags: [ItwTags.Loading],
      description:
        "This is a state with the only purpose of checking the WIA and decide weather to get a new one or not",
      always: [
        {
          guard: "hasValidWalletInstanceAttestation",
          target: "RefreshingTrustmark"
        },
        {
          target: "ObtainingWalletInstanceAttestation"
        }
      ]
    },
    ObtainingWalletInstanceAttestation: {
      description:
        "This state obtains the wallet instance attestation and stores it in the context for later use in the issuance flow.",
      tags: [ItwTags.Loading],
      invoke: {
        src: "getWalletAttestationActor",
        onDone: {
          target: "RefreshingTrustmark",
          actions: [
            assign(({ event }) => ({
              walletInstanceAttestation: event.output
            }))
          ]
        },
        onError: [
          {
            guard: "isSessionExpired",
            actions: "handleSessionExpired"
          },
          {
            target: "Failure",
            actions: "setFailure"
          }
        ]
      }
    },
    RefreshingTrustmark: {
      description:
        "This state obtains the trustmark url and stores it in the context for later use in the displaying flow.",
      tags: [ItwTags.Loading],
      invoke: {
        src: "getCredentialTrustmarkActor",
        input: ({ context }) => ({
          credential: context.credential,
          walletInstanceAttestation: context.walletInstanceAttestation
        }),
        onDone: {
          target: "DisplayingTrustmark",
          actions: [
            assign(({ event }) => ({
              trustmarkUrl: event.output.url,
              expirationDate: new Date(event.output.expirationTime * 1000)
            })),
            "updateExpirationSeconds"
          ]
        },
        onError: {
          target: "Failure",
          actions: "setFailure"
        }
      }
    },
    DisplayingTrustmark: {
      description:
        "This state displays the trustmark QR Code and checks if it has expired or not.",
      initial: "Idle",
      states: {
        Idle: {
          after: {
            1000: {
              target: "Checking"
            }
          }
        },
        Checking: {
          entry: "updateExpirationSeconds",
          always: [
            {
              guard: "isTrustmarkExpired",
              actions: "resetTrustmark",
              target: "#itwTrustmarkMachine.CheckingWalletInstanceAttestation"
            },
            {
              target: "Idle"
            }
          ]
        }
      }
    },
    Failure: {
      description: "This state is reached when an error occurs",
      entry: "showFailureToast",
      on: {
        retry: {
          target: "RefreshingTrustmark"
        }
      }
    }
  }
});

export type ItwTrustmarkMachine = typeof itwTrustmarkMachine;
