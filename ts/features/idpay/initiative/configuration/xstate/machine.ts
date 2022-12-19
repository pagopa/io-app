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

export type Context = {
  initiativeId?: string;
  initiative: p.Pot<InitiativeDTO, Error>;
  pagoPAInstruments: p.Pot<ReadonlyArray<Wallet>, Error>;
  idPayInstruments: p.Pot<ReadonlyArray<InstrumentDTO>, Error>;
  ibanList: p.Pot<ReadonlyArray<string>, Error>;
  selectedInstrumentId?: string;
};

const INITIAL_CONTEXT: Context = {
  initiative: p.none,
  pagoPAInstruments: p.none,
  idPayInstruments: p.none,
  ibanList: p.none
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

type E_START_IBAN_ONBOARDING = {
  type: "START_IBAN_ONBOARDING";
};
type E_CONFIRM_IBAN = {
  type: "CONFIRM_IBAN";
};

type Events =
  | E_SELECT_INITIATIVE
  | E_START_CONFIGURATION
  | E_ADD_INSTRUMENT
  | E_CONFIRM_INSTRUMENTS
  | E_COMPLETE_CONFIGURATION
  | E_START_IBAN_ONBOARDING
  | E_CONFIRM_IBAN
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
    data: {
      ibanList: ReadonlyArray<string>;
    };
  };
};

