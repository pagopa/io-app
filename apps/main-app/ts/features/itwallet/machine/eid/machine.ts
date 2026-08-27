import { and, assertEvent, assign, not, or, raise } from "xstate";

import { ItwTags } from "../tags";
import { InitialContext } from "./context";
import { IssuanceFailureType } from "./failure";
import { itwEidIssuanceMachineSetup } from "./setup";
import { credentialsUpgradeState } from "./state/credentialsUpgrade";
import { issuanceState } from "./state/issuance";
import { mrtdPoPState } from "./state/mrtdPoP";
import { userIdentificationState } from "./state/userIdentification";

export const itwEidIssuanceMachine = itwEidIssuanceMachineSetup.createMachine({
  id: "itwEidIssuanceMachine",
  context: { ...InitialContext },
  initial: "Idle",
  entry: "onInit",
  invoke: {
    src: "getCieStatus",
    onDone: {
      actions: assign(({ event }) => ({ cieContext: event.output }))
    },
    onError: {
      // Any failure during the CIE/NFC status check will not be handled or treated as a negative result
      // We still need an empty onError to avoid uncaught promise rejection
    }
  },
  on: {
    // This action should only be used in the playground
    reset: {
      target: "#itwEidIssuanceMachine.Idle"
    },
    // This action should only be used in the playground
    "simulate-failure": {
      actions: assign(({ event }) => {
        assertEvent(event, "simulate-failure");
        return { failure: event.failure };
      }),
      target: "#itwEidIssuanceMachine.Failure"
    },
    // This action restarts the machine, resetting it to the Idle state before starting it again.
    // This is crucial if we want to restart the machine without having a possible race condition with two events sent simultaneously.
    restart: {
      target: "#itwEidIssuanceMachine.Idle",
      actions: [
        raise(({ event }) => ({
          type: "start",
          mode: event.mode,
          level: event.level,
          credentialType: event.credentialType
        }))
      ]
    }
  },
  states: {
    Idle: {
      description: "The machine is in idle, ready to start the issuance flow",
      on: {
        start: {
          actions: assign(({ event }) => ({
            mode: event.mode,
            level: event.level,
            credentialType: event.credentialType,
            // Override the IT-Wallet version from the global store set on machine init.
            // This is necessary because a user might use a different IT-Wallet version outside this machine:
            // - User has 1.0 PID and is upgrading (1.0 -> 1.3)
            // - User is whitelisted but falls back to L2 (1.3 -> 1.0)
            itwVersion:
              event.mode === "upgrade" || event.level === "l3"
                ? "1.3.3"
                : "1.0.0"
          })),
          target: "EvaluatingIssuanceMode"
        },
        close: {
          actions: "closeIssuance"
        },
        "revoke-wallet-instance": {
          target: "WalletInstanceRevocation"
        }
      }
    },
    EvaluatingIssuanceMode: {
      always: [
        {
          guard: "isReissuance",
          target: "TrustFederationVerification"
        },
        {
          target: "TosAcceptance"
        }
      ]
    },
    TosAcceptance: {
      description:
        "Display of the ToS to the user who must accept in order to proceed with the issuance of the eID",
      entry: ["navigateToTosScreen", "trackIntroScreen"],
      on: {
        "accept-tos": [
          {
            // Verify the trust federation
            target: "TrustFederationVerification"
          }
        ],
        "go-to-ipzs-privacy": {
          actions: "navigateToIpzsPrivacyScreen"
        },
        "accept-ipzs-privacy": [
          {
            // The IPZS privacy can be opened from the Discovery screen in the L3 flow.
            target: "TrustFederationVerification"
          }
        ],
        close: {
          target: "#itwEidIssuanceMachine.Idle",
          actions: "closeIssuance"
        }
      }
    },
    TrustFederationVerification: {
      description:
        "Verification of the trust federation. This state verifies the trust chain of the wallet provider with the PID provider.",
      tags: [ItwTags.Loading],
      invoke: {
        src: "verifyTrustFederation",
        input: ({ context }) => ({ itwVersion: context.itwVersion }),
        onDone: [
          {
            // When no integrity hardware key exists or the user is upgrading to IT-Wallet
            // we need to create a new integrity key tag and a new wallet instance
            guard: or([not("hasIntegrityKeyTag"), "isUpgrade"]),
            target: "WalletInstanceCreation"
          },
          {
            // When an integrity key tag exists but the wallet instance attestation is invalid,
            // we proceed to obtain a valid wallet instance attestation
            guard: not("hasValidWalletInstanceAttestation"),
            target: "WalletInstanceAttestationObtainment"
          },
          {
            // When reissuing, fallback to L2 or L3, if both integrity key tag and wallet instance attestation are valid,
            guard: or(["isReissuance", "isL2Fallback", "isL3FeaturesEnabled"]),
            target: "UserIdentification.Identification"
          },
          {
            // If both integrity key tag and wallet instance attestation are valid,
            // we can proceed to the IPZS privacy acceptance
            target: "IpzsPrivacyAcceptance"
          }
        ],
        onError: [
          {
            actions: "setFailure",
            target: "#itwEidIssuanceMachine.Failure"
          }
        ]
      },
      after: {
        5000: [
          {
            guard: or(["isReissuance", "isL2Fallback", "isL3FeaturesEnabled"]),
            actions: "navigateToIdentificationScreen"
          },
          {
            guard: not("isReissuance"),
            actions: "navigateToIpzsPrivacyScreen"
          }
        ]
      }
    },
    WalletInstanceCreation: {
      description:
        "This state generates the integrity hardware key and registers the wallet instance. The generated integrity hardware key is then stored and persisted to the redux store.",
      tags: [ItwTags.Loading],
      invoke: {
        src: "createWalletInstance",
        input: ({ context }) => ({
          itwVersion: context.itwVersion,
          isRenewal: context.mode === "upgrade"
        }),
        onDone: {
          actions: [
            assign(({ event }) => ({
              integrityKeyTag: event.output
            })),
            "storeIntegrityKeyTag"
          ],
          target: "WalletInstanceAttestationObtainment"
        },
        onError: [
          {
            guard: "isSessionExpired",
            actions: "handleSessionExpired",
            target: "#itwEidIssuanceMachine.TosAcceptance"
          },
          {
            actions: "setFailure",
            target: "#itwEidIssuanceMachine.Failure"
          }
        ]
      }
    },
    WalletInstanceRevocation: {
      tags: [ItwTags.Loading],
      entry: "navigateToWalletRevocationScreen",
      invoke: {
        src: "revokeWalletInstance",
        input: ({ context }) => ({ itwVersion: context.itwVersion }),
        onDone: {
          actions: [
            "trackWalletInstanceRevocation",
            "resetWalletInstance",
            "refreshCredentialsCatalogue",
            "closeIssuance"
          ]
        },
        onError: [
          {
            guard: "isSessionExpired",
            actions: "handleSessionExpired",
            target: "#itwEidIssuanceMachine.Idle"
          },
          {
            actions: assign({
              failure: ({ event }) => ({
                type: IssuanceFailureType.WALLET_REVOCATION_ERROR,
                reason: event.error
              })
            }),
            target: "#itwEidIssuanceMachine.Failure"
          }
        ]
      }
    },
    WalletInstanceAttestationObtainment: {
      description:
        "This state obtains the wallet instance attestation and stores it in the context for later use in the issuance flow.",
      tags: [ItwTags.Loading],
      invoke: {
        src: "getWalletAttestation",
        input: ({ context }) => ({
          integrityKeyTag: context.integrityKeyTag,
          itwVersion: context.itwVersion
        }),
        onDone: [
          {
            guard: or(["isReissuance", "isL2Fallback", "isL3FeaturesEnabled"]),
            actions: [
              assign(({ event }) => ({
                walletInstanceAttestation: event.output
              })),
              "storeWalletInstanceAttestation"
            ],
            target: "UserIdentification"
          },
          {
            actions: [
              assign(({ event }) => ({
                walletInstanceAttestation: event.output
              })),
              "storeWalletInstanceAttestation"
            ],
            target: "IpzsPrivacyAcceptance"
          }
        ],
        onError: [
          {
            guard: and(["isReissuance", "isSessionExpired"]),
            actions: ["handleSessionExpired", "closeIssuance"],
            target: "#itwEidIssuanceMachine.Idle"
          },
          {
            guard: "isSessionExpired",
            actions: "handleSessionExpired",
            target: "#itwEidIssuanceMachine.TosAcceptance"
          },
          {
            guard: "isWalletValid",
            actions: "setFailure",
            target: "#itwEidIssuanceMachine.Failure"
          },
          {
            actions: ["setFailure", "cleanupIntegrityKeyTag"],
            target: "#itwEidIssuanceMachine.Failure"
          }
        ]
      }
    },
    IpzsPrivacyAcceptance: {
      description:
        "This state handles the acceptance of the IPZS privacy policy",
      entry: "navigateToIpzsPrivacyScreen",
      on: {
        "accept-ipzs-privacy": { target: "UserIdentification" },
        error: {
          actions: "setFailure",
          target: "#itwEidIssuanceMachine.Failure"
        },
        back: "#itwEidIssuanceMachine.TosAcceptance"
      }
    },
    UserIdentification: userIdentificationState,
    MrtdPoP: mrtdPoPState,
    Issuance: issuanceState,
    CredentialsUpgrade: credentialsUpgradeState,
    Success: {
      entry: [
        "refreshCredentialsCatalogue",
        "navigateToSuccessScreen",
        "storeWalletActivationFeedbackBannerData"
      ],
      on: {
        "add-new-credential": {
          actions: ["navigateToCredentialCatalog"]
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
          actions: ["closeIssuance"]
        },
        retry: {
          target: "UserIdentification"
        },
        reset: {
          target: "Idle"
        },
        "revoke-wallet-instance": {
          actions: "navigateToWalletRevocationScreen",
          target: "WalletInstanceRevocation"
        },
        "go-to-wallet": {
          actions: "navigateToWallet"
        }
      }
    }
  }
});

export type ItwEidIssuanceMachine = typeof itwEidIssuanceMachine;
