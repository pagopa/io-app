/* eslint-disable sonarjs/no-identical-functions */
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { flow, pipe } from "fp-ts/lib/function";
import {
  assertEvent,
  assign,
  forwardTo,
  fromCallback,
  fromPromise,
  setup
} from "xstate";
import { IbanDTO } from "../../../../../definitions/idpay/IbanDTO";
import { IbanListDTO } from "../../../../../definitions/idpay/IbanListDTO";
import { IbanPutDTO } from "../../../../../definitions/idpay/IbanPutDTO";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../definitions/idpay/InitiativeDTO";
import {
  InstrumentDTO,
  StatusEnum as InstrumentStatusEnum
} from "../../../../../definitions/idpay/InstrumentDTO";
import { Wallet } from "../../../../types/pagopa";
import {
  LOADING_TAG,
  UPSERTING_TAG,
  WAITING_USER_INPUT_TAG,
  notImplementedStub
} from "../../../../xstate/utils";
import { ConfigurationMode, InstrumentStatusByIdWallet } from "../types";
import { InitiativeFailure, InitiativeFailureType } from "../types/failure";
import * as Context from "./context";
import * as Events from "./events";

/** PLEASE DO NO USE AUTO-LAYOUT WHEN USING VISUAL EDITOR */
export const idPayConfigurationMachine = setup({
  types: {
    context: {} as Context.Context,
    events: {} as Events.Events
  },
  actions: {
    navigateToConfigurationIntro: notImplementedStub,
    navigateToIbanEnrollmentScreen: notImplementedStub,
    navigateToIbanOnboardingScreen: notImplementedStub,
    navigateToIbanOnboardingFormScreen: notImplementedStub,
    showUpdateIbanToast: notImplementedStub,
    navigateToInstrumentsEnrollmentScreen: notImplementedStub,
    navigateToConfigurationSuccessScreen: notImplementedStub,
    navigateToInitiativeDetailScreen: notImplementedStub,
    updateAllInstrumentsStatus: assign(({ context }) => {
      const updatedStatuses =
        context.initiativeInstruments.reduce<InstrumentStatusByIdWallet>(
          (acc, instrument) => {
            if (instrument.idWallet === undefined) {
              return acc;
            }

            const currentStatus = acc[instrument.idWallet];

            if (currentStatus !== undefined && pot.isLoading(currentStatus)) {
              // Instrument is updating, its status will be updated by 'updateInstrumentStatus' action
              return acc;
            }

            return {
              ...acc,
              [instrument.idWallet]: pot.some(instrument.status)
            };
          },
          context.instrumentStatuses
        );

      return {
        instrumentStatuses: updatedStatuses
      };
    }),
    updateInstrumentStatus: assign(({ context, event }) => {
      assertEvent(event, ["enroll-instrument", "delete-instrument"]);
      return {
        instrumentStatuses: {
          ...context.instrumentStatuses,
          [event.walletId]: pot.noneLoading
        }
      };
    }),
    updateInstrumentStatusSuccess: assign(({ context, event }) => {
      assertEvent(event, "update-instrument-success");

      const currentEnrollStatus = context.instrumentStatuses[event.walletId];

      if (pot.isSome(currentEnrollStatus)) {
        // No need to update instrument status
        return {};
      }

      const status = event.enrolling
        ? InstrumentStatusEnum.PENDING_ENROLLMENT_REQUEST
        : InstrumentStatusEnum.PENDING_DEACTIVATION_REQUEST;

      return {
        instrumentStatuses: {
          ...context.instrumentStatuses,
          [event.walletId]: pot.some(status)
        }
      };
    }),
    updateInstrumentStatusFailure: assign(({ context, event }) => {
      assertEvent(event, "update-instrument-failure");

      const { [event.walletId]: _removedStatus, ...updatedStatuses } =
        context.instrumentStatuses;

      return {
        instrumentStatuses: updatedStatuses
      };
    }),
    showFailureToast: notImplementedStub,
    exitConfiguration: notImplementedStub
  },
  actors: {
    getInitiative: fromPromise<InitiativeDTO, string>(notImplementedStub),
    getIbanList: fromPromise<IbanListDTO>(notImplementedStub),
    getWalletInstruments:
      fromPromise<ReadonlyArray<Wallet>>(notImplementedStub),
    getInitiativeInstruments: fromPromise<ReadonlyArray<InstrumentDTO>, string>(
      notImplementedStub
    ),
    instrumentsEnrollmentLogic: fromCallback<Events.Events, string>(
      notImplementedStub
    ),
    enrollIban: fromPromise<
      undefined,
      { initiativeId: string; iban: IbanDTO | IbanPutDTO }
    >(notImplementedStub)
  },
  guards: {
    isInstrumentsOnlyMode: ({ context }) =>
      context.mode === ConfigurationMode.INSTRUMENTS,
    isIbanOnlyMode: ({ context }) => context.mode === ConfigurationMode.IBAN,
    isConfigurationRequired: ({ context }) =>
      pipe(
        context.initiative,
        O.map(i => i.status === StatusEnum.NOT_REFUNDABLE),
        O.getOrElse(() => false)
      ),
    hasIbanList: ({ context }) => context.ibanList.length > 0,
    hasInstruments: ({ context }) => context.walletInstruments.length > 0
  },
  delays: {
    INSTRUMENTS_POLLING_INTERVAL: 3000
  }
}).createMachine({
  context: Context.Context,
  id: "idpay-configuration",
  initial: "Idle",
  on: {
    close: {
      target: "#idpay-configuration.ConfigurationClosed"
    }
  },
  states: {
    Idle: {
      tags: [LOADING_TAG],
      on: {
        "start-configuration": {
          guard: ({ event }) => event.initiativeId.length > 0,
          actions: assign(({ event }) => ({
            initiativeId: event.initiativeId,
            mode: event.mode
          })),
          target: "LoadingInitiative"
        }
      }
    },

    LoadingInitiative: {
      tags: [LOADING_TAG],
      invoke: {
        src: "getInitiative",
        id: "getInitiative",
        input: ({ context }) => context.initiativeId,
        onDone: {
          actions: assign(({ event }) => ({
            initiative: O.some(event.output)
          })),
          target: "EvaluatingInitiativeConfiguration"
        },
        onError: {
          actions: assign(({ event }) => ({
            failure: pipe(InitiativeFailure.decode(event.error), O.fromEither)
          })),
          target: "ConfigurationFailure"
        }
      }
    },

    EvaluatingInitiativeConfiguration: {
      tags: [LOADING_TAG],
      always: [
        {
          guard: "isInstrumentsOnlyMode",
          target: "ConfiguringInstruments"
        },
        {
          guard: "isIbanOnlyMode",
          target: "ConfiguringIban"
        },
        {
          guard: "isConfigurationRequired",
          target: "DisplayingConfigurationIntro"
        },
        {
          target: "ConfigurationNotNeeded"
        }
      ]
    },

    DisplayingConfigurationIntro: {
      tags: [WAITING_USER_INPUT_TAG],
      entry: "navigateToConfigurationIntro",
      on: {
        next: {
          target: "ConfiguringIban"
        }
      }
    },

    ConfiguringIban: {
      id: "configuration-iban",
      initial: "LoadingIbanList",
      entry: "navigateToIbanEnrollmentScreen",
      states: {
        LoadingIbanList: {
          tags: [LOADING_TAG],
          invoke: {
            src: "getIbanList",
            id: "getIbanList",
            onDone: {
              actions: assign(({ event }) => ({
                ibanList: event.output.ibanList
              })),
              target: "EvaluatingIbanList"
            },
            onError: [
              {
                guard: "isIbanOnlyMode",
                actions: assign(({ event }) => ({
                  failure: decodeFailure(event.error)
                })),
                target: "#idpay-configuration.ConfigurationFailure"
              },
              {
                actions: [
                  assign(({ event }) => ({
                    failure: decodeFailure(event.error)
                  })),
                  "showFailureToast"
                ],
                target: "#idpay-configuration.DisplayingConfigurationIntro"
              }
            ]
          }
        },

        EvaluatingIbanList: {
          tags: [LOADING_TAG],
          always: [
            {
              guard: "hasIbanList",
              target: "DisplayingIbanList"
            },
            {
              target: "DisplayingIbanOnboardingLanding"
            }
          ]
        },

        DisplayingIbanOnboardingLanding: {
          tags: [WAITING_USER_INPUT_TAG],
          entry: "navigateToIbanOnboardingScreen",
          on: {
            next: {
              target: "DisplayingIbanOnboardingForm"
            },
            back: [
              {
                guard: "isIbanOnlyMode",
                target: "#idpay-configuration.ConfigurationClosed"
              },
              {
                target: "#idpay-configuration.DisplayingConfigurationIntro"
              }
            ]
          }
        },

        DisplayingIbanOnboardingForm: {
          tags: [WAITING_USER_INPUT_TAG],
          entry: "navigateToIbanOnboardingFormScreen",
          on: {
            back: [
              {
                guard: "hasIbanList",
                target: "DisplayingIbanList"
              },
              {
                target: "DisplayingIbanOnboardingLanding"
              }
            ],
            "confirm-iban-onboarding": {
              target: "OnboardingNewIban"
            }
          }
        },

        OnboardingNewIban: {
          tags: [LOADING_TAG],
          invoke: {
            src: "enrollIban",
            id: "enrollIban",
            input: ({ context, event }) => {
              assertEvent(event, "confirm-iban-onboarding");
              return {
                initiativeId: context.initiativeId,
                iban: event.ibanBody
              };
            },
            onDone: {
              target: "IbanConfigurationCompleted"
            },
            onError: {
              actions: [
                assign(({ event }) => ({
                  failure: decodeFailure(event.error)
                })),
                "showFailureToast"
              ],
              target: "DisplayingIbanOnboardingForm"
            }
          }
        },

        DisplayingIbanList: {
          tags: [WAITING_USER_INPUT_TAG],
          entry: "navigateToIbanEnrollmentScreen",
          on: {
            back: [
              {
                guard: "isIbanOnlyMode",
                target: "#idpay-configuration.ConfigurationClosed"
              },
              {
                target: "#idpay-configuration.DisplayingConfigurationIntro"
              }
            ],
            "new-iban-onboarding": {
              target: "DisplayingIbanOnboardingForm"
            },
            "enroll-iban": {
              target: "EnrollingIban"
            }
          }
        },

        EnrollingIban: {
          tags: [UPSERTING_TAG],
          invoke: {
            src: "enrollIban",
            id: "enrollIban",
            input: ({ context, event }) => {
              assertEvent(event, "enroll-iban");
              return {
                initiativeId: context.initiativeId,
                iban: event.iban
              };
            },
            onDone: [
              {
                guard: "isIbanOnlyMode",
                target: "DisplayingIbanList",
                actions: "showUpdateIbanToast"
              },
              {
                target: "IbanConfigurationCompleted"
              }
            ],
            onError: [
              {
                target: "DisplayingIbanList",
                actions: "showFailureToast"
              }
            ]
          }
        },

        IbanConfigurationCompleted: {
          type: "final"
        }
      },
      onDone: [
        {
          guard: "isIbanOnlyMode",
          target: "ConfigurationCompleted"
        },
        {
          target: "#idpay-configuration.ConfiguringInstruments"
        }
      ]
    },

    ConfiguringInstruments: {
      id: "configuration-instruments",
      initial: "LoadingInstruments",
      states: {
        LoadingInstruments: {
          tags: [LOADING_TAG],
          entry: "navigateToInstrumentsEnrollmentScreen",
          type: "parallel",
          states: {
            LoadingWalletInstruments: {
              initial: "Loading",
              states: {
                Loading: {
                  invoke: {
                    src: "getWalletInstruments",
                    id: "getWalletInstruments",
                    input: ({ context }) => context.initiativeId,
                    onDone: {
                      actions: assign(({ event }) => ({
                        walletInstruments: event.output
                      })),
                      target: "Success"
                    },
                    onError: [
                      {
                        guard: "isInstrumentsOnlyMode",
                        actions: assign(({ event }) => ({
                          failure: decodeFailure(event.error)
                        })),
                        target: "#idpay-configuration.ConfigurationFailure"
                      },
                      {
                        actions: [
                          assign(({ event }) => ({
                            failure: decodeFailure(event.error)
                          })),
                          "showFailureToast"
                        ],
                        target: "#idpay-configuration.ConfiguringIban"
                      }
                    ]
                  }
                },
                Success: {
                  type: "final"
                }
              }
            },

            LoadingInitiativeInstruments: {
              initial: "Loading",
              states: {
                Loading: {
                  invoke: {
                    src: "getInitiativeInstruments",
                    id: "getInitiativeInstruments",
                    input: ({ context }) => context.initiativeId,
                    onDone: {
                      actions: assign(({ event }) => ({
                        initiativeInstruments: event.output
                      })),
                      target: "Success"
                    },
                    onError: [
                      {
                        guard: "isInstrumentsOnlyMode",
                        actions: assign(({ event }) => ({
                          failure: decodeFailure(event.error)
                        })),
                        target: "#idpay-configuration.ConfigurationFailure"
                      },
                      {
                        actions: [
                          assign(({ event }) => ({
                            failure: decodeFailure(event.error)
                          })),
                          "showFailureToast"
                        ],
                        target: "#idpay-configuration.ConfiguringIban"
                      }
                    ]
                  }
                },
                Success: {
                  type: "final"
                }
              }
            }
          },
          onDone: [
            {
              guard: "hasInstruments",
              target: "DisplayingInstruments"
            },
            {
              guard: "isInstrumentsOnlyMode",
              target: "DisplayingInstruments"
            },
            {
              target: "#idpay-configuration.DisplayingConfigurationSuccess"
            }
          ]
        },

        DisplayingInstruments: {
          tags: [WAITING_USER_INPUT_TAG],
          entry: "updateAllInstrumentsStatus",
          initial: "DisplayingInstrument",
          invoke: {
            id: "instrumentsEnrollment",
            src: "instrumentsEnrollmentLogic",
            input: ({ context }) => context.initiativeId
          },
          on: {
            "enroll-instrument": {
              actions: [
                forwardTo("instrumentsEnrollment"),
                "updateInstrumentStatus"
              ]
            },

            "delete-instrument": {
              actions: [
                forwardTo("instrumentsEnrollment"),
                "updateInstrumentStatus"
              ]
            },

            "update-instrument-success": {
              actions: "updateInstrumentStatusSuccess"
            },

            "update-instrument-failure": {
              actions: "updateInstrumentStatusFailure"
            },

            back: [
              {
                guard: "isInstrumentsOnlyMode",
                target: "#idpay-configuration.ConfigurationClosed"
              },
              {
                target: "#idpay-configuration.ConfiguringIban"
              }
            ],

            next: {
              target: "InstrumentsConfigurationCompleted"
            },

            "skip-instruments": {
              target: "InstrumentsConfigurationCompleted",
              actions: assign(() => ({ areInstrumentsSkipped: true }))
            }
          },
          states: {
            DisplayingInstrument: {
              after: {
                INSTRUMENTS_POLLING_INTERVAL: {
                  target: "RefreshingInstrumentState"
                }
              }
            },
            RefreshingInstrumentState: {
              invoke: {
                src: "getInitiativeInstruments",
                id: "getInitiativeInstruments",
                input: ({ context }) => context.initiativeId,
                onDone: {
                  target: "DisplayingInstrument",
                  actions: [
                    assign(({ event }) => ({
                      initiativeInstruments: event.output
                    })),
                    "updateAllInstrumentsStatus"
                  ]
                },
                onError: [
                  {
                    target: "DisplayingInstrument",
                    actions: [
                      assign(({ event }) => ({
                        failure: decodeFailure(event.error)
                      })),
                      "showFailureToast"
                    ]
                  }
                ]
              }
            }
          }
        },

        InstrumentsConfigurationCompleted: {
          type: "final"
        }
      },
      onDone: [
        {
          guard: "isInstrumentsOnlyMode",
          target: "ConfigurationCompleted"
        },
        {
          target: "DisplayingConfigurationSuccess"
        }
      ]
    },

    DisplayingConfigurationSuccess: {
      tags: [WAITING_USER_INPUT_TAG],
      entry: "navigateToConfigurationSuccessScreen",
      on: {
        next: {
          target: "ConfigurationCompleted"
        }
      }
    },

    ConfigurationNotNeeded: {
      tags: [WAITING_USER_INPUT_TAG],
      entry: "navigateToConfigurationSuccessScreen",
      on: {
        next: {
          target: "ConfigurationCompleted"
        }
      }
    },

    ConfigurationCompleted: {
      type: "final",
      entry: "navigateToInitiativeDetailScreen"
    },

    ConfigurationClosed: {
      type: "final",
      entry: "exitConfiguration"
    },

    ConfigurationFailure: {
      type: "final",
      always: {
        guard: ({ context }) =>
          pipe(
            context.failure,
            O.map(f => f === InitiativeFailureType.SESSION_EXPIRED),
            O.getOrElse(() => false)
          ),
        actions: "exitConfiguration"
      },
      entry: ["showFailureToast", "exitConfiguration"]
    }
  }
});

const decodeFailure = flow(InitiativeFailure.decode, O.fromEither);