const createIDPayInitiativeConfigurationMachine = () =>
  /** @xstate-layout N4IgpgJg5mDOIC5QEkAiAFAggTQPrIDlkAVZTUgNQFFcBhAeQIDFkBxAVQCVzlGA6AOqYShVviKke1XAGUqAGSq1SjAMRzFy8SKlUA2gAYAuolAAHAPawAlgBdrFgHamQAD0QAmAIwBWAOx8ABwGIYEAzAYAbNFeAJx+ADQgAJ6IwbF8XpEe4YEALH5+YWGBsQC+ZUloWHiEOpQ0DMxsXDz88vSYqKLakg2qEE5gfNaOAG4WANbDADYWAIYQyI521vP2Y2CGJkggljb2Ti7uCB5FPnw+gV7FeV4GXl75eUmpCNcGfNE5BrEPZ148uVKiBqjhemQGnRGCwONwVAQ+FQKJh5OxSAQxHU+shpE1Ya0Eapti59qsjrsTsViplnoFIgYgaVYq80mc+LE4iEfD4PFc-j4KlUMODsZDcY0YS14bxEcjUeiemLdNDmnC2gRiV4duYrOTnJTENSwrS8nl6YzYszWe8ikFYnkDOE-E8HYFBSCwbUJOK8VL1Qi+PjpUqfbp1MRMJxiKqCTLGCTdmTDgbQCdHQYPHw7ldAZEwvFYj4XilEHkeRyvC6fGE+WE4gUhaCRd76hLY9KNXwOl0lQAhTCawaOYajCbTPhzRbIABG80cid1BwcqbcZZuAUiPgMEXuQLNgRtsT+fAL5fptadJTyTa9EJVwYDsr4mBkcmj-cHHafjFwBCoVCoIBxLGKSeopscZYGMWXxhC6cHXPkvI2lyWZbkWNYGH42Q3GEt4tveUKPoSz6vu+GJYgOBDfiRv7-oBwF6NqYHLhSaZGn4Dp8NWwSZgyfhRJEKF-GhPgYRE2HeMU+E1IR7bEfGiLdDI6DyDgn7UYwfadJw3SYhGUYxsgVG4FpOl6awi57OBK6QQgYQ+JEeTZlEJT5JEgJ8kJpanFWJohE8XgeDkZrQXhnoEcqRH+rRSnICpanYBppkENpUYWaorD0LgA60AA0lZya2YaCBmpEm4eH8B6ZteKG-AEEQBbEES1kWMmimG0VqrFL6oBZ+BUaowacAAsgNg6FTZbFrqceTRNxvxPGEHlAhJNrBVhp5nDh3jNQJHrCrJUXyTFim9f1xmDpl2W5QVoFJlNq5Uh4W6XHkJRhOWAkulkKEeAWXyBBe8S8mcwKHR1bZ+t1Z3DSNGkDEMIzjFMwwAMZOAAZtYABOAC2s7zpNrFPYgVYCXw-2hCDwVAt5bxLc5VyRPk153PWN4RUdnUnTDXY9hdBAyMQnDsCNVAEMQMiIyOyPjrMCxLI4sC2DjACueNgI4tiwMT+p2TkcHZpVeR8oEfim5ydX+Jk-hYVhNzXDk7Wtji0Nxl2ymqepmLiMLovi5L0tZTlmD5XrEElREL2XPVgWPJELI+dkFzNduzOCXEkQu3J7udoGXuJaG-tixLUuqF0qB+yLpeSxHxXsacTmfGcfhgyzcRFjan0XNucS+LWNYFOWOfHXnP5xQlPtYkLNeB+XcPVwHZcyPX00nJVHgt0DTn3ED0FeDaPj3EE3gsyU9zLTk2dc5DbuSnzgaV8Xc9lzLo4oxOixKyr6ua9ra9SanEqoEQGsQqbbnLDWFCNIs4lAtlELyo8ebjx6oXaeNFFKyHYLQWgVA3xDXoCNVSVBiAPw9giQBdkMxZhzNcOaBZOLFnWn4C4W4txzT4uWF6HoQSOAsBAOALg7xj3IfnWULF9YlSyI5L4NwXrYWLCApObxgrZkHqbCI-gloeGQVDMRE9BDCAornGgGglAIkkZHRuTxsgchTjWBk0F-phBtOELM-gaxBQcrcUoej76YP5p0QW+irENxmv9Is3EtysLgn4ehHgSxvHSHwJ0vhfCm0dHufxvoDE9XlGiExojAmWIeiTA2RZQG+BCOVIKDxbhuNrJcWJ3iayfT8bfV2uSSnPgUqGUJZSpGNwclEu44RfheXrIeHy5YMjR0zMEYsP0b4Qy6Q+U6QTey+0ugQMJ68oL1lPBhRy25AhnCiDaROJot5zXNq3BkVYcnrMfqRN8VAPzbJMgpDUf4AJAVQHsoBjoaTFBCFvOIzpD4+V8K9P49wTZPEKEDJ5XUKHPnQUlT5X4zLpVEICuyBYganmPnERJy05qJB8lJE0y1SgCRev9ROKLeZov4M-LFuzBnWJmhEU2lMGz5kgaSpJngsifBuPEC2W5HLZM6aYnp-A4YaXxdIgSzkPK1nKhw5R60t4mn4m06+szmWoLOgLF+y8g4qsbjwgIdZvBAnuDcHcKFFmU2glcHIQUzTmhNXks6GKLW1yltaiJPwviFBrGcre7p-A2jKkEU2Zxiyckcn6hViJ2UzxLvPUNG9iy9yeEDHIVxfjMOhb8DkW8dxWn8JVesKzmzc30RmvggbfbfIRNg3B+CZB5qNPmLw-LShRGavkIo61eRfCHjka+wUHTps7b0jZXaGDEMUGQgFXLwnpjBrBTyPIdxA0nUOx0HDwifTNAuuVxSl2KpXbKP89AYz0X+f2+yg7h1-CueO1xPlzafCBoUFmYkMmsIqBUIAA */
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
          // TODO:: invoke IBAN call, if empty go to ADDING_IBAN, else go to CONFIRMING_IBAN
          on: {
            START_CONFIGURATION: {
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
                actions: "loadIbanSuccess"
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
              target: "LOADING_INSTRUMENTS"
            }
          ]
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
              target: "CONFIRMING_IBAN"
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
                target: "LOADING_INSTRUMENTS",
                actions: "confirmIbanSuccess"
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
              }
            ]
          }
        },
        DISPLAYING_INSTRUMENTS: {
          tags: [WAITING_USER_INPUT_TAG],
          on: {
            GO_BACK: {
              target: "CONFIGURING_INITIATIVE"
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
        loadIbanSuccess: assign((_, event) => ({
          ibanList: p.some(event.data)
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
        isIbanConfigurationNeeded: (context, _) =>
          p.getOrElse(
            p.map(context.ibanList, ibanList => ibanList.length === 0),
            true
          )
      }
    }
  );

type IDPayInitiativeConfigurationMachineType = ReturnType<
  typeof createIDPayInitiativeConfigurationMachine
>;

export type { IDPayInitiativeConfigurationMachineType };

export { createIDPayInitiativeConfigurationMachine };
