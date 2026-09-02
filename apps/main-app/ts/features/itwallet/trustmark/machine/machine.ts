import { assign, not } from "xstate";

import { ItwTags } from "../../machine/tags";
import { itwTrustmarkMachineSetup } from "./setup";
import { displayingTrustmarkState } from "./state/displayingTrustmark";

export const itwTrustmarkMachine = itwTrustmarkMachineSetup.createMachine({
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
    DisplayingTrustmark: displayingTrustmarkState,
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
