import _ from "lodash";
import {
  and,
  assertEvent,
  assign,
  fromPromise,
  not,
  or,
  raise,
  setup
} from "xstate";
import { assert } from "../../../../utils/assert.ts";
import { trackItWalletIntroScreen } from "../../analytics";
import {
  StoredCredential,
  WalletInstanceAttestations
} from "../../common/utils/itwTypesUtils";
import { ItwTags } from "../tags";
import { itwCredentialUpgradeMachine } from "../upgrade/machine.ts";
import {
  GetWalletAttestationActorParams,
  type RequestEidActorParams,
  StartAuthFlowActorParams
} from "./actors";
import {
  AuthenticationContext,
  CieContext,
  Context,
  InitialContext
} from "./context";
import { EidIssuanceEvents } from "./events";
import { IssuanceFailureType, mapEventToFailure } from "./failure";

const notImplemented = () => {
  throw new Error("Not implemented");
};

export const itwEidIssuanceMachine = setup({
  types: {
    context: {} as Context,
    events: {} as EidIssuanceEvents
  },
  actions: {
    onInit: notImplemented,

    /**
     * Navigation
     */

    navigateToTosScreen: notImplemented,
    navigateToIpzsPrivacyScreen: notImplemented,
    navigateToIdentificationScreen: notImplemented,
    navigateToIdpSelectionScreen: notImplemented,
    navigateToSpidLoginScreen: notImplemented,
    navigateToCieIdLoginScreen: notImplemented,
    navigateToEidPreviewScreen: notImplemented,
    navigateToSuccessScreen: notImplemented,
    navigateToFailureScreen: notImplemented,
    navigateToWallet: notImplemented,
    navigateToCredentialCatalog: notImplemented,
    navigateToCiePreparationScreen: notImplemented,
    navigateToCiePinPreparationScreen: notImplemented,
    navigateToCiePinScreen: notImplemented,
    navigateToCieReadCardScreen: notImplemented,
    navigateToNfcInstructionsScreen: notImplemented,
    navigateToWalletRevocationScreen: notImplemented,
    navigateToCieWarningScreen: notImplemented,
    closeIssuance: notImplemented,

    /**
     * Store update
     */

    storeIntegrityKeyTag: notImplemented,
    cleanupIntegrityKeyTag: notImplemented,
    storeWalletInstanceAttestation: notImplemented,
    storeAuthLevel: notImplemented,
    storeEidCredential: notImplemented,
    handleSessionExpired: notImplemented,
    resetWalletInstance: notImplemented,
    freezeSimplifiedActivationRequirements: notImplemented,
    clearSimplifiedActivationRequirements: notImplemented,

    /**
     * Analytics
     */

    trackWalletInstanceCreation: notImplemented,
    trackWalletInstanceRevocation: notImplemented,

    /**
     * Context manipulation
     */

    setFailure: assign(({ event }) => ({ failure: mapEventToFailure(event) })),
    loadPidIntoContext: notImplemented,
    /**
     * Save the final redirect url in the machine context for later reuse.
     * This action is the same for the three identification methods.
     */
    completeUserIdentification: assign(({ context, event }) => {
      assertEvent(event, "user-identification-completed");
      assert(
        context.authenticationContext,
        "authenticationContext must be defined when completing auth flow"
      );
      return {
        authenticationContext: {
          ...context.authenticationContext,
          callbackUrl: event.authRedirectUrl
        }
      };
    }),
    trackIntroScreen: ({ context }) => {
      trackItWalletIntroScreen(context.isL3 ? "L3" : "L2");
    }
  },
  actors: {
    verifyTrustFederation: fromPromise<void>(notImplemented),
    getCieStatus: fromPromise<CieContext>(notImplemented),
    createWalletInstance: fromPromise<string>(notImplemented),
    revokeWalletInstance: fromPromise<void>(notImplemented),
    getWalletAttestation: fromPromise<
      WalletInstanceAttestations,
      GetWalletAttestationActorParams
    >(notImplemented),
    requestEid: fromPromise<StoredCredential, RequestEidActorParams>(
      notImplemented
    ),
    startAuthFlow: fromPromise<AuthenticationContext, StartAuthFlowActorParams>(
      notImplemented
    ),
    credentialUpgradeMachine: itwCredentialUpgradeMachine
  },
  guards: {
    issuedEidMatchesAuthenticatedUser: notImplemented,
    isSessionExpired: notImplemented,
    isOperationAborted: notImplemented,
    hasIntegrityKeyTag: ({ context }) => context.integrityKeyTag !== undefined,
    hasValidWalletInstanceAttestation: notImplemented,
    hasLegacyCredentials: ({ context }) => context.legacyCredentials.length > 0,
    isNFCEnabled: ({ context }) => context.cieContext?.isNFCEnabled || false,
    isReissuance: ({ context }) => context.mode === "reissuance",
    isUpgrade: ({ context }) => context.mode === "upgrade",
    isL3FeaturesEnabled: ({ context }) => context.isL3 || false,
    isL2Fallback: ({ context }) => context.isL2Fallback || false,
    isEligibleForItwSimplifiedActivation: notImplemented
  }
}).createMachine({
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
    // This action restarts the machine, resetting it to the Idle state before starting it again.
    // This is crucial if we want to restart the machine without having a possible race condition with two events sent simultaneously.
    restart: {
      target: "#itwEidIssuanceMachine.Idle",
      actions: [
        assign(() => ({ ...InitialContext })),
        raise(({ event, context }) => ({
          type: "start",
          mode: event.mode,
          isL3: event.isL3,
          isL2Fallback: event.isL2Fallback ?? context.isL2Fallback
        }))
      ]
    }
  },
  states: {
    Idle: {
      description: "The machine is in idle, ready to start the issuance flow",
      on: {
        start: {
          actions: assign(({ event, context }) => ({
            mode: event.mode,
            isL3: event.isL3,
            isL2Fallback: event.isL2Fallback ?? context.isL2Fallback
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
        ]
      }
    },
    TrustFederationVerification: {
      description:
        "Verification of the trust federation. This state verifies the trust chain of the wallet provider with the PID provider.",
      tags: [ItwTags.Loading],
      invoke: {
        src: "verifyTrustFederation",
        onDone: [
          {
            // When no integrity hardware key exists,
            // we need to create a new integrity key tag and a new wallet instance
            guard: not("hasIntegrityKeyTag"),
            target: "WalletInstanceCreation"
          },
          {
            // When an integrity key tag exists but the wallet instance attestation is invalid,
            // we proceed to obtain a valid wallet instance attestation
            guard: not("hasValidWalletInstanceAttestation"),
            target: "WalletInstanceAttestationObtainment"
          },
          {
            // When reissuing or fallback to L2, if both integrity key tag and wallet instance attestation are valid,
            guard: or(["isReissuance", "isL2Fallback"]),
            target: "UserIdentification.Identification.L2"
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
            guard: or(["isReissuance", "isL2Fallback"]),
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
        onDone: {
          actions: [
            "trackWalletInstanceRevocation",
            "resetWalletInstance",
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
          integrityKeyTag: context.integrityKeyTag
        }),
        onDone: [
          {
            guard: or(["isReissuance", "isL2Fallback"]),
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
        "accept-ipzs-privacy": [
          {
            guard: and(["isUpgrade", "isEligibleForItwSimplifiedActivation"]),
            target: "EvaluatingSimplifiedActivationFlow"
          },
          { target: "UserIdentification" }
        ],
        error: {
          actions: "setFailure",
          target: "#itwEidIssuanceMachine.Failure"
        },
        back: "#itwEidIssuanceMachine.TosAcceptance"
      }
    },
    EvaluatingSimplifiedActivationFlow: {
      description: "State that manages the wallet's simplified activation flow",
      entry: "clearSimplifiedActivationRequirements",
      always: [
        {
          guard: "hasLegacyCredentials",
          actions: "loadPidIntoContext",
          target: "#itwEidIssuanceMachine.CredentialsUpgrade"
        },
        {
          target: "#itwEidIssuanceMachine.Success"
        }
      ]
    },
    UserIdentification: {
      description:
        "User identification flow. Once we get the user token we can continue to the eID issuance",
      initial: "Identification",
      states: {
        Identification: {
          initial: "EvaluateInitialState",
          states: {
            EvaluateInitialState: {
              description:
                "Identification phase needs different behaviors depending on the level of identification",
              always: [
                {
                  guard: and(["isL3FeaturesEnabled", not("isL2Fallback")]),
                  target: "L3"
                },
                {
                  target: "L2"
                }
              ]
            },
            L2: {
              description: "Navigates to the L2 identification screen",
              entry: "navigateToIdentificationScreen",
              on: {
                "select-identification-mode": [
                  {
                    guard: ({ event }) => event.mode === "spid",
                    target: "#itwEidIssuanceMachine.UserIdentification.Spid"
                  },
                  {
                    guard: ({ event }) => event.mode === "ciePin",
                    target: "#itwEidIssuanceMachine.UserIdentification.CiePin"
                  },
                  {
                    guard: ({ event }) => event.mode === "cieId",
                    actions: assign(() => ({
                      identification: {
                        mode: "cieId",
                        level: "L2"
                      }
                    })),
                    target: "#itwEidIssuanceMachine.UserIdentification.CieID"
                  }
                ],
                back: [
                  {
                    guard: or(["isReissuance", "isL2Fallback"]),
                    target: "#itwEidIssuanceMachine.Idle"
                  },
                  {
                    guard: "isL3FeaturesEnabled",
                    target:
                      "#itwEidIssuanceMachine.UserIdentification.Identification.L3"
                  },
                  {
                    target: "#itwEidIssuanceMachine.IpzsPrivacyAcceptance"
                  }
                ]
              }
            },
            L3: {
              description: "Navigates to the L3 identification screen",
              entry: [
                "navigateToIdentificationScreen",
                assign({
                  isL2Fallback: false
                })
              ],
              on: {
                "select-identification-mode": [
                  {
                    guard: ({ event }) => event.mode === "ciePin",
                    target: "#itwEidIssuanceMachine.UserIdentification.CiePin"
                  },
                  {
                    guard: ({ event }) => event.mode === "cieId",
                    actions: assign(() => ({
                      identification: {
                        mode: "cieId",
                        level: "L3"
                      }
                    })),
                    target: "#itwEidIssuanceMachine.UserIdentification.CieID"
                  }
                ],
                "go-to-l2-identification": {
                  target: "L2",
                  actions: assign({ isL2Fallback: true })
                },
                "go-to-cie-warning": {
                  target:
                    "#itwEidIssuanceMachine.UserIdentification.CiePin.CieWarning.Identification"
                },
                back: {
                  target: "#itwEidIssuanceMachine.IpzsPrivacyAcceptance"
                }
              }
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
                  walletInstanceAttestation:
                    context.walletInstanceAttestation?.jwt,
                  identification: context.identification
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
                  actions: ["completeUserIdentification", "storeAuthLevel"]
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
              target:
                "#itwEidIssuanceMachine.UserIdentification.Identification.EvaluateInitialState"
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
                    "#itwEidIssuanceMachine.UserIdentification.Identification.L2"
                }
              }
            },
            StartingSpidAuthFlow: {
              entry: "navigateToSpidLoginScreen",
              tags: [ItwTags.Loading],
              invoke: {
                src: "startAuthFlow",
                // eslint-disable-next-line sonarjs/no-identical-functions
                input: ({ context }) => ({
                  walletInstanceAttestation:
                    context.walletInstanceAttestation?.jwt,
                  identification: context.identification
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
        CiePin: {
          description:
            "This state handles the entire CIE + pin identification flow",
          initial: "PreparationPin",
          states: {
            PreparationPin: {
              description:
                "This state handles the CIE PIN preparation screen, where the user is informed about the CIE PIN",
              entry: "navigateToCiePinPreparationScreen",
              on: {
                next: [
                  {
                    guard: "isNFCEnabled",
                    target: "InsertingCardPin"
                  },
                  {
                    target: "RequestingNfcActivation"
                  }
                ],
                "go-to-cie-warning": {
                  target: "CieWarning.PreparationPin"
                },
                back: {
                  target: "#itwEidIssuanceMachine.UserIdentification"
                },
                close: {
                  actions: "closeIssuance"
                }
              }
            },
            RequestingNfcActivation: {
              entry: "navigateToNfcInstructionsScreen",
              on: {
                "nfc-enabled": {
                  actions: assign(({ context }) => ({
                    cieContext: _.merge(context.cieContext, {
                      isNFCEnabled: true
                    })
                  })),
                  target: "InsertingCardPin"
                },
                back: {
                  target: "#itwEidIssuanceMachine.UserIdentification"
                }
              }
            },
            InsertingCardPin: {
              entry: [
                assign(() => ({ authenticationContext: undefined })), // Reset the authentication context, otherwise retries will use stale data
                "navigateToCiePinScreen"
              ],
              on: {
                "cie-pin-entered": {
                  target: "PreparationCie",
                  actions: assign(({ event }) => ({
                    identification: {
                      mode: "ciePin",
                      level: "L3",
                      pin: event.pin
                    }
                  }))
                },
                back: {
                  target: "PreparationPin"
                }
              }
            },
            PreparationCie: {
              description:
                "This state handles the CIE preparation screen, where the user is informed about the CIE card",
              entry: "navigateToCiePreparationScreen",
              on: {
                next: {
                  actions: "navigateToCieReadCardScreen",
                  target: "StartingCieAuthFlow"
                },
                "go-to-cie-warning": {
                  target: "CieWarning.PreparationCie"
                },
                back: {
                  target: "PreparationPin"
                },
                close: {
                  actions: "closeIssuance"
                }
              }
            },
            StartingCieAuthFlow: {
              description:
                "Start the preliminary phase of the CIE identification flow.",
              tags: [ItwTags.Loading],
              invoke: {
                src: "startAuthFlow",
                // eslint-disable-next-line sonarjs/no-identical-functions
                input: ({ context }) => ({
                  walletInstanceAttestation:
                    context.walletInstanceAttestation?.jwt,
                  identification: context.identification
                }),
                onDone: {
                  actions: assign(({ event }) => ({
                    authenticationContext: event.output
                  })),
                  target: "ReadingCieCard"
                },
                onError: {
                  actions: "setFailure",
                  target: "#itwEidIssuanceMachine.Failure"
                }
              },
              on: {
                back: {
                  target: "PreparationCie"
                }
              }
            },
            ReadingCieCard: {
              description:
                "Read the CIE card and get back a url to continue the PID issuing flow. This state also handles errors when reading the card.",
              on: {
                "user-identification-completed": {
                  target: "#itwEidIssuanceMachine.UserIdentification.Completed",
                  actions: ["completeUserIdentification", "storeAuthLevel"]
                },
                close: {
                  target: "#itwEidIssuanceMachine.UserIdentification"
                },
                back: {
                  target: "PreparationCie"
                }
              }
            },
            CieWarning: {
              description: "Navigates to and handles the CIE warning screen.",
              entry: "navigateToCieWarningScreen",
              initial: "Identification",
              states: {
                Identification: {
                  on: {
                    back: "#itwEidIssuanceMachine.UserIdentification.Identification.L3"
                  }
                },
                PreparationCie: {
                  on: {
                    back: "#itwEidIssuanceMachine.UserIdentification.CiePin.PreparationCie"
                  }
                },
                PreparationPin: {
                  on: {
                    back: "#itwEidIssuanceMachine.UserIdentification.CiePin.PreparationPin"
                  }
                }
              },
              on: {
                "go-to-l2-identification": {
                  target:
                    "#itwEidIssuanceMachine.UserIdentification.Identification.L2",
                  actions: assign({ isL2Fallback: true })
                },
                close: {
                  actions: "closeIssuance"
                }
              }
            }
          },
          onDone: {
            target: "#itwEidIssuanceMachine.UserIdentification.Completed"
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
      initial: "RequestingEid",
      states: {
        RequestingEid: {
          tags: [ItwTags.Loading],
          invoke: {
            src: "requestEid",
            input: ({ context }) => ({
              identification: context.identification,
              authenticationContext: context.authenticationContext,
              walletInstanceAttestation: context.walletInstanceAttestation?.jwt,
              isL3: context.isL3 && !context.isL2Fallback
            }),
            onDone: {
              actions: assign(({ event }) => ({ eid: event.output })),
              target: "CheckingIdentityMatch"
            },
            onError: [
              {
                actions: "setFailure",
                target: "#itwEidIssuanceMachine.Failure"
              }
            ]
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
              actions: [
                "storeEidCredential",
                "trackWalletInstanceCreation",
                "freezeSimplifiedActivationRequirements"
              ],
              target: "Completed"
            },
            close: {
              actions: ["closeIssuance"]
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
            "hasLegacyCredentials",
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
      tags: [ItwTags.Loading],
      entry: "navigateToSuccessScreen",
      description:
        "This state handles the upgrade of credentials in the wallet",
      invoke: {
        src: "credentialUpgradeMachine",
        input: ({ context }) => {
          assert(context.eid, "PID must be defined for credential upgrade");
          assert(
            context.walletInstanceAttestation,
            "Wallet instance attestation must be defined"
          );
          assert(context.mode, "Issuance mode must be defined");

          return {
            pid: context.eid,
            walletInstanceAttestation: context.walletInstanceAttestation?.jwt,
            credentials: context.legacyCredentials,
            issuanceMode: context.mode
          };
        },
        onDone: {
          description: "Credentials upgrade completed successfully",
          actions: assign(({ event }) => ({
            failedCredentials: event.output.failedCredentials
          })),
          target: "#itwEidIssuanceMachine.Success"
        },
        onError: {
          description:
            "An unexpected error occurred during the credentials upgrade",
          actions: "setFailure",
          target: "#itwEidIssuanceMachine.Failure"
        }
      }
    },
    Success: {
      entry: "navigateToSuccessScreen",
      on: {
        "add-new-credential": {
          actions: "navigateToCredentialCatalog"
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
