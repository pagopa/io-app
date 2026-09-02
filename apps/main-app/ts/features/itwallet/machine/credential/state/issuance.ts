import { assign } from "xstate";

import { ItwTags } from "../../tags";
import { itwCredentialSetup } from "../setup";

const CREDENTIAL_PREVIEW_LOADING_DELAY_MS = 4000;

/** Runs token, credential, and status retrieval as one retriable issuance phase. */
export const issuanceState = itwCredentialSetup.createStateConfig({
  initial: "ObtainingAccessToken",
  tags: [ItwTags.Issuing],
  states: {
    WaitingForSessionRefresh: {
      invoke: {
        src: "waitForSessionRefresh",
        input: ({ context }) => ({ deps: context.deps })
      },
      on: {
        "session-refresh-complete": { target: "ObtainingCredential" }
      }
    },
    ObtainingAccessToken: {
      invoke: {
        src: "obtainAccessToken",
        input: ({ context }) => ({
          requestedCredential: context.requestedCredential,
          evaluatedDcqlQuery: context.evaluatedDcqlQuery,
          codeVerifier: context.codeVerifier,
          issuerConf: context.issuerConf,
          walletInstanceAttestation: context.walletInstanceAttestation?.jwt,
          responseMode: context.responseMode,
          deps: context.deps
        }),
        onDone: {
          target: "ObtainingCredential",
          actions: assign(({ event }) => ({ accessToken: event.output }))
        },
        onError: {
          target: "#itwCredentialIssuanceMachine.Failure",
          actions: "setFailure"
        }
      }
    },
    ObtainingCredential: {
      description:
        "Obtain the credential(s) with the WUA if supported. This state is retried when the session expires, so it must contain the minimal retriable logic to obtain the credential",
      invoke: {
        src: "obtainCredential",
        input: ({ context }) => ({
          credentialType: context.credentialType,
          walletInstanceAttestation: context.walletInstanceAttestation?.jwt,
          clientId: context.clientId,
          codeVerifier: context.codeVerifier,
          requestedCredential: context.requestedCredential,
          issuerConf: context.issuerConf,
          accessToken: context.accessToken,
          deps: context.deps
        }),
        onDone: {
          target: "ObtainingCredentialStatus",
          actions: assign(({ event }) => event.output)
        },
        onError: [
          {
            guard: "isSessionExpired",
            actions: "handleSessionExpired",
            target: "WaitingForSessionRefresh"
          },
          {
            target: "#itwCredentialIssuanceMachine.Failure",
            actions: "setFailure"
          }
        ]
      }
    },
    ObtainingCredentialStatus: {
      invoke: {
        src: "obtainCredentialStatus",
        input: ({ context }) => ({
          credentials: context.credentials,
          issuerConf: context.issuerConf,
          deps: context.deps
        }),
        onDone: {
          target: "Completed",
          actions: assign(({ event }) => ({
            credentials: event.output
          }))
        },
        onError: {
          target: "#itwCredentialIssuanceMachine.Failure",
          actions: "setFailure"
        }
      }
    },
    Completed: {
      type: "final"
    }
  },
  after: {
    // If this step takes more than 4 seconds, we navigate to the next screen and display a loading indicator
    [CREDENTIAL_PREVIEW_LOADING_DELAY_MS]: {
      actions: "navigateToCredentialPreviewScreen"
    }
  },
  onDone: {
    target: "DisplayingCredentialPreview"
  }
} as const);
