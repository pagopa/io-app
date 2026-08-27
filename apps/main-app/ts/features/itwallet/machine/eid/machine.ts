import { and, assertEvent, assign, not, or, raise } from "xstate";

import { assert } from "../../../../utils/assert.ts";
import { ItwTags } from "../tags";
import { InitialContext } from "./context";
import { IssuanceFailureType } from "./failure";
import { itwEidIssuanceMachineSetup } from "./setup";
import { ciePinState } from "./states/ciePin";

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
    UserIdentification: {
      description:
        "User identification flow. Once we get the user token we can continue to the eID issuance",
      initial: "Identification",
      states: {
        Identification: {
          description: "Selection of the identification method",
          always: {
            actions: "navigateToIdentificationScreen"
          },
          on: {
            "select-identification-mode": [
              {
                guard: ({ event }) => event.mode === "spid",
                actions: "trackIdentificationMethodSelected",
                target: "#itwEidIssuanceMachine.UserIdentification.Spid"
              },
              {
                guard: ({ event }) => event.mode === "ciePin",
                actions: "trackIdentificationMethodSelected",
                target: "#itwEidIssuanceMachine.UserIdentification.CiePin"
              },
              {
                guard: ({ event }) => event.mode === "cieId",
                actions: [
                  "trackIdentificationMethodSelected",
                  "setCieIdIdentificationL2"
                ],
                target: "#itwEidIssuanceMachine.UserIdentification.CieID"
              }
            ],
            "go-to-cie-warning": {
              target:
                "#itwEidIssuanceMachine.UserIdentification.CiePin.CieWarning.Identification"
            },
            back: [
              {
                guard: "isReissuance",
                target: "#itwEidIssuanceMachine.Idle",
                actions: "closeIssuance"
              },
              {
                guard: "isL2Fallback",
                target: "#itwEidIssuanceMachine.Idle",
                actions: "navigateToTosScreen"
              },
              {
                guard: "isL3FeaturesEnabled",
                target: "#itwEidIssuanceMachine.TosAcceptance"
              },
              {
                target: "#itwEidIssuanceMachine.IpzsPrivacyAcceptance"
              }
            ],
            close: {
              target: "#itwEidIssuanceMachine.Idle",
              actions: "closeIssuance"
            }
          }
        },
        CieID: {
          description:
            "This state handles the entire CieID authentication flow",
          initial: "StartingCieIDAuthFlow",
          states: {
            StartingCieIDAuthFlow: {
              entry: [
                assign(() => ({ authenticationContext: undefined })),
                "navigateToCieIdLoginScreen"
              ],
              invoke: {
                src: "startAuthFlow",
                input: ({ context }) => ({
                  itwVersion: context.itwVersion,
                  walletInstanceAttestation:
                    context.walletInstanceAttestation?.jwt,
                  identification: context.identification,
                  withMRTDPoP: context.level === "l3"
                }),
                onDone: {
                  actions: assign(({ event }) => ({
                    authenticationContext: event.output
                  })),
                  target: "CompletingCieIDAuthFlow"
                },
                onError: [
                  {
                    actions: "setFailure",
                    target: "#itwEidIssuanceMachine.Failure"
                  }
                ]
              }
            },
            CompletingCieIDAuthFlow: {
              on: {
                "user-identification-completed": {
                  target: "Completed",
                  actions: [
                    "completeUserIdentification",
                    "updateCieIdIdentificationLevel",
                    "storeAuthLevel"
                  ]
                },
                error: {
                  actions: "setFailure",
                  target: "#itwEidIssuanceMachine.Failure"
                }
              }
            },
            Completed: {
              type: "final"
            }
          },
          on: {
            back: {
              target: "#itwEidIssuanceMachine.UserIdentification.Identification"
            }
          },
          onDone: {
            target: "#itwEidIssuanceMachine.UserIdentification.Completed"
          }
        },
        Spid: {
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
                  target:
                    "#itwEidIssuanceMachine.UserIdentification.Identification"
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
                  walletInstanceAttestation:
                    context.walletInstanceAttestation?.jwt,
                  identification: context.identification,
                  withMRTDPoP: context.level === "l3"
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
        },
        CiePin: ciePinState,
        Completed: {
          type: "final"
        }
      },
      onDone: [
        {
          guard: "requiresMrtdVerification",
          target: "MrtdPoP",
          actions: "trackItwIdAuthenticationCompleted"
        },
        {
          target: "Issuance"
        }
      ]
    },
    MrtdPoP: {
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
              walletInstanceAttestation: context.walletInstanceAttestation?.jwt
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
              walletInstanceAttestation: context.walletInstanceAttestation?.jwt
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
          description:
            "Wait for the user to complete the MRTD PoP authorization",
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
    },
    Issuance: {
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
    },
    CredentialsUpgrade: {
      description:
        "This state handles the upgrade of credentials in the wallet",
      initial: "Upgrading",
      states: {
        Upgrading: {
          entry: "navigateToSuccessScreen",
          tags: [ItwTags.Loading],
          invoke: {
            id: "credentialUpgradeMachine",
            src: "credentialUpgradeMachine",
            input: ({ context }) => {
              assert(context.mode, "Issuance mode must be defined");

              return {
                itwVersion: context.itwVersion,
                credentials: context.credentialsToUpgrade,
                issuanceMode: context.mode
              };
            },
            onDone: {
              description: "Credentials upgrade completed successfully",
              actions: [
                assign(({ event }) => ({
                  failedCredentials: event.output.failedCredentials
                })),
                "storeCredentialUpgradeFailures"
              ],
              target: "#itwEidIssuanceMachine.Success"
            },
            onError: {
              description:
                "An unexpected error occurred during the credentials upgrade",
              actions: "setFailure",
              target: "#itwEidIssuanceMachine.Failure"
            }
          }
        }
      }
    },
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
