import _ from "lodash";
import { and, assertEvent, assign, fromPromise, not, setup } from "xstate";
import {
  StoredCredential,
  WalletInstanceAttestations
} from "../../common/utils/itwTypesUtils";
import { ItwTags } from "../tags";
import { assert } from "../../../../utils/assert.ts";
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
    navigateToTosScreen: notImplemented,
    navigateToIpzsPrivacyScreen: notImplemented,
    navigateToL2IdentificationScreen: notImplemented,
    navigateToL3IdentificationScreen: notImplemented,
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
    storeIntegrityKeyTag: notImplemented,
    cleanupIntegrityKeyTag: notImplemented,
    storeWalletInstanceAttestation: notImplemented,
    storeEidCredential: notImplemented,
    closeIssuance: notImplemented,
    handleSessionExpired: notImplemented,
    resetWalletInstance: notImplemented,
    trackWalletInstanceCreation: notImplemented,
    trackWalletInstanceRevocation: notImplemented,
    storeAuthLevel: notImplemented,
    setFailure: assign(({ event }) => ({ failure: mapEventToFailure(event) })),
    onInit: notImplemented,
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
    setIsReissuing: assign({
      isReissuing: true
    })
  },
  actors: {
    createWalletInstance: fromPromise<string>(notImplemented),
    revokeWalletInstance: fromPromise<void>(notImplemented),
    getWalletAttestation: fromPromise<
      WalletInstanceAttestations,
      GetWalletAttestationActorParams
    >(notImplemented),
    getCieStatus: fromPromise<CieContext>(notImplemented),
    requestEid: fromPromise<StoredCredential, RequestEidActorParams>(
      notImplemented
    ),
    startAuthFlow: fromPromise<AuthenticationContext, StartAuthFlowActorParams>(
      notImplemented
    )
  },
  guards: {
    issuedEidMatchesAuthenticatedUser: notImplemented,
    isSessionExpired: notImplemented,
    isOperationAborted: notImplemented,
    hasIntegrityKeyTag: ({ context }) => context.integrityKeyTag !== undefined,
    hasValidWalletInstanceAttestation: notImplemented,
    isNFCEnabled: ({ context }) => context.cieContext?.isNFCEnabled || false,
    isReissuing: ({ context }) => context.isReissuing,
    isL3FeaturesEnabled: ({ context }) => context.isL3FeaturesEnabled || false,
    isL2Fallback: ({ context }) => context.isL2Fallback || false
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
    }
  },
  states: {
    Idle: {
      description: "The machine is in idle, ready to start the issuance flow",
      on: {
        start: {
          actions: assign(({ event }) => ({
            isL3FeaturesEnabled: event.isL3
          })),
          target: "TosAcceptance"
        },
        close: {
          actions: "closeIssuance"
        },
        "revoke-wallet-instance": {
          target: "WalletInstanceRevocation"
        },
        "start-reissuing": [
          {
            guard: not("hasValidWalletInstanceAttestation"),
            actions: "setIsReissuing",
            target: "WalletInstanceAttestationObtainment"
          },
          {
            actions: "setIsReissuing",
            target: "UserIdentification.L2Identification"
          }
        ]
      }
    },
    TosAcceptance: {
      description:
        "Display of the ToS to the user who must accept in order to proceed with the issuance of the eID",
      entry: "navigateToTosScreen",
      on: {
        "accept-tos": [
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
            // If both integrity key tag and wallet instance attestation are valid,
            // we can proceed to the IPZS privacy acceptance
            target: "IpzsPrivacyAcceptance"
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
      invoke: {
        src: "revokeWalletInstance",
        onDone: {
          actions: [
            "resetWalletInstance",
            "closeIssuance",
            "trackWalletInstanceRevocation"
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
          isL3IssuanceEnabled: false // TODO this is a temporary fix, we should use context.isL3FeaturesEnabled when the new issuance flow is completed
        }),
        onDone: [
          {
            guard: "isReissuing",
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
            guard: and(["isReissuing", "isSessionExpired"]),
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
        "accept-ipzs-privacy": {
          target: "UserIdentification"
        },
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
      initial: "EvaluateIdentificationLevel",
      states: {
        EvaluateIdentificationLevel: {
          always: [
            {
              guard: and(["isL3FeaturesEnabled", not("isL2Fallback")]),
              target: "L3Identification"
            },
            {
              target: "L2Identification"
            }
          ]
        },
        L3Identification: {
          description: "Navigates to the L3 identification screen",
          entry: [
            "navigateToL3IdentificationScreen",
            assign({
              isL2Fallback: false
            })
          ],
          on: {
            "select-identification-mode": [
              {
                guard: ({ event }) => event.mode === "ciePin",
                target: "CiePin"
              },
              {
                guard: ({ event, context }) =>
                  event.mode === "cieId" &&
                  context.isL3FeaturesEnabled === true,
                actions: assign(() => ({
                  identification: {
                    mode: "cieId",
                    level: "L3"
                  }
                })),
                target: "CieID"
              }
            ],
            "go-to-l2-identification": {
              target: "L2Identification",
              actions: assign({
                isL2Fallback: true
              })
            },
            "go-to-cie-warning": {
              target: "CieWarning.L3Identification"
            },
            back: {
              target: "#itwEidIssuanceMachine.IpzsPrivacyAcceptance"
            }
          }
        },
        L2Identification: {
          description: "Navigates to the L2 identification screen",
          entry: "navigateToL2IdentificationScreen",
          on: {
            "select-identification-mode": [
              {
                guard: ({ event }) => event.mode === "spid",
                target: "Spid"
              },
              {
                guard: ({ event }) => event.mode === "ciePin",
                target: "CiePin"
              },
              {
                guard: ({ event }) => event.mode === "cieId",
                actions: assign(() => ({
                  identification: {
                    mode: "cieId",
                    level: "L2"
                  }
                })),
                target: "CieID"
              }
            ],
            back: [
              {
                guard: "isReissuing",
                target: "#itwEidIssuanceMachine.Idle"
              },
              {
                guard: "isL3FeaturesEnabled",
                target: "L3Identification"
              },
              {
                target: "#itwEidIssuanceMachine.IpzsPrivacyAcceptance"
              }
            ]
          }
        },
        CieWarning: {
          description: "Navigates to and handles the CIE warning screen.",
          entry: "navigateToCieWarningScreen",
          initial: "ModeSelection",
          states: {
            L3Identification: {
              on: {
                back: "#itwEidIssuanceMachine.UserIdentification.L3Identification"
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
                "#itwEidIssuanceMachine.UserIdentification.L2Identification"
            },
            close: {
              actions: ["closeIssuance"]
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
                  isL3IssuanceEnabled: context.isL3FeaturesEnabled,
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
                "#itwEidIssuanceMachine.UserIdentification.EvaluateIdentificationLevel"
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
                    "#itwEidIssuanceMachine.UserIdentification.L2Identification"
                }
              }
            },
            StartingSpidAuthFlow: {
              entry: "navigateToSpidLoginScreen",
              tags: [ItwTags.Loading],
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
          initial: "EvaluateInitialState",
          states: {
            EvaluateInitialState: {
              always: [
                {
                  guard: "isL3FeaturesEnabled",
                  target: "PreparationCie"
                },
                { target: "InsertingCardPin" }
              ]
            },
            PreparationCie: {
              description:
                "This state handles the CIE preparation screen, where the user is informed about the CIE card",
              entry: "navigateToCiePreparationScreen",
              on: {
                next: {
                  target:
                    "#itwEidIssuanceMachine.UserIdentification.CiePin.PreparationPin"
                },
                "go-to-cie-warning": {
                  target:
                    "#itwEidIssuanceMachine.UserIdentification.CieWarning.PreparationCie"
                },
                back: {
                  target:
                    "#itwEidIssuanceMachine.UserIdentification.EvaluateIdentificationLevel"
                },
                close: {
                  actions: ["closeIssuance"]
                }
              }
            },
            PreparationPin: {
              description:
                "This state handles the CIE PIN preparation screen, where the user is informed about the CIE PIN",
              entry: "navigateToCiePinPreparationScreen",
              on: {
                next: {
                  target:
                    "#itwEidIssuanceMachine.UserIdentification.CiePin.InsertingCardPin"
                },
                "go-to-cie-warning": {
                  target:
                    "#itwEidIssuanceMachine.UserIdentification.CieWarning.PreparationPin"
                },
                back: {
                  target:
                    "#itwEidIssuanceMachine.UserIdentification.CiePin.PreparationCie"
                },
                close: {
                  actions: ["closeIssuance"]
                }
              }
            },
            InsertingCardPin: {
              entry: [
                assign(() => ({ authenticationContext: undefined })), // Reset the authentication context, otherwise retries will use stale data
                "navigateToCiePinScreen"
              ],
              on: {
                "cie-pin-entered": [
                  {
                    guard: "isNFCEnabled",
                    target: "StartingCieAuthFlow",
                    actions: assign(({ event }) => ({
                      identification: {
                        mode: "ciePin",
                        level: "L3",
                        pin: event.pin
                      }
                    }))
                  },
                  {
                    target:
                      "#itwEidIssuanceMachine.UserIdentification.CiePin.RequestingNfcActivation",
                    actions: assign(({ event }) => ({
                      identification: {
                        level: "L3",
                        mode: "ciePin",
                        pin: event.pin
                      }
                    }))
                  }
                ],
                back: [
                  {
                    guard: "isL3FeaturesEnabled",
                    target:
                      "#itwEidIssuanceMachine.UserIdentification.CiePin.PreparationPin"
                  },
                  {
                    target:
                      "#itwEidIssuanceMachine.UserIdentification.L2Identification"
                  }
                ]
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
                  target: "StartingCieAuthFlow"
                },
                back: {
                  target:
                    "#itwEidIssuanceMachine.UserIdentification.EvaluateIdentificationLevel"
                }
              }
            },
            StartingCieAuthFlow: {
              description:
                "Start the preliminary phase of the CIE identification flow.",
              entry: "navigateToCieReadCardScreen",
              tags: [ItwTags.Loading],
              invoke: {
                src: "startAuthFlow",
                input: ({ context }) => ({
                  walletInstanceAttestation:
                    context.walletInstanceAttestation?.jwt,
                  identification: context.identification,
                  isL3IssuanceEnabled: context.isL3FeaturesEnabled
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
              back: {
                target: "InsertingCardPin"
              }
            },
            ReadingCieCard: {
              description:
                "Read the CIE card and get back a url to continue the PID issuing flow. This state also handles errors when reading the card.",
              on: {
                "user-identification-completed": {
                  target: "Completed",
                  actions: ["completeUserIdentification", "storeAuthLevel"]
                },
                close: {
                  target: "#itwEidIssuanceMachine.UserIdentification"
                },
                back: {
                  target: "InsertingCardPin"
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
              walletInstanceAttestation: context.walletInstanceAttestation?.jwt
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
            "add-to-wallet": [
              {
                guard: "isReissuing",
                actions: [
                  "storeEidCredential",
                  "trackWalletInstanceCreation",
                  "navigateToWallet"
                ]
              },
              {
                actions: ["storeEidCredential", "trackWalletInstanceCreation"],
                target: "#itwEidIssuanceMachine.Success"
              }
            ],
            close: {
              actions: ["closeIssuance"]
            }
          }
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
        }
      }
    }
  }
});

export type ItwEidIssuanceMachine = typeof itwEidIssuanceMachine;
