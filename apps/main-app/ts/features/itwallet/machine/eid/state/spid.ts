import { assign } from "xstate";

import { ItwTags } from "../../tags";
import { itwEidIssuanceMachineSetup } from "../setup";

/** Handles identity-provider selection and SPID redirect authentication. */
export const spidState = itwEidIssuanceMachineSetup.createStateConfig({
  description: "This state handles the entire SPID identification flow",
  initial: "IdpSelection",
  states: {
    IdpSelection: {
      entry: [
        assign(() => ({ authenticationContext: undefined })),
        "navigateToIdpSelectionScreen"
      ],
      on: {
        "select-spid-idp": {
          target: "StartingSpidAuthFlow",
          actions: assign(({ event }) => ({
            identification: {
              mode: "spid",
              level: "L2",
              idpId: event.idp.id
            }
          }))
        },
        back: {
          target: "#itwEidIssuanceMachine.UserIdentification.Identification"
        }
      }
    },
    StartingSpidAuthFlow: {
      entry: "navigateToSpidLoginScreen",
      tags: [ItwTags.Loading],
      invoke: {
        src: "startAuthFlow",

        input: ({ context }) => ({
          itwVersion: context.itwVersion,
          walletInstanceAttestation: context.walletInstanceAttestation?.jwt,
          identification: context.identification,
          withMRTDPoP: context.level === "l3",
          deps: context.deps
        }),
        onDone: {
          actions: assign(({ event }) => ({
            authenticationContext: event.output
          })),
          target: "CompletingSpidAuthFlow"
        },
        onError: {
          actions: "setFailure",
          target: "#itwEidIssuanceMachine.Failure"
        }
      },
      on: {
        back: {
          target: "IdpSelection"
        }
      }
    },
    CompletingSpidAuthFlow: {
      on: {
        "user-identification-completed": {
          target: "Completed",
          actions: ["completeUserIdentification", "storeAuthLevel"]
        },
        back: {
          target: "IdpSelection"
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
} as const);
