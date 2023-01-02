import * as p from "@pagopa/ts-commons/lib/pot";

import { assign, createMachine } from "xstate";
import { IbanListDTO } from "../../../../../../definitions/idpay/iban/IbanListDTO";
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
  loadIbanList: {
    data: IbanListDTO;
  };
};

const createIDPayInitiativeConfigurationMachine = () =>
  /** @xstate-layout N4IgpgJg5mDOIC5QCUDyqAqBiAigVQEkMBtABgF1FQAHAe1gEsAXB2gOypAA9EBGAFgCc-AHQBmAKykATAA4AbBImzSY3gHYANCACefaQF8D2tJhEB1AIJECAOQDiAfQDKGS8myv3GRwGFUtgBiBPZ4yJYYBAFklEggdIws7Jw8CNLp4vxi6vKSYvK8srI52noIhdIisrzSEnLq0uq8ioJGJugYIgAyqJYAInZOdjYRBABqAKJYEOxgIgxsAG60ANZzADa0AIYQBGzMDFssi2AxnAkHyXGpORIitaSksvzSghK8pPz8pXzP4tK8QSkeSkGrqWQSMRtECmToTMaWLp4UYORzDSKjSZ+ALBULhSIBLBnOIXJIca6IfjqURiYG1YSgyGqH4IRTqEQFYrydRiYQCfLQ2EieGI5GRVHogiYibYoIhMKjQnEXixGj0S7k0CpfgSGl0iQM3hMsQst6iQTyWofOpiIpfQUdYUIpEooa2EaRLH+OV4xW2InSVXxdVklKIbKVfjFOqCIFAgq8FmFdSCKoW2SxyE6rKyB1mEUu8Vuj3jGXe3EKgn+4hiIOk1ia7iU6nifWG40s96iFPZBqCakKIp5zoDZwABS6lgAmoM0bYMGgsLYJgANEgUc4hhthtJZUjiW2kdQ5eRZD5aXSIaSPdl7tnAoqNdTD7q9AYSgBCln9MzYcwWyxrCImw7AQABGWxsF0DCwEwxJqok24UggEgXmU6RyPcpDCNIagQtyArGDCjqWM4zgTB4s4EF+tiyhW+JRLRy4TH0LFEhuJJblcWqUl8raWga-CMrSJqXuUjz7kCjyFM0BRiJIL6keRlGft+dHygxASOMxrF9ESKqboh3FNgg-Cnvx9JCUaIksuoqgiEolrqFI+S8o0L6jhO05UTRjgBB+vTIO+9hLqu651lxjapB8YiiLhzkZjJoJRqagiyCI2HKBIlqvM02UeQQ46TjOqm0f5gXBVgX6+AA0vBwZGVFfAyHF2TKIISUCLISYfPIIgdbUOqfCC8iCIYRFCv0wVojRoVrvV9bGdFVJiOIlryBmx4Zk8iZiXyGV0mZrw8ka43tGYU0+d+VWWLVC2RTuMWtQlHXVMl3V7VSHLKPJry2mNnwvuWBDIAAsldP6zPMSyrHMADG7AAGYMAATgAtuBkH3Y1O4RiIUbOa8cbArwu1lM0jwZTU7wWqhwK8kDOIg+DpVYGAKMo7QKMiNQ6xHIjXNoyICNsMj6OY2w2Marjlr49GRPYSTZNXjU+4GoeR7ZKN0jyIzPphFRtiuMgeCgxM87ONMUOwUccxCsDeKG8bpvmxgzhS6GyGAhoIgaEojl2XI0hJqhvC+-IuSAqoN4vHr9FOwuLsW1bf4iDbTB246DsGxKRuJ2bFvKhFONex17J+-73IyLIwdiRoAj9QNfJiACLcSHHGkJybBdu6+-Rd0nbsp-+MNASBuxsLBKMAK5o2AbBMLAHtITxCBvKmgJCfwNQqAUKV11XIjUtktNqDqAgd47ufOz3zgiJ5xUD7fWBTXON+u8vS2IGl+7b1Jo1SBrimJMUZKjvCtLTOyuRWgTSzkzK+bp34W3voVLyJVEH51dpbaqdUOIIWll7DQfUoG5GvGQg08gQ7AnxrUbkKgXiFFyJfHOGDu5YJQUVby19MHJxwUXQyBDV5R3Ls5Sugca5JljOlfI2VISSGyhtfgzDkBP3YQ-LhrDB6W2XPNPBDVBEmQEKNI+1QNrZGeHyJMDQw6nl4GoWkFojykHbrAsw2cVHcLYcgy6njB7D2hoBOYOwJ5T1nvPOCejFpNTXgaX2DJt5yBJvvcmqF0p2OcnGZo0YCqcPQepX0VYXB4F8L4CYZEsD+FBhOCYGAyzwMrIxT+0SrTEMjlGWM-ZsKiXJk0VaUZARKCjNhMyLjzqdHcX6bSmBtITBYmxSp1Tan5IadESJD0vaPHSg8UmIIAR00oWJcBDkcw1FwooBQUJoRsFoBAOAnBYQCM9qvAAtMrNeogBKgnkjtEEsYXxWBsKiLwHhHkrxMlSFk147hFEJglMyDRYovh6P3XOJZJigq-qZcyzxbTXm3hoCEEgkw11bI8AEp4qS6hgWMp0opXRzjRXU-WmlbAYuiZaTs0hRDZUJkeFM4I7E5LQYbBcqA2U7gBLUfGdijwPBBMUSRfwW5fGkv03UutXGdGRdNai35xXIVqPJI+agxofCKICQQkj+xHwjprR4sUzrEQumRCiRYZpqQmYUnSLF9WrwhWJJolRFACWpEyGQGqaXqLybqsqtgAruGCr6kydl2TZVoVJa8wDPrdgEFlWkpMdSOsmn0HVNEk3RTselDaAguXUnWkeU0Ql8aCF7OCIQ8kcgdzBhDctiAGghwzByJoRQ8IqGKLmTVIh3GqItr2lC+R+obQUECNQIIW5Jl5KIWQbVrz9iBG25RM7e7aqPc4OdyhzRLtGqoCm66D5KCPnIXNLckrUqdeM+pHjNG3w4cK3xt852kxbb7DCoCjyxgjkmEE7JnFOI+E8N4qFD3-vYT479rs525H3LQ8+jinhyBAW8fG287JvByFkN99tP2npEHYJBbtsRVK6DUn1nES5CNQqtCujRryPmEFY68VRnKjXbTXN4lzI2oMfqiT1jEiklLKWetjBjUgAh1A5bK27GjZGVVBoE4hhPCBbWJyEyjJm2Gmd6vomHsgZSyCmfsBpChKBZO0-GbUW5a2HbqMzhSFnMdqdZ5TTyTKNGAy2wEtIszggOSk9TIlwQKFI9kJRRgDBAA */
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
              cond: "isIbanOnlyMode",
              target: "DISPLAYING_IBAN_ONBOARDING"
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
              target: "LOADING_IBAN"
            }
          }
        },
        LOADING_IBAN: {
          tags: [LOADING_TAG],
          invoke: {
            src: "loadIbanList",
            id: "loadIbanList",
            onDone: [
              {
                target: "ASSERTING_IBAN_CONFIGURATION_NEEDED",
                actions: "loadIbanListSuccess"
              }
            ]
          }
        },
        ASSERTING_IBAN_CONFIGURATION_NEEDED: {
          tags: [LOADING_TAG],
          always: [
            {
              cond: "isIbanConfigurationNeeded",
              target: "DISPLAYING_IBAN_ONBOARDING"
            },
            {
              target: "CONFIGURING_INSTRUMENTS"
            }
          ]
        },
        DISPLAYING_IBAN_ONBOARDING: {
          tags: [WAITING_USER_INPUT_TAG],
          entry: "navigateToIbanLandingScreen",
          on: {
            NEXT: {
              target: "ADDING_IBAN"
            },
            BACK: {
              target: "DISPLAYING_INTRO"
            }
          }
        },
        ADDING_IBAN: {
          tags: [WAITING_USER_INPUT_TAG],
          entry: "navigateToIbanOnboardingScreen",
          on: {
            CONFIRM_IBAN: {
              target: "CONFIRMING_IBAN",
              actions: "confirmIbanOnboarding"
            },
            BACK: {
              target: "DISPLAYING_IBAN_ONBOARDING"
            }
          }
        },
        CONFIRMING_IBAN: {
          tags: [LOADING_TAG],
          invoke: {
            src: "confirmIban",
            id: "confirmIban",
            onDone: [
              {
                target: "CONFIGURING_INSTRUMENTS"
              }
            ],
            onError: [
              {
                target: "DISPLAYING_INTRO"
              }
            ]
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
        loadIbanListSuccess: assign((_, event) => ({
          ibanList: p.some(event.data.ibanList)
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
        })),
        confirmIbanOnboarding: assign((_, event) => ({
          ibanBody: event.ibanBody
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
        isIbanConfigurationNeeded: (context, _) =>
          p.getOrElse(
            p.map(context.ibanList, ibanList => ibanList.length === 0),
            true
          ),
        isInstrumentsOnlyMode: (context, _) =>
          context.mode === ConfigurationMode.INSTRUMENTS,
        isIbanOnlyMode: (context, _) => context.mode === ConfigurationMode.IBAN
      }
    }
  );

type IDPayInitiativeConfigurationMachineType = ReturnType<
  typeof createIDPayInitiativeConfigurationMachine
>;

export type { IDPayInitiativeConfigurationMachineType };
export { createIDPayInitiativeConfigurationMachine };
