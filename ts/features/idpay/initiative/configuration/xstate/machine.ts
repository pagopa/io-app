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
  UPSERTING_TAG,
  WAITING_USER_INPUT_TAG
} from "../../../../../utils/xstate";
import { ConfigurationMode, Context, INITIAL_CONTEXT } from "./context";
import { Events } from "./events";
import { InitiativeFailureType } from "./failure";

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
  enrollInstrument: {
    data: ReadonlyArray<InstrumentDTO>;
  };
  deleteInstrument: {
    data: ReadonlyArray<InstrumentDTO>;
  };
};

const createIDPayInitiativeConfigurationMachine = () =>
  /** @xstate-layout N4IgpgJg5mDOIC5QCUDyqAqBiAigVQEkMBtABgF1FQAHAe1gEsAXB2gOypAA9EAmUgKwCAdAGYA7AICM4gGziZADlG8ANCACeiKbwC+u9WkzCA6gEEiBAHIBxAPoBlDGeTYnLjHYDCqKwDECGzxkMwwCXzJKJBA6RhZ2Th4EXhSxeSkATllFABZFLMV1LQQpRV5hDLkhUl4M0lEMnPl9Q3QMYQAZVDMAEWt7a0tQggA1AFEsCHYwYQY2ADdaAGsZgBtaAEMIAjZmBg2WebBIzli9hOikquEc3kzFB-FxetkMou1cm6rRWXkH0VyLRARnaYxGZg6eGGtjsgzCw3G3l8ASCITCviwJ2iZ3iHEuiFusmEAkUAkq4ly2SkOSy7xKTSJWTJogaOVI8gEQJBwjBEKhYRhcIICLGSP8gWCwwxxCkURo9HOeNASRyP2JpPJlMU1Npmm0UgERLuskyFKkAOUUi5bR54Mh0IGViGYURPnFqKlVkxvDlMQVuMSBKa6rJTy1OtkdMNUmE8iZpEUCZq4lE1uMvPtAsdztGordKMl6K9xFEvpxrCV3CDRJJoYpTW1NMjeoQ0hEcdkpDk2V4-zT7T6DgACh0zABNfqwqwYNBYKxjAAaJAop39FcDCF+MdumRUQhy4jZbxb2VIwhkWXZOTZCaksn7wnzEuQk4IACEzF6pmwZrAmAcZm5J9UVfD8rCxeU4nXfEECeOljVEYRckUKkcn3UgZAfYDglAz9JmmYQ-wA4QgORZ9cPA2VVygi5lT4TtFGEDCSV4HI71IZjxDpA1SRuWQySEaRBGvcQsLIkDBTAzpuj6STPzsDoCCcfCf1mBZljWTZtgAIw2NgOgYP8IL9GjKySKR6gyJiuwef47xQnI6XyIlRFIDJSVVDIBGeUkxPdHC5KsW0+QdWEwIUpTsGM8taKrEpLOsilbNEezZEclt3KsuRaleUQBDyjjOQMYEbWwl9AuCzMKIi5SZTLNdYvMhKOKSuzsjS7jb2JdihFkCRkKK1pjDKijhEHEdx2q3w326ZBZJsOdF2XerTI3KQDXKAQuwKXIAVKbidHEbrO3cp5JEUOQ-ILcqBik8bRwnQK7Gm2b5qwD8vAAaWihqzO0WojsPWQUkEVzDU64NpFchNDXqMkrvIir7smp6XpcN6Pu+qjsV+jdeBNRjmLKNjO04g7ngqX58bkXJvIyBGJNuz9hF6eawrwp9kAAWXZ8CVxx1aYIshpEtsy12vS4odHym5nLqDJ1ryMoGYCpmgtZij3rML6fsFuj4pFlqxZSiXycJu9zTZNt+JyFWbt5x8yO5zXvxmOZFhWYQAGN2AAMwYAAnABbAhdLYXXFTW7zAfWwQ7x+XhJEl-6BByCpnOvFkLNYwaSuG8TVYd5HHrVmrsExiOAyF2oRFY4H+HywRm2KB4azJbUsnNVu9GK0j-Pt99meL6rFOUivscgyOYPxhMmJ41j2LJltSTPC8bYJy9bd70qC4Hu6lImkvebLrAxisNAOg6XnK+g-WDSeYQFAs6Q+uBpO6UqM8vNclC+sT0lFB21GmfC+ilAoqTdupT2YA2AB1oKsVYoc9I30anwGojF9y5BSKSWsycECVHKGhFKCgMiJy8ikIBgorBOGQHgLmZ8MAOAgYRf8TBAI737q+ahM46EMIcCgv6m4uIthSOtMQeQ-gYSaE8ShjoaG8OnEw12LDiJ92ulw+R9DFF1WolPfW3l4J5REG5B4GFhYNCtNvfOnCqGaL4dJXoGieFaMYcw92GlhDrC2DsP8AcACuQcYFMFgAIjcKg2RIUOjSNkdxeACG4ukJC4h+CkPxgIfgghZFTjsYosaB8HpONoS4phrNsnOIYaEmCKhgZMQPLwFK6SiHxJbNSbUlMBJCGfiJLJ1gcmMLycOAptjymKK1jrfmk8q761EGhRibFrw1H4sDfKzSpZbSNKQw0eQZC-DQj07hRT7HD2GYc0Z48Vp6Lirs4QaTXgsQTB1Fp2pGLIUPP-VyMirHtBGichR-TjlyJGa4+cS5KnTMkDGE0518ruXyo8qWyTygqAeHkDIrk4nan2X0hwLMehs16UCtxUCZhbG2GwXxASglgriuEs82pE7RJqNLbi3k5mlFpqqGQ9YHwArFNdT0jg8BeC8GMBwTCfBcxHGMDAeZd6empUkJZj8UwzPkInBoNRDEy3bgoEkCYUjXjtgKqwmA7DzjGD0C1WAJVSplXy588qJkmUuUkC68F1qIRmRdCkghnip30MVNgtAIBwE4CCXRUy4oAFopAfxEEQhMTxVXiDRaJL5pgLBZkcM4VwEbb5xQPPBdkNxG5VH4Ief16auiOKoTmcYebUEICaGnb+pQdwXRpMeKWZQKiN1eJUbytxSEPgzPyLhdbZX909A2wRwMoxxK+FkURygE6pnTby6wM5UAzrxsoFyELnj4wNO5OkvwiTJKyClCyvx6hrqGt83eFEd0wX4jGW5XkygPLwSmtOvY0o1HyvUy66aflqwcfi8Ko8MDPv1s8IkbkAT8BZCoDCognJtIpGlLaT84kHh6VJUdoVB5WDLjBuKiZyhIbvLcF+DFOopnEWii6AH2T3hA4+pG+SUalzRnNfoZHzJpIqKkjIncdCiYOgeSmJp67IpWfh5mGtAoCcQP2m5SyP38AcgddJx12IHlTs8O9ecH02LA5zLmT6BYuv+oeJiZRqR5WzqJwoLS4mIQZNSJoZImU93vY7MzRcuNH2I6R6zkbzJgyQnUZJ2QKQsjdRlB4c8AbIr6tqSx-nQMOxAagS+VnJn5vMnIRCaVSTZVIISa8H8KakKyIioQjRh3scC8R4QoWyoCptR0aVFqVPJDuGnGk9Tfikjyoebi+NCY0gBDUFIh5ShYqBQ4frvZSjdRJIdRoKYu3aFZHxTsDRy05WM2oxGgLTn9Orfig5fyVvhaK3wX+G36U-p2wk7y4iUIPD1UDNNWWOMXbuwMw+hS7v9ZmXZi6pCL2lFKM3bQnZAZoRRymB47kt4A9a7d4puKbt9NWwrGM9L+JdkEHCtDLSaQiDyjF2oXknj1KW5dnFBKWdIklT1mVPQIc4PPBhBWMnOwyG4skmMrKU3uXRaxTHJmQdDPsJ1osgrhWivu4VxtvZ42idSa8V4XZwYiJZGeHVtx6mxKyEa5XJrPDmstTzh7jbuxIVp0yRotxSR0hpGeId6WWOHkq1b8IJHuu9YdxrwRaK041BQyaInBiRHUiOg0Byh4OVFX0EAA */
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
          target: "#ROOT.CONFIGURATION_CLOSED"
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
            onDone: {
              target: "EVALUATING_INITIATIVE_CONFIGURATION",
              actions: "loadInitiativeSuccess"
            },
            onError: {
              target: "CONFIGURATION_FAILURE",
              actions: "setFailure"
            }
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
              target: "CONFIGURING_IBAN"
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
              invoke: {
                src: "loadIbanList",
                id: "loadIbanList",
                onDone: {
                  target: "EVALUATING_IBAN_LIST",
                  actions: "loadIbanListSuccess"
                },
                onError: [
                  {
                    cond: "isIbanOnlyMode",
                    target: "#ROOT.CONFIGURATION_FAILURE",
                    actions: "setFailure"
                  },
                  {
                    target: "#ROOT.DISPLAYING_INTRO",
                    actions: ["setFailure", "showFailureToast"]
                  }
                ]
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
                  target: "DISPLAYING_IBAN_ONBOARDING"
                }
              ]
            },
            DISPLAYING_IBAN_ONBOARDING: {
              tags: [WAITING_USER_INPUT_TAG],
              entry: "navigateToIbanLandingScreen",
              on: {
                NEXT: {
                  target: "DISPLAYING_IBAN_ONBOARDING_FORM"
                },
                BACK: [
                  {
                    cond: "isIbanOnlyMode",
                    target: "#ROOT.CONFIGURATION_CLOSED"
                  },
                  {
                    target: "#ROOT.DISPLAYING_INTRO"
                  }
                ]
              }
            },
            DISPLAYING_IBAN_ONBOARDING_FORM: {
              tags: [WAITING_USER_INPUT_TAG],
              entry: "navigateToIbanOnboardingScreen",
              on: {
                CONFIRM_IBAN: {
                  target: "CONFIRMING_IBAN",
                  actions: "confirmIbanOnboarding"
                },
                BACK: [
                  {
                    cond: "hasIbanList",
                    target: "DISPLAYING_IBAN_LIST"
                  },
                  {
                    target: "DISPLAYING_IBAN_ONBOARDING"
                  }
                ]
              }
            },
            CONFIRMING_IBAN: {
              tags: [LOADING_TAG],
              invoke: {
                src: "confirmIban",
                id: "confirmIban",
                onDone: {
                  target: "IBAN_CONFIGURATION_COMPLETED"
                },
                onError: {
                  target: "DISPLAYING_IBAN_ONBOARDING_FORM",
                  actions: ["setFailure", "showFailureToast"]
                }
              }
            },
            DISPLAYING_IBAN_LIST: {
              tags: [WAITING_USER_INPUT_TAG],
              entry: "navigateToIbanEnrollmentScreen",
              on: {
                BACK: [
                  {
                    cond: "isIbanOnlyMode",
                    target: "#ROOT.CONFIGURATION_CLOSED"
                  },
                  {
                    target: "#ROOT.DISPLAYING_INTRO"
                  }
                ],
                NEW_IBAN_ONBOARDING: {
                  target: "DISPLAYING_IBAN_ONBOARDING_FORM"
                },
                ENROLL_IBAN: {
                  target: "ENROLLING_IBAN",
                  actions: "selectIban"
                }
              }
            },
            ENROLLING_IBAN: {
              tags: [UPSERTING_TAG],
              invoke: {
                src: "enrollIban",
                id: "enrollIban",
                onDone: [
                  {
                    cond: "isIbanOnlyMode",
                    target: "DISPLAYING_IBAN_LIST",
                    actions: ["enrollIbanSuccess", "showUpdateIbanToast"]
                  },
                  {
                    target: "IBAN_CONFIGURATION_COMPLETED",
                    actions: "enrollIbanSuccess"
                  }
                ],
                onError: {
                  target: "DISPLAYING_IBAN_LIST",
                  actions: ["setFailure", "showFailureToast"]
                }
              }
            },
            IBAN_CONFIGURATION_COMPLETED: {
              type: "final"
            }
          },
          onDone: [
            {
              cond: "isIbanOnlyMode",
              target: "CONFIGURATION_COMPLETED"
            },
            {
              target: "#ROOT.CONFIGURING_INSTRUMENTS"
            }
          ]
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
                  target: "EVALUATING_INSTRUMENTS",
                  actions: "loadInstrumentsSuccess"
                },
                onError: [
                  {
                    cond: "isInstrumentsOnlyMode",
                    target: "#ROOT.CONFIGURATION_FAILURE",
                    actions: "setFailure"
                  },
                  {
                    target: "#ROOT.CONFIGURING_IBAN",
                    actions: ["setFailure", "showFailureToast"]
                  }
                ]
              }
            },
            EVALUATING_INSTRUMENTS: {
              tags: [LOADING_TAG],
              always: [
                {
                  cond: "hasInstruments",
                  target: "DISPLAYING_INSTRUMENTS"
                },
                {
                  cond: "isInstrumentsOnlyMode",
                  target: "DISPLAYING_INSTRUMENTS"
                },
                {
                  target: "#ROOT.DISPLAYING_CONFIGURATION_SUCCESS"
                }
              ]
            },
            DISPLAYING_INSTRUMENTS: {
              tags: [WAITING_USER_INPUT_TAG],
              on: {
                ENROLL_INSTRUMENT: {
                  target: "ENROLLING_INSTRUMENT",
                  actions: "selectInstrument"
                },
                DELETE_INSTRUMENT: {
                  target: "DELETING_INSTRUMENT",
                  actions: "selectInstrument"
                },
                ADD_PAYMENT_METHOD: {
                  actions: "navigateToAddPaymentMethodScreen"
                },
                BACK: [
                  {
                    cond: "isInstrumentsOnlyMode",
                    target: "#ROOT.CONFIGURATION_CLOSED"
                  },
                  {
                    target: "#ROOT.CONFIGURING_IBAN"
                  }
                ],
                NEXT: {
                  target: "INSTRUMENTS_COMPLETED"
                },
                SKIP: {
                  target: "INSTRUMENTS_COMPLETED",
                  actions: "skipInstruments"
                }
              }
            },
            ENROLLING_INSTRUMENT: {
              tags: [UPSERTING_TAG],
              invoke: {
                src: "enrollInstrument",
                id: "enrollInstrument",
                onDone: {
                  target: "DISPLAYING_INSTRUMENTS",
                  actions: "toggleInstrumentSuccess"
                },
                onError: {
                  target: "DISPLAYING_INSTRUMENTS",
                  actions: ["setFailure", "showFailureToast"]
                }
              }
            },
            DELETING_INSTRUMENT: {
              tags: [UPSERTING_TAG],
              invoke: {
                src: "deleteInstrument",
                id: "deleteInstrument",
                onDone: {
                  target: "DISPLAYING_INSTRUMENTS",
                  actions: "toggleInstrumentSuccess"
                },
                onError: {
                  target: "DISPLAYING_INSTRUMENTS",
                  actions: ["setFailure", "showFailureToast"]
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
            },
            ADD_PAYMENT_METHOD: {
              actions: "navigateToAddPaymentMethodScreen"
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
        },
        CONFIGURATION_CLOSED: {
          type: "final",
          entry: "exitConfiguration"
        },
        CONFIGURATION_FAILURE: {
          type: "final",
          entry: ["showFailureToast", "exitConfiguration"]
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
          initiative: p.some(event.data),
          failure: undefined
        })),
        loadIbanListSuccess: assign((_, event) => ({
          ibanList: p.some(event.data.ibanList),
          failure: undefined
        })),
        selectIban: assign((_, event) => ({
          selectedIban: event.iban,
          failure: undefined
        })),
        enrollIbanSuccess: assign((_, _event) => ({
          selectedIban: undefined,
          failure: undefined
        })),
        loadInstrumentsSuccess: assign((_, event) => ({
          pagoPAInstruments: p.some(event.data.pagoPAInstruments),
          idPayInstruments: p.some(event.data.idPayInstruments),
          failure: undefined
        })),
        selectInstrument: assign((_, event) => ({
          selectedInstrumentId: event.instrumentId,
          failure: undefined
        })),
        skipInstruments: assign((_, __) => ({
          areInstrumentsSkipped: true
        })),
        toggleInstrumentSuccess: assign((_, event) => ({
          idPayInstruments: p.some(event.data),
          selectedInstrumentId: undefined,
          failure: undefined
        })),
        confirmIbanOnboarding: assign((_, event) => ({
          ibanBody: event.ibanBody,
          failure: undefined
        })),
        setFailure: assign((_, event) => ({
          failure: event.data as InitiativeFailureType
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
        isIbanOnlyMode: (context, _) => context.mode === ConfigurationMode.IBAN,
        hasIbanList: (context, _) =>
          p.getOrElse(
            p.map(context.ibanList, list => list.length > 0),
            false
          ),
        isInstrumentsOnlyMode: (context, _) =>
          context.mode === ConfigurationMode.INSTRUMENTS,
        hasInstruments: (context, _) =>
          p.getOrElse(
            p.map(context.pagoPAInstruments, list => list.length > 0),
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
