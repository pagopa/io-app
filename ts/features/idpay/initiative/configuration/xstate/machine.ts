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
  loadIbanList: {
    data: IbanListDTO;
  };
  enrollIban: {
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
  /** @xstate-layout N4IgpgJg5mDOIC5QCUDyqAqBiAigVQEkMBtABgF1FQAHAe1gEsAXB2gOypAA9EBGAJgBsggHQBWAMwB2KaQAspfgE4lADjFyANCACeffgF8D2tJhEB1AIJECAOQDiAfQDKGS8myv3GRwGFUtgBiBPZ4yJYYBAFklEggdIws7Jw8CPzpIhJiqqRiypKkvBLy2noIvKr8IjJScnK8UoLySrxKUkYm6BgiADKolgAidk52NhEEAGoAolgQ7GAiDGwAbrQA1gsANrQAhhAEbMwMOyzLYDGcCUfJcamNYplSqqpygpLPGrylfC8i-E+KQQSdISNSCDogUzdKYTSw9PDjByOUaRcbTPwBYKhcKRAJYC5xK5JDi3RByCSiMSNKRtIFCf5Kb4IQRyJQidQKVSgsSCXgCOQQqEiGFwhGRJEoghoqYYoIhMLjPHEXixGj0a4k0CpORCcTU2nAwQMpl836kVRqUhPWoVQSqQVdYWw+GIka2MaRdH+OXYxW2fH8VXxdXElJkil6wQ0xqG426RBiXgPARSPJiKnCMRWh1mIbOAAKPUsAE1hsjbBg0FhbFMABokCiXEOsTXcRBRuR-IqSIQvJTpxnx8qkXkiUhKfhZXm8Vn-CQ57rerFhMt2VzIPAAWSmFecs3mIlgTBOCyFS-lyFXtnXW53GGcBLViRbYeZUhNPIkY9qI-7FqUdTtMYkKOue2JXje267vubALEeJ4iGemIXhBla3ruypBkSL6kmk8i8NUVqkOOOTmlI0hMhaUgiBOqhPLwxHKBIvDgsBSE+iuErXmhUH3r0-RDFxkF3nucywYsKzrFsuz7GwR4AE4AK4ALZgGwTCwI+wbPjcWqIAAtH+IgCBIqjTnIHzZEyAEERIoLpP245WlIhhsaByHgUJPEiSIeaFiWqEbrxe6DAM5bCRWWnYbpbYIIZEYWnZAEUi805MqmVRFD+5r8EUdoCm5ZhgZxboRXxflFqWXlBSJWAAEKWL4ADSUXNjFqT6T+4hyFS5JGnIsi5eljR-C0ghKIUk5NOSC4iMVl7Veh5UEAWlWBUte4Nc1mFNjprapPwpDMYRsgkcRdEUUOAEPPUshSEmbQWQVnRFR5JXhd5u6+St-lVaVn33tWdYNlhbX7QZgGZABdqpsxSimV8V0tDR410XkXIWU8s3zetwUiKFuN3jBCxLKsGwiHsskKSpalMK1e2voZ2TGZOZl8hZ6hWUOLyqH8plqBZDEWmIs0VQFSLzX6Lh4L4vhTM4e7+JuhZTBgMqS7itj0xqr5UiavKkOIRoUoULyskBL2Lm9OJRLYji2Jg9tTFMAwu1gSsq2rsrLjb0SNoSYOvm0hsslSf7jXy6ZMomVR0ayFlAvUxFAcBbC0BAcCcFCu067h+kzvwvM6layiKMCrLWcmhSvOoNq8iLhXdFYNhIl4Hg56GuEDUyh2iOadkyKlzQUrNfSDFeHqTFMHc4XpCCvJ2Y1AuNE0cjyJqVOIdGTgyzyFEms0ii64pupPXrW36M-tXwzG84mvIAcRLHjoITJZA8lrPCZ0j8Dqos-WtLilZUBX3BmkfgWYxyHU5kdHq1oTRHV5i-f4PI7TMV5Nja2hNdygMZkUHIIhi4uQmjvCuQ5hCdjeA0YoJCXjZkbnNLBi08Zj0Ev9GqOCA4MzzkUYEhDDrELLr-QcZQJyiDePhMQbR1BKCNJgjiC12EbW+qtcWSjgq4Lzi5TsDF5AQJZECc0YhKIyChsCG0RQijmnkT7bBfECbMLvJoue+dC7USFr-WBsg8gSHSm8TITR4aKHIlmMyNiUKOK+muAGzgMTKx6KrF2zjYr6QkOSGi0hhAyBHLlLkxikYERBEUVknMGKuUtio36ZYNa22lrLeWzhkkHX+IbJMtR+yginEmExX5ySHXLmZOc84GE1ICPbR2NYXZJK4bnOeUi2SZP+DOXIzxyJMgsmyOillsi-23sMipoy7YewSWrAYTTEDSAeG4lyLFeSpgaB+aQmRig7KyOONJwyjBAA */
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
        CONFIGURING_IBAN: {
          id: "IBAN",
          initial: "LOADING_IBAN_LIST",
          states: {
            LOADING_IBAN_LIST: {
              tags: [LOADING_TAG],
              entry: "navigateToIbanEnrollmentScreen",
              invoke: {
                src: "loadIbanList",
                id: "loadIbanList",
                onDone: {
                  target: "DISPLAYING_IBAN_LIST",
                  actions: "loadIbanListSuccess"
                }
              }
            },
            EVALUATING_IBAN_LIST: {
              tags: [LOADING_TAG],
              always: [
                {
                  target: "DISPLAYING_IBAN_LIST",
                  cond: "hasIbanList"
                },
                {
                  target: "DISPLAYING_IBAN_LIST" // TODO should go to add iban steps
                }
              ]
            },
            DISPLAYING_IBAN_LIST: {
              tags: [WAITING_USER_INPUT_TAG],
              on: {
                BACK: {
                  target: "#ROOT.DISPLAYING_INTRO"
                },
                ENROLL_IBAN: {
                  target: "ENROLLING_IBAN",
                  actions: "selectIban"
                }
              }
            },
            ENROLLING_IBAN: {
              tags: [LOADING_TAG],
              invoke: {
                src: "enrollIban",
                id: "enrollIban",
                onDone: {
                  target: "IBAN_CONFIGURATION_COMPLETED",
                  actions: "enrollIbanSuccess"
                }
              }
            },
            IBAN_CONFIGURATION_COMPLETED: {
              type: "final"
            }
          },
          onDone: {
            target: "#ROOT.CONFIGURING_INSTRUMENTS"
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
        selectIban: assign((_, event) => ({
          selectedIban: event.iban
        })),
        enrollIbanSuccess: assign((_, _event) => ({
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
          ),

        isInstrumentsOnlyMode: (context, _) =>
          context.mode === ConfigurationMode.INSTRUMENTS,

        hasIbanList: (context, _) =>
          p.getOrElse(
            p.map(context.ibanList, list => list.length > 0),
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
