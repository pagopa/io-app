import { assign, fromPromise, setup } from "xstate5";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { WalletAttestationResult } from "../../common/utils/itwAttestationUtils";
import { assert } from "../../../../utils/assert";
import { ItwTags } from "../tags";
import { CieAuthContext, Context, InitialContext } from "./context";
import { EidIssuanceEvents } from "./events";
import {
  GetWalletAttestationActorParams,
  StartCieAuthFlowActorParams,
  type RequestEidActorParams
} from "./actors";
import { IssuanceFailureType } from "./failure";

const notImplemented = () => {
  throw new Error("Not implemented");
};

const setFailure =
  (type: IssuanceFailureType) =>
  ({ event }: { event: EidIssuanceEvents }): Partial<Context> => ({
    failure: { type, reason: "error" in event ? event.error : undefined }
  });

export const itwEidIssuanceMachine = setup({
  types: {
    context: {} as Context,
    events: {} as EidIssuanceEvents
  },
  actions: {
    navigateToTosScreen: notImplemented,
    navigateToIdentificationModeScreen: notImplemented,
    navigateToIdpSelectionScreen: notImplemented,
    navigateToEidRequestScreen: notImplemented,
    navigateToEidPreviewScreen: notImplemented,
    navigateToSuccessScreen: notImplemented,
    navigateToFailureScreen: notImplemented,
    navigateToWallet: notImplemented,
    navigateToCredentialCatalog: notImplemented,
    navigateToCiePinScreen: notImplemented,
    navigateToCieReadCardScreen: notImplemented,
    navigateToNfcInstructionsScreen: notImplemented,
    storeIntegrityKeyTag: (_ctx, _params: { keyTag: string }) =>
      notImplemented(),
    storeEidCredential: notImplemented,
    closeIssuance: notImplemented,
    requestAssistance: notImplemented,
    setWalletInstanceToOperational: notImplemented,
    setWalletInstanceToValid: notImplemented,
    disposeWalletAttestation: notImplemented,
    handleSessionExpired: notImplemented
  },
  actors: {
    createWalletInstance: fromPromise<string>(notImplemented),
    getWalletAttestation: fromPromise<
      WalletAttestationResult,
      GetWalletAttestationActorParams
    >(notImplemented),
    requestEid: fromPromise<StoredCredential, RequestEidActorParams>(
      notImplemented
    ),
    startCieAuthFlow: fromPromise<CieAuthContext, StartCieAuthFlowActorParams>(
      notImplemented
    )
  },
  guards: {
    isNativeAuthSessionClosed: notImplemented,
    issuedEidMatchesAuthenticatedUser: notImplemented,
    isSessionExpired: notImplemented
  }
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEsAuB3AosiBJWsArgIYB2AxmALLHkAWypYAdLhADZgDEsqxATqgDaABgC6iUAAcA9rDTIZpSSAAeiABwAmADQgAnogDMARi0nmANhMBODRoAslyyMcB2AL4e9aLDnxEZJQ09IwsACpyAILklFJ8FNy0cagAtKhyohJIILLyqIrKOeoIAKy6BohaGmbM1ZalTm6ONk6lXj4Y2HgEJIkhDEzMkbAxKUFJsWDx6Zkm2dJyCkoqJZYVhghGRm4OzCa2GjbH5eYa7d4gvt0BfcG0gxHRU-ETXMnTaRmwQloLuUsCitiogHEYtEZmCIbEYNEYbOYRKVwXpNloHG4tMxmg11q5jpYNB0rl1-L0JgMwswAOrEdicVC4Ui8CYAYX4YGIQNIXAgShYjAAbjIANYC0k9QL9B5U2n0sCM5kJSjsznchBCmTkLmFLJZFR5ZZFUAlZE2KEiS1GK02EylRyoxAmXbMUrNExGM12BxaGzE65kqX3UJDOUMpksxKqnVKLhgfj8GT8ZhSdhcgBmSYAtswA5K7tQZaG6eGlWyOTHSBrSMLtdy9eIDYDCqtEGaLVabXaHZUEDVXZaRB6NG4bCItOOjP6JbcKUWWGGFRHlWAoqhUHA+NyAPIAIz4jCzYFIqF5-NzNdF4r8+bnIYXJaXZcSa43LJ3++Ih+PqGrtcrDb-Ia3KtmULqDiI1qQba9oOI6CDoiIljYhoDQ1NYdqWG4niXHms7SveNKPoqkaUK+m6VnuB6kEeJ5xgmSYpmmqCZvwOZ4eSBGPER8okSu5HvoUVFfjRP5-lqAHiPqOTAS2IJgXsEFQfC3Zwb2EIetirhOJaY67BcnQ3vhwbcQAqrA8ZsD+yDpsgdaFGeQzvteNycSZVLmZZEDWbZ9lKNJiz5HJJqIJi8FaJYrSukYuI2G4noNLC05GW5haEZ5-BWSeNl2ZWzBUDI3kAMpgJw5DcjwpVgOVqQ4D5uXcqkWaFWAAUAkFwIhVsGnMNoNRxZYnraCY4UmJF+xaKUJjjjY9pDslrlBmlZkWZl3nZb5eUFcVVXlQ5FllWkdUbQ1hRNS1QjzE2HXGmoxg9X1thuIN9rmOFSEaBNpQiJiOzlFhC2BgWlJDBlWUFJt3L5S1JWHftu1HetEOnUo53eb8QHNp1d3daYvXVE9L3DeFWjPcwDiweUFMmPYBkkilS0gywYNIzlfmkNDO1w7Gu60CKbWydjJRghCUIwnCCLTciGxOoNWKNJFiEYj9WiA7eXEeat4Ns3lRVSDglWHaksD6xAtUQFIAtY7dJTwjFX1IiYDgU24T2jeCzC2jC4smGrxnLZrXn1ezzB6wbvPkPzjYydboGetCdQ1NszRjsrMsIQcn3rN9I7OM4SW4TOqVM8wLPB3lrLIGAAAKjBcOQVepPrpCpD+8aQFbN1x2CFhGGC8XjqUDRTW48G2OYrpON7GiWmYlgOH7xfzqXWus5DhTMJXNd1xHUeY138nx+aBPJ0cIhp+9zpWJNSJuK4sKzQvhcM8Dy9lydIdFXwgiMFAW9RIQVAdAABi7AZDoEcgKS8YpcxF0Zm-Ve5coZfwEAUUgf8q4AKAaA8B4l2aAWukaUC6I4pQkwnFTENQDhjzcI0bENhFazV2BCSCi94HpUQR-XW380EYNXIAkBYCIHxkTMmVMGZsywJfneFaQcuHIJ4b-f+AicHoDwZJMQnciHyRFpCaEsJ4SImlmPGK5paHNFKEPBw0JdhP0MotV+HC5HIxDgAJU5BAJRVdWQCAgPXRux0XGVlSOQGQWZUwKg7tHQK2iurgjxo9AaQ03q9mdMiOoDCYRjQROYthjjZFrSQRvdxxBPHoK3j4-gfjyBgIslokCh8HoEySa9EaqSpoWFHJFMa1jhxujyTIwOhT5HFI8V4sAlS-G73qcFHG8SLCJOesktpmwaauyhFPdEOdaF0w4uw7i-tmDuIAI6EE3L-bokCLzChgXs-JVJDknLObwC5OB1H1iktE9qsS5nojIUPPuSFLERXgnFLEloU4AtmjCHC9igaDKGI8sApzznoMuSIxi4iWKSLuQilgSKUUvLRW8zU+DPn7x+SUMabpmCelaEcc4JxGgkztFpRwLhppglmlOZ+Di8WsFSkc5FzzeHooYmI5irF2JwPuYiwVTzUVQG6O83UUkroxwPl1albhaWlHpXYPVs1mWpLMJCcxqF0TnGROcAZGs5VLSFYS0V4c+YzKFrLDEur9WMqNWpNEEVIQTkcM7UcMK7H0z5Xa-FgrWR0GqiKX+2tUD6BoKgegXA3U20QMcEQUJs4OEcI4AmKzs3NHJoNQaSIGjVCJLy+FUaBUOtjfGxNrNk2pvTZdClDStXzx1XSgtBqmV+qdJBLEzo4qwnZTTW0tr3L2oLMwAAIsgE2aZ9C-2rhyQUVcIGlLNhkVI6BiKZtAj0-terB0+ssSOvsDgLAYnhM9S9z0KZzoDguiYy7V3iI3egrdYAd1gAgTUuQrUvmCyzQgYckJyjxy0IhGoDgbDwVQjqs45w75TVMLCiN9b50sCKoQKYBB3gQDNkwdAISOSszpKexpBbybBr1daOw6JLDwVoeaM+g0ab2jdJYd9JciMkdgFwKAMhZhHpPRB2OjS4QWlHG6Y4MUwq9nzr1MwU0XYFqQn6Ot6sCOh2I5QUjHILLCFk5qnG5gh4diRJaaoVaOO9iOMhBhudMSwTWUJ5ewCvzsEIByeutTwPdtmcLOEuaU52lhK4V98FnafT1Xaf6CJvoYl84RfzyBAvBY5E61IxACCrpXPRrqBaDiulQpBQ4EJSbwU9PLD0YJGjxc9Lh3FDact5e4OZhU5Wca6eS+LZ2P0abWHgvxqwkVrBFsaI0VWxJSAtXgDkLrBHCE9pxqkFzmxUilE9scNj9pwTPSwoJgz-sS5sE4FtiLoIxyfX7o0ZDWHSju1pU0bCOxbSuyy9xEYYxPgTHu+6rY2xyY7Apn3HuXLGsHB1TiIeE4lnOlrXCwzH6Hy8WXOWNUszIOgR9GPZwVhZq+ntNk7YS3MfXeXouPiEwBJbiEp+b8J4wdQewuFWE4LaGDR9PPFwDCAdDO1uvbGRP5ITj1VpcEhJhyoRQ6kmKubfSEnsPem+fcxeg04UEqG20wCw2qtt6XXVqjfX2CjmnP0YqDXeiObE4IEM7LV8iPXzMDc62QabLncd1g6ognq1HZgVdog9FiO+7hQ3z3KLsmV-L36G43lvWut0LdzKD-Z0P43fRj2O-sWhSE872FaIn6RDaU++43ign+5TMEqKEQHmX00kdjsV1OyKND4S9TV2Oscvo31XaXk44ZqelBCtKeMyZrfLd324wTLCeq87VBoaTarertBu9JhCL3K9nG16n6yMJESNwQHn0Ng45onC01oTsUmH31L1CO-pRzruEQH-9lf00EfQoeyuz2Dwi0y2g-Tf7yrCqKrdC-6jqjy9gnCexTyr4dJggQFNpxqRytrWTtpcj0CwEIDIafRISTQ0zOxTRu6grWD0KRQpZjQHDOjoGLorprrEB-pQAAZAboAEEei1AFrOxvYQjOD-4IAeYZKRS7DbA5x6oH4iamZrYxLbZUojgWAsbsoMp2A7CoYuCeyEi7C2g+iw76Z05j7cQ9ZBZgAEEw6HYkHzxQRDi2hTbIYzYMKRQDSkw7BeBeBAA */
  id: "itwEidIssuanceMachine",
  context: InitialContext,
  initial: "Idle",
  states: {
    Idle: {
      entry: assign(() => InitialContext),
      description: "The machine is in idle, ready to start the issuance flow",
      on: {
        start: {
          target: "TosAcceptance"
        }
      }
    },
    TosAcceptance: {
      description:
        "Display of the ToS to the user who must accept in order to proceed with the issuance of the eID",
      entry: "navigateToTosScreen",
      on: {
        "accept-tos": [
          {
            guard: ({ context }) => !context.integrityKeyTag,
            target: "WalletInstanceCreation"
          },
          {
            guard: ({ context }) => !context.walletAttestationContext,
            target: "WalletInstanceAttestationObtainment"
          },
          {
            target: "UserIdentification"
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
            {
              type: "storeIntegrityKeyTag",
              params: ({ event }) => ({ keyTag: event.output })
            },
            { type: "setWalletInstanceToOperational" }
          ],
          target: "WalletInstanceAttestationObtainment"
        },
        onError: [
          {
            guard: "isSessionExpired",
            target: "SessionExpired"
          },
          {
            actions: assign(setFailure(IssuanceFailureType.GENERIC)), // TODO: [SIW-1390] Use unsupported device from io-rn-wallet
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
        input: ({ context }) => ({ integrityKeyTag: context.integrityKeyTag }),
        onDone: {
          actions: assign(({ event }) => ({
            walletAttestationContext: event.output
          })),
          target: "UserIdentification"
        },
        onError: [
          {
            guard: "isSessionExpired",
            target: "SessionExpired"
          },
          {
            actions: assign(setFailure(IssuanceFailureType.GENERIC)),
            target: "#itwEidIssuanceMachine.Failure"
          }
        ]
      }
    },
    UserIdentification: {
      description:
        "User identification flow. Once we get the user token we can continue to the eID issuance",
      initial: "ModeSelection",
      states: {
        ModeSelection: {
          entry: "navigateToIdentificationModeScreen",
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
                actions: assign(() => ({ identification: { mode: "cieId" } })),
                target: "#itwEidIssuanceMachine.UserIdentification.Completed"
              }
            ],
            back: "#itwEidIssuanceMachine.TosAcceptance"
          }
        },
        Spid: {
          entry: "navigateToIdpSelectionScreen",
          on: {
            "select-spid-idp": {
              target: "Completed",
              actions: assign(({ event }) => ({
                identification: { mode: "spid", idpId: event.idp.id }
              }))
            },
            back: {
              target: "ModeSelection"
            }
          }
        },
        CiePin: {
          description:
            "This state handles the entire CIE + pin identification flow",
          initial: "InsertingCardPin",
          states: {
            InsertingCardPin: {
              entry: [
                assign(() => ({ cieAuthContext: undefined })), // Reset the CIE context, otherwise retries will use stale data
                { type: "navigateToCiePinScreen" }
              ],
              on: {
                "cie-pin-entered": [
                  {
                    guard: ({ event }) => event.isNfcEnabled,
                    target: "StartingCieAuthFlow",
                    actions: assign(({ event }) => ({
                      identification: { mode: "ciePin", pin: event.pin }
                    }))
                  },
                  {
                    target: "ActivateNfc",
                    actions: assign(({ event }) => ({
                      identification: { mode: "ciePin", pin: event.pin }
                    }))
                  }
                ],
                back: {
                  target:
                    "#itwEidIssuanceMachine.UserIdentification.ModeSelection"
                }
              }
            },
            ActivateNfc: {
              entry: "navigateToNfcInstructionsScreen",
              on: {
                "nfc-enabled": {
                  target: "StartingCieAuthFlow"
                },
                back: {
                  target: "InsertingCardPin"
                }
              }
            },
            StartingCieAuthFlow: {
              description:
                "Start the preliminary phase of the CIE identification flow.",
              entry: "navigateToCieReadCardScreen",
              tags: [ItwTags.Loading],
              invoke: {
                src: "startCieAuthFlow",
                input: ({ context }) => ({
                  walletAttestationContext: context.walletAttestationContext
                }),
                onDone: {
                  actions: assign(({ event }) => ({
                    cieAuthContext: event.output
                  })),
                  target: "ReadingCieCard"
                },
                onError: {
                  actions: assign(
                    setFailure(IssuanceFailureType.ISSUER_GENERIC)
                  ),
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
                "cie-identification-completed": {
                  target: "Completed",
                  actions: assign(({ context, event }) => {
                    assert(
                      context.cieAuthContext,
                      "cieAuthContext must be defined when completing CIE+pin flow"
                    );
                    return {
                      cieAuthContext: {
                        ...context.cieAuthContext,
                        callbackUrl: event.url
                      }
                    };
                  })
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
      entry: "navigateToEidRequestScreen",
      initial: "RequestingEid",
      states: {
        RequestingEid: {
          on: {
            back: { target: "#itwEidIssuanceMachine.UserIdentification" }
          },
          tags: [ItwTags.Loading],
          invoke: {
            src: "requestEid",
            input: ({ context }) => ({
              identification: context.identification,
              cieAuthContext: context.cieAuthContext,
              walletAttestationContext: context.walletAttestationContext
            }),
            onDone: {
              actions: assign(({ event }) => ({ eid: event.output })),
              target: "CheckingIdentityMatch"
            },
            onError: [
              {
                guard: "isNativeAuthSessionClosed",
                target: "#itwEidIssuanceMachine.UserIdentification"
              },
              {
                actions: assign(setFailure(IssuanceFailureType.ISSUER_GENERIC)),
                target: "#itwEidIssuanceMachine.Failure"
              }
            ]
          }
        },
        CheckingIdentityMatch: {
          description:
            "Checking whether the issued eID matches the identity of the currently logged-in user.",
          always: [
            {
              guard: "issuedEidMatchesAuthenticatedUser",
              target: "DisplayingPreview"
            },
            {
              actions: assign(
                setFailure(IssuanceFailureType.NOT_MATCHING_IDENTITY)
              ),
              target: "#itwEidIssuanceMachine.Failure"
            }
          ]
        },
        DisplayingPreview: {
          entry: "navigateToEidPreviewScreen",
          on: {
            "add-to-wallet": {
              actions: [
                "storeEidCredential",
                "setWalletInstanceToValid",
                "disposeWalletAttestation"
              ],
              target: "#itwEidIssuanceMachine.Success"
            },
            close: {
              actions: ["closeIssuance", "disposeWalletAttestation"]
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
          actions: ["closeIssuance", "disposeWalletAttestation"]
        },
        "request-assistance": {
          actions: "requestAssistance"
        },
        reset: {
          target: "Idle"
        }
      }
    },
    SessionExpired: {
      entry: ["handleSessionExpired"],
      always: { target: "TosAcceptance" }
    }
  }
});

export type ItwEidIssuanceMachine = typeof itwEidIssuanceMachine;
