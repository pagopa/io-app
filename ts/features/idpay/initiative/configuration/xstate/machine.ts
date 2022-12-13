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
  /** @xstate-layout N4IgpgJg5mDOIC5QEkAiAFAggTQPrIDlkAVZTUgNQFFcBhAeQIDFkBxAVQCVzlGBiAIrsSAbQAMAXUSgADgHtYASwAuiuQDtpIAB6IAjAGYxADgB0YgJwB2AGwX7VgEw3jLgDQgAnvscBfXx5oWHiEJGSUNAzMbFw8jKYA6phhBKz4RKQ81LgAylQAMlS0pPx5hcXpYVlU4lJIIPJKqhpauggGACx6psYArHq9NnYWHdZGHR7eCDZWvaYWQ44dNnozYp1+ASBBOJWZEXSMLBzcJQSm+fSYqIRpofvI1HwQGmCmiuoAbnIA1m8ANnIAIYQZDqFSKIGqT5gWpaRoQlr1NrGDpzCx6DomVZ9AyuKyTRAzKymZY2RyDAYdDrjfyBDC7e7hR6RI4xU68c5UCiYfLsUipPbM7JRY6xM58OH1BHNTTI-Q0gymGwdVHGPSosRiFx6QnTEamKy2TGqyxLCybenBIXVQ7RE5xLk8vkCu4ZYWs+3izmSvR1WQKRFy0BtTEGJUqtUarHa9V6qzUnq9Ea9MSOYwmWa9OnbBkhd220Xsx2mIsnW42iJ8HLETCcYh2sUcxhSgNNNTBnSIRyWJVpgyp6lWCxiXqovU2ZOmAcphw2cbGHM7fNVA5l73xS7XCuEGucdgAWSoBGIOWer3eX1+AOBoPUsGUACcAK4AWzA6mUsFbDUDsta3aYiSMx6BaRoWKijgGHqowdKYhjpvY6yOBqGJLnmlYso2xZnKYNw5Og+Q4DuBB7oex6nnwrD0LgABCmC0AA0j+ModgBCBhhGqqqtGWo6hOiaOMaSx6JYHRQXo6HWkyhZsg6uH4YRxGCruxD7keJ5ntcqDpGRGnECxf5sfKHGKsq3Hqpqsa6l43a2KS2qONYXSdL0qpSYyBZrnJG7nIpRHYCRekUWeRacAeulqeRmmGe2SIhgq4bmVGVn8bZ7ROEmIxDrMYiYm5Hkrg8Io+c25zaUFUX6ee6hvB83x-KYIJ3g+L7vp+sVBuxAwmPBw5WAYFIoQYhjQelGqOPMvQjVYWrOC4CbZlsy6YSVXplXhyAEQFFbrmVuTsLQtBUDkoX0AehFUMQnpNo6nX-iZPYWH2UGDh0w6juO6UGJlfTZe9uX5R0-hbOocgQHAWgrTJ3nrY68JGfFXYIAAtDZUwWHMaIje9BgrL0yZOIVq03ThnKJMkrok7kBRFGcCNxZ2bTvRO9ikuJGYjNYI56JJy0YTDWF7SWW43CpXksgzXUmW5WPYxSvPkiMBLpTM6Ic3ojhLFYqwWMTgtrbduHcry-IkauQulfD0qI0z+hiKqyp5cmP1QeqmusxY7PpmJ3N5XzVqeRbhtk-Ee3m8VVBSw9CUcQmk0TZ0A1WMYIyrBOePTsmyxCRSvROFY+sSyH8nk6LlXqSF0fGbHUGzaYQkDp985oiMMFs391IiXoKdpkXwek6X8T+cpbrBZp1dI6GhhmD9g7anlsyzHqKE2PMTkJkYYhLxmS2B0VHrYUP5WoGLY9VRRk923HKGGqmo5ppYat6qBJKdPOmMjQsWIQf3kdH75Ta21R4AP2jkQ6x1TpX26k4bouUH5PWft9UYWUhy9CWOmKCNg-6H2FrhPBnJDgXUKNdVA0DHo-TEA3AaqYxwt2znqToZgbBiXEniMcKFC782ksXQegCCGMFwAQegDYCBUCoKgCR5DY491vvA1MiDl7pQTN0Tu4FnCuBGiDXwQA */
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
      initial: "IDLE",
      on: {
        QUIT: {
          actions: "exitConfiguration"
        }
      },
      states: {
        IDLE: {
          tags: [WAITING_USER_INPUT_TAG],
          on: {
            START_CONFIGURATION: {
              target: "INITIALIZATION",
              actions: "startConfiguration"
            }
          }
        },
        INITIALIZATION: {
          id: "INITIALIZATION",
          initial: "LOADING_INITIATIVE",
          states: {
            LOADING_INITIATIVE: {
              tags: [LOADING_TAG],
              invoke: {
                src: "loadInitiative",
                id: "loadInitiative",
                onDone: [
                  {
                    target: "INITIATIVE_LOADED",
                    actions: "loadInitiativeSuccess"
                  }
                ]
              }
            },
            INITIATIVE_LOADED: {
              type: "final"
            }
          },
          onDone: [
            {
              cond: "isInstrumentsOnlyMode",
              target: "#ROOT.CONFIGURING_INSTRUMENTS"
            },
            {
              cond: "isInitiativeConfigurationNeeded",
              target: "#ROOT.DISPLAYING_CONFIG_INTRO"
            },
            {
              target: "#ROOT.CONFIGURATION_NOT_NEEDED"
            }
          ]
        },
        DISPLAYING_CONFIG_INTRO: {
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
                onDone: [
                  {
                    target: "DISPLAYING_INSTRUMENTS",
                    actions: "loadInstrumentsSuccess"
                  }
                ]
              }
            },
            DISPLAYING_INSTRUMENTS: {
              tags: [WAITING_USER_INPUT_TAG],
              on: {
                ADD_INSTRUMENT: {
                  target: "ADDING_INSTRUMENT",
                  actions: "selectInstrument"
                }
              }
            },
            ADDING_INSTRUMENT: {
              tags: [LOADING_TAG],
              invoke: {
                src: "addInstrument",
                id: "addInstrument",
                onDone: [
                  {
                    target: "DISPLAYING_INSTRUMENTS",
                    actions: "addInstrumentSuccess"
                  }
                ]
              }
            }
          },
          on: {
            NEXT: [
              {
                cond: "isInstrumentsOnlyMode",
                target: "CONFIGURATION_COMPLETED"
              },
              {
                target: "#ROOT.DISPLAYING_CONFIGURATION_SUCCESS"
              }
            ],
            BACK: [
              {
                cond: "isInstrumentsOnlyMode",
                actions: "exitConfiguration"
              },
              {
                target: "#ROOT.DISPLAYING_CONFIG_INTRO"
              }
            ]
          }
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
