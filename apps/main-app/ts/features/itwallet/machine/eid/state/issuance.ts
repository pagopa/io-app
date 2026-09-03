import { and, assign, or } from "xstate";

import { ItwTags } from "../../tags";
import { IssuanceFailureType } from "../failure";
import { itwEidIssuanceMachineSetup } from "../setup";

/** Obtains, validates, previews, and stores the electronic identity credential. */
export const issuanceState = itwEidIssuanceMachineSetup.createStateConfig({
  entry: "navigateToEidPreviewScreen",
  initial: "RequestingAccessToken",
  states: {
    WaitingForSessionRefresh: {
      tags: [ItwTags.Loading],
      invoke: {
        src: "waitForSessionRefresh"
      },
      on: {
        "session-refresh-complete": { target: "RequestingEid" }
      }
    },
    RequestingAccessToken: {
      tags: [ItwTags.Loading],
      invoke: {
        src: "requestAccessToken",
        input: ({ context }) => ({
          itwVersion: context.itwVersion,
          authenticationContext: context.authenticationContext,
          walletInstanceAttestation: context.walletInstanceAttestation?.jwt
        }),
        onDone: {
          target: "RequestingEid",
          actions: assign(({ event }) => ({ accessToken: event.output }))
        },
        onError: {
          actions: "setFailure",
          target: "#itwEidIssuanceMachine.Failure"
        }
      }
    },
    RequestingEid: {
      tags: [ItwTags.Loading],
      description:
        "Obtain the EID with the WUA if supported. This state is retried when the session expires, so it must contain the minimal retriable logic to obtain the credential",
      invoke: {
        src: "requestEid",
        input: ({ context }) => ({
          itwVersion: context.itwVersion,
          identification: context.identification,
          authenticationContext: context.authenticationContext,
          walletInstanceAttestation: context.walletInstanceAttestation?.jwt,
          level: context.level,
          integrityKeyTag: context.integrityKeyTag,
          accessToken: context.accessToken
        }),
        onDone: {
          actions: assign(({ event }) => ({
            eid: event.output.credential,
            walletUnitAttestations: event.output.walletUnitAttestations
          })),
          target: "ObtainingWuaStatusList"
        },
        onError: [
          {
            guard: "isSessionExpired",
            actions: "handleSessionExpired",
            target: "WaitingForSessionRefresh"
          },
          {
            actions: "setFailure",
            target: "#itwEidIssuanceMachine.Failure"
          }
        ]
      }
    },
    ObtainingWuaStatusList: {
      tags: [ItwTags.Loading],
      invoke: {
        src: "obtainStatusList",
        input: ({ context }) => ({
          itwVersion: context.itwVersion,
          walletUnitAttestations: context.walletUnitAttestations
        }),
        onDone: {
          actions: assign(({ event }) => ({
            walletInstanceStatusList: event.output
          })),
          target: "CheckingIdentityMatch"
        },
        onError: {
          target: "#itwEidIssuanceMachine.Failure",
          actions: "setFailure"
        }
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
          actions: assign({
            failure: {
              type: IssuanceFailureType.NOT_MATCHING_IDENTITY,
              reason: "IT Wallet identity does not match IO identity"
            }
          }),
          target: "#itwEidIssuanceMachine.Failure"
        }
      ]
    },
    DisplayingPreview: {
      on: {
        "add-to-wallet": {
          target: "StoringCredential"
        },
        close: {
          actions: ["closeIssuance"]
        }
      }
    },
    StoringCredential: {
      description:
        "This state stores the obtained credential in the secure storage and redux",
      tags: [ItwTags.Loading],
      invoke: {
        src: "storeEidCredential",
        input: ({ context }) => ({
          eid: context.eid,
          walletInstanceStatusList: context.walletInstanceStatusList,
          walletUnitAttestations: context.walletUnitAttestations
        }),
        onDone: {
          target: "Completed",
          actions: ["trackWalletInstanceCreation"]
        },
        onError: {
          target: "#itwEidIssuanceMachine.Failure",
          actions: "setFailure"
        }
      }
    },
    Completed: {
      type: "final"
    }
  },
  onDone: [
    {
      guard: and([
        "hasCredentialsToUpgrade",
        or(["isReissuance", "isUpgrade"])
      ]),
      target: "#itwEidIssuanceMachine.CredentialsUpgrade"
    },
    {
      target: "#itwEidIssuanceMachine.Success"
    }
  ]
} as const);
