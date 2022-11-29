import * as p from "@pagopa/ts-commons/lib/pot";

import { assign, createMachine } from "xstate";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { InstrumentDTO } from "../../../../../../definitions/idpay/wallet/InstrumentDTO";
import { Wallet } from "../../../../../../definitions/pagopa/Wallet";
import {
  LOADING_TAG,
  WAITING_USER_INPUT_TAG
} from "../../../../../utils/xstate";

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

type Events =
  | E_SELECT_INITIATIVE
  | E_START_CONFIGURATION
  | E_ADD_INSTRUMENT
  | E_CONFIRM_INSTRUMENTS
  | E_COMPLETE_CONFIGURATION;

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
  createMachine(
    {
      context: INITIAL_CONTEXT,
      tsTypes: {} as import("./machine.typegen").Typegen0,
      schema: {
        context: {} as Context,
        events: {} as Events,
        services: {} as Services
      },
      id: "IDPAY_INITIATIVE_CONFIGURATION",
      predictableActionArguments: true,
      initial: "WAITING_INITIATIVE_SELECTION",
      states: {
        WAITING_INITIATIVE_SELECTION: {
          tags: [LOADING_TAG],
          on: {
            SELECT_INITIATIVE: {
              target: "LOADING_INITIATIVE",
              actions: "selectInitiative"
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
                target: "EVALUTING_INITIATIVE_CONFIGURATION",
                actions: "loadInitiativeSuccess"
              }
            ]
          }
        },
        EVALUTING_INITIATIVE_CONFIGURATION: {
          tags: [LOADING_TAG],
          always: [
            {
              cond: "isInitiativeConfigurationNeeded",
              target: "CONFIGURING_INITIATIVE"
            },
            {
              target: "CONFIGURATION_NOT_NEEDED"
            }
          ]
        },
        CONFIGURING_INITIATIVE: {
          tags: [WAITING_USER_INPUT_TAG],
          on: {
            START_CONFIGURATION: {
              target: "LOADING_INSTRUMENTS"
            }
          }
        },
        LOADING_INSTRUMENTS: {
          tags: [LOADING_TAG],
          entry: "navigateToInstrumentsSelectionScreen",
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
            },
            CONFIRM_INSTRUMENTS: {
              target: "DISPLAYING_CONFIGURATION_SUCCESS"
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
        CONFIGURATION_COMPLETED: {
          type: "final",
          entry: "navigateToInitiativeDetailScreen"
        },
        CONFIGURATION_NOT_NEEDED: {
          type: "final"
        }
      }
    },
    {
      actions: {
        selectInitiative: assign((_, event) => ({
          initiativeId: event.initiativeId
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
          )
      }
    }
  );

type IDPayInitiativeConfigurationMachineType = ReturnType<
  typeof createIDPayInitiativeConfigurationMachine
>;

export type { IDPayInitiativeConfigurationMachineType };

export { createIDPayInitiativeConfigurationMachine };
