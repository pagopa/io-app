import * as p from "@pagopa/ts-commons/lib/pot";
import { assign, createMachine } from "xstate";
import { IbanListDTO } from "../../../../../../definitions/idpay/iban/IbanListDTO";
import {
  InitiativeDTO,
  StatusEnum as InitiativeStatusEnum
} from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { InstrumentDTO } from "../../../../../../definitions/idpay/wallet/InstrumentDTO";

import { Wallet } from "../../../../../types/pagopa";
import {
  LOADING_TAG,
  UPSERTING_TAG,
  WAITING_USER_INPUT_TAG
} from "../../../../../utils/xstate";
import {
  ConfigurationMode,
  Context,
  INITIAL_CONTEXT,
  InstrumentStatusByIdWallet
} from "./context";
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
  loadWalletInstruments: {
    data: ReadonlyArray<Wallet>;
  };
  loadInitiativeInstruments: {
    data: ReadonlyArray<InstrumentDTO>;
  };
  enrollInstrument: {
    data: ReadonlyArray<InstrumentDTO>;
  };
  deleteInstrument: {
    data: ReadonlyArray<InstrumentDTO>;
  };
};

const createIDPayInitiativeConfigurationMachine = () =>
  /** @xstate-layout N4IgpgJg5mDOIC5QCUDyqAqBiAigVQEkMBtABgF1FQAHAe1gEsAXB2gOypAA9EBWXgIwAWAHQAmIQN4A2ABwB2XkOkBOeQBoQAT0SKVI0vOnSAzLJVjesoRYC+tzWkwiA6gEEiBAHIBxAPoAyhhuyNhBIRh+AMKoXgBiBD54yG4YBLFklEggdIws7Jw8CGIKvCJSvEZq0rwqQpo6xeYGKq3y8qQmAtLd3faO6BgiADKobgAi3v7enqkEAGoAolgQ7GAiDGwAbrQA1usANrQAhhAEbMwMxyxbYJmcuZcF2UVWHSKyAmryrbKqQvVtIgBLIxCIbL8VAJSLJ+CYZP0QE4hqMJlM-DM0nMllgwAAnPG0PEiagHa4AMyJAFsREdTudLtcGLd7tlHvkOC8+ApSB8vu1fv9AY0TKRRNZWipYSZLEIfkJEciRIt5m5hng5r4MV5ZmkltFYgkkik0rEsKyaPQnpzQEUavITCJBIJjHUBCZpMLEGJoQYjCYobwuiYQ3JFYNlar1ZrpjqsXrFgb4olknMzcQBFlLXlWDbuMDDA1gVDpCIPfIvkohGZVOHnCq1Rq0lrMQRsYmYsnjWmvOaxFmclaOYVvQGwTZuq1OmYVCYiwgBAJ5KJDDVOtIOvJpXWhg3o83Y7qFh3DSmTele8QTAP2bmRwh7Y7nd1-u7PfOAfI-cZFypavIxGXHcREmAIAAVhjcABNdFvAwNAsC8RYAA0SAoB4hzvLkEEqEwvxDJRLCkUxPl4ecBDECwnSMQQKyDawamAzsjWSWCACE3F7VY2HWWAmGudYlWYs92M4i1BxzZ5bT4QRRAkYjSmUNR5zw6ReWhGFQQ9VoeiY09jVEri1hEPiBJEIT9NYlsOK8DMb0wqT8xwsQ1JEZcpFIVRRVUMigQXSQwRlT0VDkKxBEAvSuys6YbJGMZJmszi-GGAgghWYzNh2fZaROM4ACNjjYYYGD48Tb0cooulaFoZS+P8hEMDQ-IkZQPnhCRrHMfhIpY5BDLitFEq8ZLUuwfFCWJUkKWpHL6QKoqSqYMqHLzV5eFIfR5JkRTVCakVLFLZRYXWjpDEMHqRKGgaEpipKUrS8aiRJMkmEpPEaTpfLCuK0rMwwyTVpk4RxEkbbFCUvbvVML8YRkKsHVnMMHCRCNhIMq69ybQyRrS5aAfvD1RRB7pzGXBQjHnCQjBENRYRhAixBai70durxI0bGMMRsnHsDs-7rQJ0xeXkuQ1CEcnpEpkM5JKGQ1DwqFzuRiyor6q7QIg6DsdiNixmQG7EJQtD7Px7DJDwst4St6tYXMKWhDBXhZahMR4SMWRmeirnOJA1LNZgoa-B1vWDY4qIAGk8YF7D+GBra5HB3byNIFPqJqKUCJBL5PbV1nffAyCA9ZoOvF1kJQ7cCO+bZFb71juTQYTpQk+aqxSzCnzPOUMUFWV1HLNz722Y1wvtdLkP0TiVBkAAWSwYTZ6HqPhzN91ZDc6EayDSoZEpytqP4LcpTlawc-6ketcD4Py8n6e57DyP0Jr03pIQOULYkOpjDFM6xEpkphZ-k8lKYQdQlYDGcGjL2BBYoXyLkPEuZd9a31nlgB+1dszR1fubfCVsgw2ysCof+VFSAlFBE7WQPIjBnyugvGehl0o8Q2NsPY6wADG7ByQMHegQeay8sLYPdLg7eJgCF2z8lIAMZYXIO1qC5WQojpA0LznQhhj1JovTejSDhbAuE8L4U-TBK9BEWwItbMwhDKaGDKJOMwIItwblhMooe+d-bY3utgdBhiJJYKcvXYmYNm7KQkaQQQ35D7LiELJEwziYE+zge40aaDK6Rz+s-Xxa046Nx2sExolgPQGFhA6OGTsAKxNgX7UegcPGGxcAg6+yDfD8IqogcWoS3IOlIZQ2QoTIbFBDLyH4TtGZyBqFE3g5T4mVMvsXGpiwvBoGGMMJe3jyqAzfuYAQ5Q5QWDqHKKwf8JF1EdKQkKjMjDQi3AISZbN5mLJSkNRh6xMqsJEGANghIDgHF4YVZp6z35fk-soNSDUOiHLyZ0fQ4sXKKDUoBSiHs+6QIHv1O5qAlkMO4s8lh2V3mfO+XwtJRiBFOQBSDL+ILf7kRqOvSopg-wqE8hWBQNzlQLPRQ81muICRPSmq9GaeLaBfJ+WwP594yVAu-qC0he9agfG6QBDolD4SxK8EEZAeAZ7zIwAEJ5Jl+JMEEv3VWsE1XwU1dqgIYrsKuyohOVQjKQzmDnH5AMYS6Z-AdKCEKnlVXqotV4HVerTKGvMsa3qpr-VasDVaolPjjFOVteOEsU4nWzhUhckQalDB-kJmpeQfrzXRp1ddSNRbLXBoNUa5FJqWxmo1cWgIpa61Rstda1+i4gwg0ZinLclFagCEph0fQrQlxZysCnMQhaG2WubbGVtMbK1mRVhGlt5aY1zu1AunVGD40kqKJ2x0Ege2GG9QOymxhk1LiuVKV2vcIFDCgYPbw26m2ohulu9dQasX6uXeGy686v1vvimWmdMbiD9n5gmooSbwQpsdTOF1Ioen6A0hYBQsJPQFqRY+lFa6wMlvfaBgNJb3BLMWJEF9QG516pedlT6LhjhfLAEwc4fE8QAFcqTvKYLAdtfjPLghnA1To0SQwqUsLyZ01gSYBlnNOkjwHBqAYI02sjwwKOftUzR9Rz1prvVmhARjzHWNsHY1xnjfHVm1xtWOODk4EPOpUgGdencNwBg3OtGJOGRBPuI42zdVHtPqc00FxTOmeUaP0x9XKxmDgsbY0wTj3G2C8d3Ws+8sH7WpsQ5TWo+gwqqR+LDYwCmAtEfw+F1s7YtPhYqz4WjOLDi5QZCwJktxEvJcs-xooNgj3VhqK7H0DVKKU2sGUTylhGbKCDLpHzfnKvlZA4t2d1WEy1aW8p7lE09P8oM59VrVwbhgE6xZ1LVmTYZNHHa+D04nPNR6aWFyQZRHKslGV2d9WNurbjG2dbYXNsG103yrRhnDvtZO2ZpLZ20txoy7Zm7Dm7vpuajs8oPwlwhWsIoa5828MqfCwklbi60VLO+4GnrwJntuXtG3cwXk8vGAMBYro5hqzQnvSjGtq6CcBaJ7zit4xFgaYwImAH2rKcLhhTTyoFYahqQZ81MUWzPU+ikCCKsiKH2+fx+Tkt-O9e6omOMPwYFoLFr8FqjAAAJVA4xJfq-Xg6asPxBsWCsP-LcBgnaCE8m6kKH2N0G-F4urxl3oPXavQ65HSHEAKH0KCQbIJWgKxUIH-X0z4Eh6DeguHNnX5Zdu2m2PxQHaueK-I90whsPa4WwLoPmf-MVqQqhB3CiygyhTnYmwLkUd5IBLyWc8lPKqB6a7dPTbg-1sU1gAI4cCBgTb-CaRXfPg98V3k0RogdndAG28FlePa315LaTzlevGtZXWIK4VUOuupYd5I7tYhe1nqhFLJ26PZykHdCFRcQFD886G5sr3JN6Brba8qaICofJCrfK34w4P5drHrP6nr9pv6o5RJZoyjSxbigihIT4gTC4UagHYA-p0brAQBgDxaGqnYpZLTWYvxOSHpP4v6oGDrNRrwr5nSkwWDVj4FC4i7EHgFRZ7Y0gUFUGQ7ma0EIH9Ynp9oMpsF5KuxbLtBdBiiUQpwUTAQG5Po9iBB4BRBRCLABC6oxAzwQQUYniqw9iS7+Lxw5J9JmCGBZrf7f6VAWAaFaGN5ag6GmjDQBD6GGHGFYDG6m7m7aqW4Ua27270FXYIAehWBCaqD0oUSfAOFyCOjCCfAv7Kpa5c64ZWG+F+BeCYBFGLCLBC7jDzyoBmEi6WG9TWExER79KI7R7F4qSShljrQ9LO7wpp6IhsC0AUHwDZDIhQb7qIAAC0dQbkMgoiJQv+rs4mfkf4BgKcpCZgEoA2fR2u7gngWo4QoQYxLSxQxgogOBhCxEy4dQKkFEac0gz+J8UIUgnOSoX2a2x4Rx6y-ALkWaJ8sIU2VsY2+gq4Mg4sscJQlgwEmMnM7x+oPhF4nx94PQUoNMlEPo8ifWfSDx4INELkG0Kei4nhBcMy2o8EqAiJMcPIfI3wgoeyF6XwbkoSHoMIFEjKNeeROuR+Q8FJBeRS5Qh8u06cXo-k7qMiHonwoIKGrKbx3MHiPJiajKNiAp1QtQwplgCgToZgA+rhygrK0JB4CCcp6STRIYKJWxu0FEEgoilMR0fIIIoI6JfurKwe3MDSN08plUPSvIPQxgmyb474zUoo68tMnoygrsNKzpXhxcbpKCM8HprSeEZQ-wOOAEyg1Yvkih0xeE7eIUUSG01CABAGLiqiQ08ZcRoIyhZyPQtEig8IVizQ9xsoIIW+S4EyhZLMLiLpd0o0ZZvuYIFEoSS4qgwgwgNpz+bUMgyuFEeEfQ7Z0CsUp+hkZZAIlQZY1Ynk0I8sW4ViDU8quEQ5u+3mteuucSbMp5SY9RhRph5hou4wvZG0ZQzKXwvaG4y41KFYmB9xeyois4dQE+ZZExrUsKcx9O05SxjQlYog5YPo3kUS7oLx-6HZ2eSmH6yFZZWyVp9om8CgxgdE9JYInQmyFif4JE+Bbx0+AWIWlGFFlqZZ9xQmbO4sB5SqwpqhWy4skorsfwA6CF3ORZyFgWNFG6VFQB9W6FvoNseyqRPQSqEmUiPeLkwgPQoovqc5z6QlhGy2x+amaoIuol8UehBhRhAQZZ7QKu1ZPwvwIYHoNxlCNM5gf4FypC3+ZFWlQBsJYuGlJlxp4xb8m0e+FYhFRgG4Q6rU9EFgFihFAIrlym7lv2NWAlYlPlxxagIM8RgVZgwVWJCiK4wm02LktYalxBKFxVIgHl+lEwhlgR3lxKxxZlHwFlkoCioYlMs4MM9KXmt63kfBUZhu6Fs2HwjK9xP82kJersPwTovScs6ZXwvF+RgBAli5xOGApls4g11gUSRSeyCho4Do4gPSnUPw8IPcfBhBBp2epl1g4gWOwUDU60ygViPQNMoUKZG1U6RVy1TayFBoNRFhd5yV6yyB68R0oMLskmY1eEUFqZKl6R+aRJbi3hA8uh-hRlxhZZHoPoNUShZlXw7oGaV12aPqJMPoBZx5BRF4RRJRSE5R5R6F64zhjKFK4sRgDh1QnRnkSgUoVyOcuh15tR-1tVXxVJnwNJUoQo7Rco4gKc-xagjNPNV5owAQtNANdcwt-IllfwdJyxKJFg9KvS41jEaluhcQHg6oyAiwvZatotmtAIKkHF4ITFJQak7olQvc9gQAA */
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
              type: "parallel",
              states: {
                LOADING_WALLET_INSTRUMENTS: {
                  initial: "LOADING",
                  states: {
                    LOADING: {
                      invoke: {
                        src: "loadWalletInstruments",
                        id: "loadWalletInstruments",
                        onDone: {
                          target: "LOAD_SUCCESS",
                          actions: "loadWalletInstrumentsSuccess"
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
                    LOAD_SUCCESS: {
                      type: "final"
                    }
                  }
                },
                LOADING_INITIATIVE_INSTRUMENTS: {
                  initial: "LOADING",
                  states: {
                    LOADING: {
                      invoke: {
                        src: "loadInitiativeInstruments",
                        id: "loadInitiativeInstruments",
                        onDone: {
                          target: "LOAD_SUCCESS",
                          actions: "loadInitiativeInstrumentsSuccess"
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
                    LOAD_SUCCESS: {
                      type: "final"
                    }
                  }
                }
              },
              onDone: [
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
              entry: "updateInstrumentStatuses",
              on: {
                STAGE_INSTRUMENT: {
                  actions: "selectInstrumentToEnroll"
                },
                ENROLL_INSTRUMENT: {
                  target: "ENROLLING_INSTRUMENT"
                },
                DELETE_INSTRUMENT: {
                  target: "DELETING_INSTRUMENT",
                  actions: "selectInstrumentToDelete"
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
              entry: "updateInstrumentToEnrollStatus",
              invoke: {
                src: "enrollInstrument",
                id: "enrollInstrument",
                onDone: {
                  target: "DISPLAYING_INSTRUMENTS",
                  actions: "instrumentEnrollSuccess"
                },
                onError: {
                  target: "DISPLAYING_INSTRUMENTS",
                  actions: [
                    "instrumentEnrollFailure",
                    "setFailure",
                    "showFailureToast"
                  ]
                }
              }
            },
            DELETING_INSTRUMENT: {
              tags: [UPSERTING_TAG],
              entry: "updateInstrumentToDeleteStatus",
              invoke: {
                src: "deleteInstrument",
                id: "deleteInstrument",
                onDone: {
                  target: "DISPLAYING_INSTRUMENTS",
                  actions: "instrumentDeleteSuccess"
                },
                onError: {
                  target: "DISPLAYING_INSTRUMENTS",
                  actions: [
                    "instrumentDeleteFailure",
                    "setFailure",
                    "showFailureToast"
                  ]
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
        loadWalletInstrumentsSuccess: assign((_, event) => ({
          walletInstruments: event.data,
          failure: undefined
        })),
        loadInitiativeInstrumentsSuccess: assign((_, event) => ({
          initiativeInstruments: event.data,
          failure: undefined
        })),
        updateInstrumentStatuses: assign((context, _) => ({
          instrumentStatuses:
            context.initiativeInstruments.reduce<InstrumentStatusByIdWallet>(
              (acc, instrument) => {
                if (instrument.idWallet !== undefined) {
                  return {
                    ...acc,
                    [instrument.idWallet]: p.some(instrument.status)
                  };
                }
                return acc;
              },
              {}
            )
        })),
        selectInstrumentToEnroll: assign((_, event) => ({
          instrumentToEnroll: event.instrument,
          failure: undefined
        })),
        updateInstrumentToEnrollStatus: assign((context, _) => {
          if (context.instrumentToEnroll !== undefined) {
            return {
              instrumentStatuses: {
                ...context.instrumentStatuses,
                [context.instrumentToEnroll?.idWallet]: p.none
              },
              failure: undefined
            };
          }
          return {};
        }),
        instrumentEnrollSuccess: assign((_, event) => ({
          initiativeInstruments: event.data,
          instrumentToEnroll: undefined,
          failure: undefined
        })),
        instrumentEnrollFailure: assign(_ => ({
          instrumentToEnroll: undefined
        })),
        selectInstrumentToDelete: assign((_, event) => ({
          instrumentToDelete: event.instrument,
          failure: undefined
        })),
        updateInstrumentToDeleteStatus: assign((context, _) => {
          if (context.instrumentToDelete?.idWallet !== undefined) {
            return {
              instrumentStatuses: {
                ...context.instrumentStatuses,
                [context.instrumentToDelete?.idWallet]: p.none
              },
              failure: undefined
            };
          }
          return {};
        }),
        instrumentDeleteSuccess: assign((_, event) => ({
          initiativeInstruments: event.data,
          instrumentToDelete: undefined,
          failure: undefined
        })),
        instrumentDeleteFailure: assign(_ => ({
          instrumentToDelete: undefined
        })),
        skipInstruments: assign((_, __) => ({
          areInstrumentsSkipped: true
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
              i => i.status === InitiativeStatusEnum.NOT_REFUNDABLE
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
        hasInstruments: (context, _) => context.walletInstruments.length > 0
      }
    }
  );

type IDPayInitiativeConfigurationMachineType = ReturnType<
  typeof createIDPayInitiativeConfigurationMachine
>;

export type { IDPayInitiativeConfigurationMachineType };
export { createIDPayInitiativeConfigurationMachine };
