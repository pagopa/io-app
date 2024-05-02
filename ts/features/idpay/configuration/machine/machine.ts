/* eslint-disable sonarjs/no-identical-functions */
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
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
import * as Input from "./input";

/** PLEASE DO NO USE AUTO-LAYOUT WHEN USING VISUAL EDITOR */
export const idPayConfigurationMachine = setup({
  types: {
    input: {} as Input.Input,
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
    handleSessionExpired: notImplementedStub,
    showFailureToast: notImplementedStub,
    exitConfiguration: notImplementedStub
  },
  actors: {
    onInit: fromPromise<Context.Context, Input.Input>(({ input }) =>
      Input.Input(input)
    ),
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
    isSessionExpired: ({ context }) =>
      pipe(
        context.failure,
        O.map(failure => failure === InitiativeFailureType.SESSION_EXPIRED),
        O.getOrElse(() => false)
      ),
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
  invoke: {
    src: "onInit",
    input: ({ event }) => {
      assertEvent(event, "xstate.init");
      return event.input;
    },
    onError: {
      target: ".ConfigurationFailure"
    },
    onDone: {
      actions: assign(event => ({ ...event.event.output })),
      target: ".LoadingInitiative"
    }
  },
  initial: "Idle",
  on: {
    close: {
      target: "#idpay-configuration.ConfigurationClosed"
    }
  },
  states: {
    Idle: {
      tags: [LOADING_TAG]
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
      states: {
        LoadingIbanList: {
          tags: [LOADING_TAG],
          invoke: {
            src: "getIbanList",
            id: "getIbanList",
            onDone: [
              {
                actions: assign(({ event }) => ({
                  ibanList: event.output.ibanList
                }))
              },
              [
                {
                  guard: "hasIbanList",
                  target: ".DisplayingIbanList"
                },
                {
                  target: ".DisplayingIbanOnboarding"
                }
              ]
            ],
            onError: [
              {
                actions: assign(({ event }) => ({
                  failure: pipe(
                    InitiativeFailure.decode(event.error),
                    O.fromEither
                  )
                }))
              },
              [
                {
                  guard: "isSessionExpired",
                  target: "SessionExpired"
                },
                {
                  guard: "isIbanOnlyMode",
                  target: "#idpay-configuration.ConfigurationFailure"
                },
                {
                  target: "#idpay-configuration.DisplayingConfigurationIntro",
                  actions: "showFailureToast"
                }
              ]
            ]
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
              target: "DisplayingIbanOnboarding"
            },
            "enroll-iban": {
              target: "EnrollingIban"
            }
          }
        },

        DisplayingIbanOnboarding: {
          tags: [WAITING_USER_INPUT_TAG],
          entry: "navigateToIbanOnboardingScreen",
          on: {
            back: [
              {
                guard: "hasIbanList",
                target: "DisplayingIbanList"
              },
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
                target: "DisplayingIbanOnboarding"
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
            onError: [
              {
                actions: assign(({ event }) => ({
                  failure: pipe(
                    InitiativeFailure.decode(event.error),
                    O.fromEither
                  )
                }))
              },
              [
                {
                  guard: "isSessionExpired",
                  target: "#idpay-configuration.SessionExpired"
                },
                {
                  target: "DisplayingIbanOnboardingForm",
                  actions: "showFailureToast"
                }
              ]
            ]
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
                guard: "isSessionExpired",
                target: "#idpay-configuration.SessionExpired"
              },
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
              initial: "LOADING",
              invoke: {
                src: "getWalletInstruments",
                id: "getWalletInstruments",
                input: ({ context }) => context.initiativeId,
                onDone: {
                  actions: assign(({ event }) => ({
                    walletInstruments: event.output
                  }))
                },
                onError: [
                  {
                    actions: assign(({ event }) => ({
                      failure: pipe(
                        InitiativeFailure.decode(event.error),
                        O.fromEither
                      )
                    }))
                  },
                  [
                    {
                      guard: "isSessionExpired",
                      target: "#idpay-configuration.SessionExpired"
                    },
                    {
                      guard: "isInstrumentsOnlyMode",
                      target: "#idpay-configuration.ConfigurationFailure"
                    },
                    {
                      target: "#idpay-configuration.ConfiguringIban",
                      actions: "showFailureToast"
                    }
                  ]
                ]
              }
            },

            LoadingInitiativeInstruments: {
              initial: "LOADING",
              invoke: {
                src: "getInitiativeInstruments",
                id: "getInitiativeInstruments",
                input: ({ context }) => context.initiativeId,
                onDone: {
                  actions: assign(({ event }) => ({
                    initiativeInstruments: event.output
                  }))
                },
                onError: [
                  {
                    actions: assign(({ event }) => ({
                      failure: pipe(
                        InitiativeFailure.decode(event.error),
                        O.fromEither
                      )
                    }))
                  },
                  [
                    {
                      guard: "isSessionExpired",
                      target: "#idpay-configuration.SessionExpired"
                    },
                    {
                      guard: "isInstrumentsOnlyMode",
                      target: "#idpay-configuration.ConfigurationFailure"
                    },
                    {
                      target: "#idpay-configuration.ConfiguringIban",
                      actions: "showFailureToast"
                    }
                  ]
                ]
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
          initial: "DISPLAYING",
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
                    actions: assign(({ event }) => ({
                      failure: pipe(
                        InitiativeFailure.decode(event.error),
                        O.fromEither
                      )
                    }))
                  },
                  [
                    {
                      guard: "isSessionExpired",
                      target: "#idpay-configuration.SessionExpired"
                    },
                    {
                      target: "DisplayingInstrument",
                      actions: "showFailureToast"
                    }
                  ]
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
        guard: "isSessionExpired",
        target: "#idpay-configuration.SessionExpired"
      },
      entry: ["showFailureToast", "exitConfiguration"]
    },

    SessionExpired: {
      type: "final",
      entry: ["handleSessionExpired", "exitConfiguration"]
    }
  }
});
