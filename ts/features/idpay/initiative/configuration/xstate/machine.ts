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
  UPSERTING_TAG,
  WAITING_USER_INPUT_TAG
} from "../../../../../utils/xstate";
import { IbanListDTO } from "../../../../../../definitions/idpay/iban/IbanListDTO";
import { ConfigurationMode, Context, INITIAL_CONTEXT } from "./context";
import { Events } from "./events";

export type Context = {
  initiativeId?: string;
  initiative: p.Pot<InitiativeDTO, Error>;
  pagoPAInstruments: p.Pot<ReadonlyArray<Wallet>, Error>;
  idPayInstruments: p.Pot<ReadonlyArray<InstrumentDTO>, Error>;
  selectedInstrumentId?: string;
};

const INITIAL_CONTEXT: Context = {
  initiative: p.none,
  pagoPAInstruments: p.none,
  idPayInstruments: p.none
};

type E_SELECT_INITIATIVE = {
  type: "SELECT_INITIATIVE";
  initiativeId: string;
};

type E_START_CONFIGURATION = {
  type: "START_CONFIGURATION";
};

type E_ADD_INSTRUMENT = {
  type: "ADD_INSTRUMENT";
  walletId: string;
};

type E_CONFIRM_INSTRUMENTS = {
  type: "CONFIRM_INSTRUMENTS";
};

type E_COMPLETE_CONFIGURATION = {
  type: "COMPLETE_CONFIGURATION";
};

type E_GO_BACK = {
  type: "GO_BACK";
};

type Events =
  | E_SELECT_INITIATIVE
  | E_START_CONFIGURATION
  | E_ADD_INSTRUMENT
  | E_CONFIRM_INSTRUMENTS
  | E_COMPLETE_CONFIGURATION
  | E_GO_BACK;

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
              target: "CONFIGURING_INSTRUMENTS"
            }
            START_CONFIGURATION: {
              target: "LOADING_IBAN"
            }
            NEXT: {
              target: "CONFIGURING_INSTRUMENTS"
        }

        },
        //
        DISPLAYING_IBAN_ONBOARDING: {
          tags: [WAITING_USER_INPUT_TAG],
          entry: "navigateToIbanLandingScreen",
          on: {
            START_IBAN_ONBOARDING: {
              target: "ADDING_IBAN"
            },
            GO_BACK: {
              target: "CONFIGURING_INITIATIVE"
            }
          }
        },
        ADDING_IBAN: {
          tags: [UPSERTING_TAG],
          entry: "navigateToIbanOnboardingScreen",
          on: {
            CONFIRM_IBAN: {
              target: "CONFIRMING_IBAN",
              actions: "confirmIbanOnboarding"
            },
            GO_BACK: {
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
                target: "LOADING_INSTRUMENTS"
              }
            ],
            onError: [
              {
                target: "CONFIGURING_INITIATIVE"
              }
            ]
          }
        },
        //
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
          context.mode === ConfigurationMode.INSTRUMENTS
      }
    }
  );

type IDPayInitiativeConfigurationMachineType = ReturnType<
  typeof createIDPayInitiativeConfigurationMachine
>;

export type { IDPayInitiativeConfigurationMachineType };
export { createIDPayInitiativeConfigurationMachine };
