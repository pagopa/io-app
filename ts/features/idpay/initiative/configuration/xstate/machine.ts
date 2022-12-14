import * as p from "@pagopa/ts-commons/lib/pot";

import { assign, createMachine } from "xstate";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { InstrumentDTO } from "../../../../../../definitions/idpay/wallet/InstrumentDTO";
import { Wallet } from "../../../../../types/pagopa";
import {
  LOADING_TAG,
  WAITING_USER_INPUT_TAG
} from "../../../../../utils/xstate";
import { ConfigurationMode, Context, INITIAL_CONTEXT } from "./context";
import { Events } from "./events";

type Services = {
  loadInitiative: {
    data: InitiativeDTO;
  };
  loadInstruments: {
    data: {
      pagoPAInstruments: ReadonlyArray<Wallet>;
      idPayInstruments: ReadonlyArray<InstrumentDTO>;
    };
  };
  addInstrument: {
    data: ReadonlyArray<InstrumentDTO>;
  };
};

const createIDPayInitiativeConfigurationMachine = () =>
  /** @xstate-layout N4IgpgJg5mDOIC5QCUDyqAqBiAigVQEkMBtABgF1FQAHAe1gEsAXB2gOypAA9EAOAVl4A6AMwAmUuICMvAOz8xvKbIA0IAJ6IpYgL461aTEIIARADIBRLAGUMAQWQYA+gGFUAOQBiBAOJ5kdhgEHmSUSCB0jCzsnDwIUiIiQgBspFL8srIAnKRZvKSKqhqIYuJCsmLJ-NX5ySIV9XoG6BjG7kQEdmYEAFqBwe5YEOxgQrBMAIZMo4atBO1BXb39IRSckcysHOFxUsoALEJSaXWS-MnJUln7apoIYhlCEiLapZnJWWL7sk0gs20dJZ9IIeIYjMaTaZCf7zQHdYEDYhSMI0eibGI7RAZW5aB5SISSLIJC4SZKVES-GELTrwlaDYZsUbjKYzFoAxa0kHuYhiFERNHRbagXYHI4nERnC5XG7Fe65cqSV78b4ifJZZKUtmwjnLLlCMyoOwmeY+JzazpBABqVgZowYbAAbrQANajAA2tAmEAIbE2UwYDrAoXWAq2sUQslIyRS5zEsmUvCq2iKdweSSysiqVTSidkvE1RmN1gACmY7ABNE1m9wYNBYdwWAAaJDW4Q2gvDCAzh2UMky8eq134OPipHOTxE-GuWRy+32Un2Bdabi8vn8VfmtmQeAAshYa9Z602W3z22HMV3ZD343JMukp-th7KM7IhI-rl8r5PSLxdPo-myK7eH4yAbu4W67vuGCHg2zZIqeoYYsKiDdkcN79veQ4jrwIiHJG1ykPG+w5n+zRGEBa6ge4pqbrWkEHlgABCdguAA0sGbaIUK3CIPO6a8PsIhEnGc6DskI5fk8ioZPO+xZhq-7-BRIFgRBe4McxbHwSGUTnshl7Xn2d6Do+I57Io5S8ES+xfDmZL5opgEeMB67UdWalQdY+qGsabm0du6nQWCjJCPaTqukIHpej64wAE4AK4ALZgGwTCwBxqK6UhPEII+0ZiOqAh1Jk3yCWZxyHFGDyXFcySyEJUhLkIymuTR4F0YFXlFqWFaqR1nlYEaJjuf1NYZfyWXcXE3yvvwLxXAU2hWd8I7WUcsbJHIU4ShSjnkc5lF9QFnlCENR30dgtqhY6LqjF63psHFSUpUw41ntl03jgVm3nPUV5fmZaSkCkuQ2RciY2YkTXdWWlZuS1ARck41h4C4LgWNYh5uDupYWBgFiuAdIF0m9XGdukZLlFmiSCQoWTVNhuEKlkIiXEJP4VFkTUI3STjuJgfMWBYJjC1g2O4-jhOrsTXKk5NnaPkkca4TZggXJGV4jhcwORi8lzvjOFR6P+bC0BAcCcLMOnolNiAALQLhJr6K9ocnKlZc0KWRczmBY1sdheK2ytVUkvIJ1zpJHTXmkCdL+3pOWTsIfb7HI9n09kKZaMkhz0-NCRzjndTR9Ssd6gaRpgYCVp+5x8uB1GRxyKnmaKBnGYjg8YhvnNCQJFGZJXD8e1zKXnIDOyFoENaTgVyLJjxx9KHyrh9Qs7VmZSJ3V4KvNOeqjn8bQwQJaw2BtaoIvtvxBI3e92I6S8DhewXGZEj8EcOd7DZVm-lG3NE1aiNY6B4r6dlwthSoMZ7KknpgoAB0sgH+Qul5Oe51OpgIvL+QGVkhBzWEgUZ+m0EEuSom1DyB4hAw16n5dqIDoKYP0nVYQv9iLiFIFGdIIhAaTgJAIPIpQZAFChiPZqgCyHAJQadEwvlyGjQwIwnKyYniFVKIPPYP4sirTjHg-Y9Mvg4WVIPY+p8aGmh5kjFGaMMbWEUSKIkb5PgLQEomB42E9jM1VImHC4hPgkMorzfmzgGzC2FnYvgYgtb1F3q8CQ+RSCLlERYgYhMcaWHxgvOuNtOxkjMnNJIFxZLTkPiIvQQA */
  createMachine(
    {
      context: INITIAL_CONTEXT,
      tsTypes: {} as import("./machine.typegen").Typegen0,
      schema: {
        context: {} as Context,
        events: {} as Events,
        services: {} as Services
      },
      id: "ROOT",
      predictableActionArguments: true,
      initial: "WAITING_START",
      on: {
        QUIT: {
          actions: "exitConfiguration"
        }
      },
      states: {
        WAITING_START: {
          tags: [LOADING_TAG],
          on: {
            START_CONFIGURATION: {
              target: "LOADING_INITIATIVE",
              actions: "startConfiguration"
            }
          }
        },
        LOADING_INITIATIVE: {
          tags: [LOADING_TAG],
          invoke: {
            src: "loadInitiative",
            id: "loadInitiative",
            onDone: [
              {
                target: "EVALUATING_INITIATIVE_CONFIGURATION",
                actions: "loadInitiativeSuccess"
              }
            ]
          }
        },
        EVALUATING_INITIATIVE_CONFIGURATION: {
          tags: [LOADING_TAG],
          always: [
            {
              cond: "isInstrumentsOnlyMode",
              target: "CONFIGURING_INSTRUMENTS"
            },
            {
              cond: "isInitiativeConfigurationNeeded",
              target: "DISPLAYING_INTRO"
            },
            {
              target: "CONFIGURATION_NOT_NEEDED"
            }
          ]
        },
        DISPLAYING_INTRO: {
          tags: [WAITING_USER_INPUT_TAG],
          entry: "navigateToConfigurationIntro",
          on: {
            NEXT: {
              target: "CONFIGURING_INSTRUMENTS"
            }
          }
        },
        CONFIGURING_INSTRUMENTS: {
          id: "INSTRUMENTS",
          initial: "LOADING_INSTRUMENTS",
          states: {
            LOADING_INSTRUMENTS: {
              tags: [LOADING_TAG],
              entry: "navigateToInstrumentsEnrollmentScreen",
              invoke: {
                src: "loadInstruments",
                id: "loadInstruments",
                onDone: {
                  target: "DISPLAYING_INSTRUMENTS",
                  actions: "loadInstrumentsSuccess"
                }
              }
            },
            DISPLAYING_INSTRUMENTS: {
              tags: [WAITING_USER_INPUT_TAG],
              on: {
                ADD_INSTRUMENT: {
                  target: "ADDING_INSTRUMENT",
                  actions: "selectInstrument"
                },
                BACK: [
                  {
                    cond: "isInstrumentsOnlyMode",
                    actions: "exitConfiguration"
                  },
                  {
                    target: "#ROOT.DISPLAYING_INTRO"
                  }
                ],
                NEXT: {
                  target: "INSTRUMENTS_COMPLETED"
                }
              }
            },
            ADDING_INSTRUMENT: {
              tags: [LOADING_TAG],
              invoke: {
                src: "addInstrument",
                id: "addInstrument",
                onDone: {
                  target: "DISPLAYING_INSTRUMENTS",
                  actions: "addInstrumentSuccess"
                }
              }
            },
            INSTRUMENTS_COMPLETED: {
              type: "final"
            }
          },
          onDone: [
            {
              cond: "isInstrumentsOnlyMode",
              target: "CONFIGURATION_COMPLETED"
            },
            {
              target: "DISPLAYING_CONFIGURATION_SUCCESS"
            }
          ]
        },
        DISPLAYING_CONFIGURATION_SUCCESS: {
          tags: [WAITING_USER_INPUT_TAG],
          entry: "navigateToConfigurationSuccessScreen",
          on: {
            COMPLETE_CONFIGURATION: {
              target: "CONFIGURATION_COMPLETED"
            }
          }
        },
        CONFIGURATION_NOT_NEEDED: {
          tags: [WAITING_USER_INPUT_TAG],
          entry: "navigateToConfigurationSuccessScreen",
          on: {
            COMPLETE_CONFIGURATION: {
              target: "CONFIGURATION_COMPLETED"
            }
          }
        },
        CONFIGURATION_COMPLETED: {
          type: "final",
          entry: "navigateToInitiativeDetailScreen"
        }
      }
    },
    {
      actions: {
        startConfiguration: assign((_, event) => ({
          initiativeId: event.initiativeId,
          mode: event.mode
        })),
        loadInitiativeSuccess: assign((_, event) => ({
          initiative: p.some(event.data)
        })),
        loadInstrumentsSuccess: assign((_, event) => ({
          pagoPAInstruments: p.some(event.data.pagoPAInstruments),
          idPayInstruments: p.some(event.data.idPayInstruments)
        })),
        selectInstrument: assign((_, event) => ({
          selectedInstrumentId: event.walletId
        })),
        addInstrumentSuccess: assign((_, event) => ({
          idPayInstruments: p.some(event.data),
          selectedInstrumentId: undefined
        }))
      },
      guards: {
        isInitiativeConfigurationNeeded: (context, _) =>
          p.getOrElse(
            p.map(
              context.initiative,
              i => i.status === StatusEnum.NOT_REFUNDABLE
            ),
            false
          ),

        isInstrumentsOnlyMode: (context, _) =>
          context.mode === ConfigurationMode.INSTRUMENTS
      }
    }
  );

type IDPayInitiativeConfigurationMachineType = ReturnType<
  typeof createIDPayInitiativeConfigurationMachine
>;

export type { IDPayInitiativeConfigurationMachineType };
export { createIDPayInitiativeConfigurationMachine };
