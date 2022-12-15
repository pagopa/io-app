import * as p from "@pagopa/ts-commons/lib/pot";

import { assign, createMachine } from "xstate";
import { IbanDTO } from "../../../../../../definitions/idpay/iban/IbanDTO";
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

export type Context = {
  initiativeId?: string;
  initiative: p.Pot<InitiativeDTO, Error>;
  ibanList: p.Pot<ReadonlyArray<IbanDTO>, Error>;
  pagoPAInstruments: p.Pot<ReadonlyArray<Wallet>, Error>;
  idPayInstruments: p.Pot<ReadonlyArray<InstrumentDTO>, Error>;
  selectedInstrumentId?: string;
  selectedIban?: IbanDTO;
};

const INITIAL_CONTEXT: Context = {
  initiative: p.none,
  ibanList: p.none,
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

type E_ADD_IBAN = {
  type: "ADD_IBAN";
  iban: IbanDTO;
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
  | E_ADD_IBAN
  | E_ADD_INSTRUMENT
  | E_CONFIRM_INSTRUMENTS
  | E_COMPLETE_CONFIGURATION
  | E_GO_BACK;

type Services = {
  loadInitiative: {
    data: InitiativeDTO;
  };
  loadIbanList: {
    data: IbanListDTO;
  };
  addIban: {
    data: undefined;
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
  /** @xstate-layout N4IgpgJg5mDOIC5QEkAiAFAggTQPrIDlkAVZTUgNQFFcBhAeQIDFkBxAVQCVzlGA6AOqYShVviKke1XAGUqAGSq1SjAMRzFy8SKlUA2gAYAuolAAHAPawAlgBdrFgHamQAD0QBmDwHY+AFgAmAEYADiCDPyCATgMAVm8QgBoQAE9EML5YgwMg8ICQ7Kio2I8AX1LktCw8Qh1KGgZmNi4efnl6TFRRbUl61QgnMD5rRwA3CwBrIYAbCwBDCGRHO2s5+1GwQxMkEEsbeycXdwQQjyj-EMjTqO94vw9Y5LSTjz5snICzoIA2CPzvcqVDA4Hpkep0RgsDjcFQEPhUCiYeTsUgEMS1XrIaSNKEtWGqLYuPYrQ47Y6RAJ8Dz3bwPIIeELeb7eCJPRB+Yp8H5BWLxb6BDm-b6AkBVEEYsFYhqQ5ow3hwhFIlHdCW6CFNaGtAgEoLbcxWEnOMnsoKU6k+OkMpksvxshCRIJ8KK5b6M2JRfLRekisU1CSS7EyzWwvg42Uq-26dTETCcYjq3FyxiEnbEg5G0DHcJBPx8AJ8j1+X6XMJ2rIhPghfIBGthGJFgEVUXAv11KUJ2Va0NBrgqgBCmG1A0cQ1gtjWQ19oLVYeD8u7Gt7aPwA4IKf1+wcGbciACRQr3kiMQKgRZAW+dtdFYdRYMzO+UQZUR9Len4NnePnH84-cHfHanS-gQuDyMgMjEP0gzDGMkwzPMiwAEZzI48jWGO667Aa6ZHIg3LfFyjLUvE2S-H4jypIgsR+AYmRnAYRSRIEBgeMKTZTqq749kmcLfkBfBdDI6DyDgQEgWBEGsPQuADrQADSGFpluOEINmub5kyhbFn4pYUQgT5vAk+axDytyxFWrFAtUb7tt+Xa8cuyCrvxYFCSJDmrmJ4GqJ0qAroOClYUpxoIAEES5lWHzaSEITfAEtJlh4lKxZ8h6-DW3zfGUbGvhxNlcXZXF8T5QGQSO0HjFMfALIhyEBZupKZrugTnHeNahTWHq-N4CW5qanzRf1oVRBZzZWblgaLtx-4dF0DkEOBnDsAAslQBDEDIpVDCMFVwQsSxjgATgArgAtmAji2LAdWGspNJct4w2ZRlURXJldq5KFVKhb80RhZcAQvmNkacZNXYCa52ARgty2retqiSdJmBydd2HBbEATvXuvi-MU3gJNpUQhMNgPisDeWgyG4PCZDc3Qyta0bT54h07DKNBY1CCPrEtH0jkJSxA+2nvaE3NxTFPgGCE6M3CTraYhNiZgy51NQ8Qi303DYacEtzNqzDDNsw1O6cw8PMeHzDyC0kum8zR1Gml8+b1lllmk22CudiGxW03rGubeVsFVRAiyOIdp3nbYhvbscHrcyUvM8pbL3W884TOnwLJxNEfgPd4+ay9ZHtzvwVNuWItmwrI7C0LQVAyBtDBLUJVDENKFPylHyk8sZTo+LyqXfGZ3hBO95t2x8jvuhEWVNo4FgQHALjsWTRefowRKBUbxwALQXrpu8F+NbeKyGQgiHN7s0BoSiwhv9XR+yGM23EbxnMEWTxNSESNq7csBsfnt5wAVmuiFeVA743TRtRPgrpaQ1hzPmHI3VdIZBKLHAwNZaQYLxofMBHZi4KkRMiVEoDL74LXgQCBqMObxDtNpfCDEWTcjij8QeuCyEVy-IVC+8twGpk3g-BALJXgDVpPSEoNZbS6SLOcZ03IGT5h+D-UabteHkKmvZdEq4qHs2Ng7CsUsczWiZETKIdCGSZASJLDB2R7gC3YWozh-BNF+ThMA0SoFwI6K3rhfI+FDE52ZCYooZZzwGTrBEAo-MggOP-uogqk0+KlxplowcnliDeMEaEH490fgxT8GRc2ZjdIC0pPEAoAQixE2yLcWJM58ohhcY5P83tUmUP4ffZSwQpYZ2iqcKiDwx5SOeBImB3weQ5ioi9QWdSQYny4Yk9yf5mnAScas+gTdFCt1QJkrpvxuY5jCCWc8fNyIjKok6XIWRk75AKbEWZ5N5ltBmqrdWsMZC7OCsyYWL8pY3FuPWVqI1l4cIafOZJrz9brU+RzDKNE0EGGHnje4MRkGpz3DRDBsVeR7mMj9B5q8pqtN1m8taMK9H0nOPyS4sVDyRASMLYeTpCi5GHl4LwANspA1Be3Euysy7xMrjIautd67kqzCLPMacMFFi-sxTGeN-A5HCP9R8tICUAIIQuJ56zNktyoDsjpkCaFotwmZV4MRebGTIhSYFOU8FrO1YAxguACD0HjAQKgBqDXisooq3kRZMqIvoTpZ41EKxyNpIySW+TiblFKEAA */
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
          entry: "navigateToConfigurationEntry",
          on: {
            START_CONFIGURATION: {
              target: "CONFIGURING_IBAN"
            }
          }
        },
        CONFIGURING_IBAN: {
          id: "IBAN",
          initial: "LOADING_IBAN_LIST",
          states: {
            LOADING_IBAN_LIST: {
              tags: [LOADING_TAG],
              entry: "navigateToIbanAssociationScreen",
              invoke: {
                src: "loadIbanList",
                id: "loadIbanList",
                onDone: {
                  target: "DISPLAYING_IBAN_LIST",
                  actions: "loadIbanListSuccess"
                }
              }
            },
            DISPLAYING_IBAN_LIST: {
              tags: [WAITING_USER_INPUT_TAG],
              on: {
                GO_BACK: {
                  target:
                    "#IDPAY_INITIATIVE_CONFIGURATION.CONFIGURING_INITIATIVE"
                },
                ADD_IBAN: {
                  target: "ADDING_IBAN",
                  actions: "selectIban"
                }
              }
            },
            ADDING_IBAN: {
              tags: [LOADING_TAG],
              invoke: {
                src: "addIban",
                id: "addIban",
                onDone: {
                  target: "IBAN_CONFIGURATION_COMPLETED",
                  actions: "addIbanSuccess"
                }
              }
            },
            IBAN_CONFIGURATION_COMPLETED: {
              type: "final"
            }
          },
          onDone: {
            target: "#IDPAY_INITIATIVE_CONFIGURATION.LOADING_INSTRUMENTS"
          }
        },
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
            GO_BACK: {
              target: "CONFIGURING_IBAN"
            },
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
        loadIbanListSuccess: assign((_, event) => ({
          ibanList: p.some(event.data.ibanList)
        })),
        selectIban: assign((_, event) => ({
          selectedIban: event.iban
        })),
        addIbanSuccess: assign((_, _event) => ({
          selectedIban: undefined
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
