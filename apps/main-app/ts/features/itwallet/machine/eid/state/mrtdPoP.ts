import { assign } from "xstate";

import { assert } from "../../../../../utils/assert.ts";
import { ItwTags } from "../../tags";
import { itwEidIssuanceMachineSetup } from "../setup";

/** Performs MRTD proof-of-possession when L3 identification requires it. */
export const mrtdPoPState = itwEidIssuanceMachineSetup.createStateConfig({
  description: "State handling the MRTD verification process",
  initial: "InitializingChallenge",
  states: {
    InitializingChallenge: {
      description:
        "Initializes the MRTD PoP challenge. The machine only enters this state when `challenge_info` is present in the callback URL.",
      tags: [ItwTags.Loading],
      invoke: {
        src: "initMrtdPoPChallenge",
        input: ({ context }) => ({
          itwVersion: context.itwVersion,
          authenticationContext: context.authenticationContext,
          walletInstanceAttestation: context.walletInstanceAttestation?.jwt,
          deps: context.deps
        }),
        onDone: {
          target: "DisplayingCanPreparationInstructions",
          actions: assign(({ event }) => ({
            mrtdContext: event.output
          }))
        },
        onError: {
          actions: "setFailure",
          target: "#itwEidIssuanceMachine.Failure"
        }
      }
    },
    DisplayingCieCardPreparationInstructions: {
      description:
        "Displays informations to prepare the CIE for reading (currently not used for CAN flow).",
      entry: "navigateToCieCardPreparationScreen",
      on: {
        close: {
          actions: "closeIssuance"
        },
        next: {
          target: "DisplayingCieNfcPreparationInstructions"
        }
      }
    },
    DisplayingCanPreparationInstructions: {
      description:
        "Once the challenge is initialized, we show NFC instructions with a dedicated screen.",
      entry: "navigateToCieCanPreparationScreen",
      on: {
        close: {
          actions: "closeIssuance"
        },
        next: {
          target: "WaitingForCan"
        }
      }
    },
    WaitingForCan: {
      description:
        "Waits for the user to input the CAN read from the MRTD document",
      entry: "navigateToCieCanScreen",
      on: {
        back: {
          target: "DisplayingCanPreparationInstructions"
        },
        "cie-can-entered": {
          target: "DisplayingCieNfcPreparationInstructions",
          actions: assign(({ event, context }) => {
            assert(context.mrtdContext, "mrtdContext must be defined");

            return {
              mrtdContext: {
                ...context.mrtdContext,
                can: event.can
              }
            };
          })
        }
      }
    },
    DisplayingCieNfcPreparationInstructions: {
      description:
        "Displays instructions to read the CIE card using the device NFC.",
      entry: "navigateToCieNfcPreparationScreen",
      on: {
        back: {
          target: "DisplayingCieCardPreparationInstructions"
        },
        next: {
          target: "#itwEidIssuanceMachine.MrtdPoP.SigningChallenge"
        }
      }
    },
    SigningChallenge: {
      description:
        "Once the CAN is entered, we proceed to sign the MRTD PoP challenge using the MRTD document",
      entry: "navigateToCieInternalAuthAndMrtdScreen",
      on: {
        "mrtd-challenged-signed": {
          target: "#itwEidIssuanceMachine.MrtdPoP.ChallengeValidation",
          actions: assign(({ event, context }) => {
            assert(context.mrtdContext, "mrtdContext must be defined");

            return {
              mrtdContext: {
                ...context.mrtdContext,
                ias: {
                  challenge_signed: event.data.nis_data.signedChallenge,
                  ias_pk: event.data.nis_data.publicKey,
                  sod_ias: event.data.nis_data.sod
                },
                mrtd: {
                  dg1: event.data.mrtd_data.dg1,
                  dg11: event.data.mrtd_data.dg11,
                  sod_mrtd: event.data.mrtd_data.sod
                }
              }
            };
          })
        },
        close: {
          target: "#itwEidIssuanceMachine.UserIdentification"
        },
        back: {
          target: "DisplayingCieNfcPreparationInstructions"
        },
        retry: {
          target: "#itwEidIssuanceMachine.MrtdPoP.WaitingForCan"
        }
      }
    },
    ChallengeValidation: {
      description:
        "Validates the signed MRTD PoP challenge with the signed data from the MRTD document",
      tags: [ItwTags.Loading],
      invoke: {
        id: "validateMrtdPoPChallenge",
        src: "validateMrtdPoPChallenge",
        input: ({ context }) => ({
          itwVersion: context.itwVersion,
          authenticationContext: context.authenticationContext,
          mrtdContext: context.mrtdContext,
          walletInstanceAttestation: context.walletInstanceAttestation?.jwt,
          deps: context.deps
        }),
        onDone: {
          target: "#itwEidIssuanceMachine.MrtdPoP.Authorization",
          actions: assign(({ event, context }) => {
            assert(context.mrtdContext, "mrtdContext must be defined");
            return {
              mrtdContext: {
                ...context.mrtdContext,
                callbackUrl: event.output
              }
            };
          })
        },
        onError: {
          actions: "setFailure",
          target: "#itwEidIssuanceMachine.Failure"
        }
      }
    },
    Authorization: {
      description: "Wait for the user to complete the MRTD PoP authorization",
      on: {
        "mrtd-pop-verification-completed": {
          target: "#itwEidIssuanceMachine.MrtdPoP.Completed",
          actions: [
            "completeMrtdPoP",
            "storeAuthLevel",
            "trackItwIdVerifiedDocument"
          ]
        }
      }
    },
    Completed: {
      type: "final"
    }
  },
  onDone: {
    target: "Issuance"
  }
} as const);
