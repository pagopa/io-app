import { addSeconds, differenceInSeconds, isPast } from "date-fns";
import { assign, fromPromise, not, setup } from "xstate";
import { ItwTags } from "../../machine/tags";
import { trackItwTrustmarkRenewFailure } from "../../analytics";
import { getMixPanelCredential } from "../../analytics/utils/analyticsUtils";
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

/**
 * Amount in seconds to wait before retrying
 */
const backoffTimeAmounts = [1, 10, 60, 180];

export const itwTrustmarkMachine = setup({
  types: {
    context: {} as Context,
    input: {} as Input,
    events: {} as TrustmarkEvents
  },
  actions: {
    onInit: notImplemented,
    storeWalletInstanceAttestation: notImplemented,
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
    incrementAttempts: assign(({ context }) => {
      const attempts = context.attempts ? context.attempts + 1 : 1;
      const backoffTime = backoffTimeAmounts[attempts - 1] || 180;
      return {
        attempts,
        nextAttemptAt: addSeconds(new Date(), backoffTime)
      };
    }),
    resetAttempts: assign({
      attempts: undefined,
      nextAttemptAt: undefined
    }),
    setFailure: assign({
      failure: ({ event }) => mapEventToFailure(event)
    }),
    showRetryFailureToast: notImplemented,
    trackTrustmarkFailure: ({ context }) => {
      trackItwTrustmarkRenewFailure(
        getMixPanelCredential(context.credentialType, false)
      );
    }
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
    hasValidWalletInstanceAttestation: notImplemented,
    hasBackoffTimePassed: ({ context }) =>
      context.nextAttemptAt ? isPast(context.nextAttemptAt) : true
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
      description: "Checks the WIA and decide wether to get a new one or not",
      always: [
        {
          guard: not("hasValidWalletInstanceAttestation"),
          target: "ObtainingWalletInstanceAttestation"
        },
        {
          target: "RefreshingTrustmark"
        }
      ]
    },
    ObtainingWalletInstanceAttestation: {
      description: "Obtains the WIA and stores it in the context",
      tags: [ItwTags.Loading],
      invoke: {
        src: "getWalletAttestationActor",
        onDone: {
          target: "RefreshingTrustmark",
          actions: [
            assign(({ event }) => ({
              walletInstanceAttestation: event.output
            })),
            "storeWalletInstanceAttestation"
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
      description: "Obtains the Trustmark and stores it to the context",
      tags: [ItwTags.Loading],
      invoke: {
        src: "getCredentialTrustmarkActor",
        input: ({ context }) => ({
          credential: context.credential,
          walletInstanceAttestation: context.walletInstanceAttestation?.jwt
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
      description: "Displays the QR Code and checks if it has expired",
      initial: "Idle",
      entry: "resetAttempts",
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
      entry: ["incrementAttempts", "trackTrustmarkFailure"],
      on: {
        retry: [
          {
            guard: not("hasBackoffTimePassed"),
            actions: "showRetryFailureToast"
          },
          {
            target: "RefreshingTrustmark"
          }
        ]
      }
    }
  }
});

export type ItwTrustmarkMachine = typeof itwTrustmarkMachine;
