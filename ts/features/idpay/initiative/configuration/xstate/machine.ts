import * as p from "@pagopa/ts-commons/lib/pot";
import { assign, createMachine, forwardTo } from "xstate";
import { IbanListDTO } from "../../../../../../definitions/idpay/IbanListDTO";
import {
  InitiativeDTO,
  StatusEnum as InitiativeStatusEnum
} from "../../../../../../definitions/idpay/InitiativeDTO";
import {
  InstrumentDTO,
  StatusEnum as InstrumentStatusEnum
} from "../../../../../../definitions/idpay/InstrumentDTO";

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

/** PLEASE DO NO USE AUTO-LAYOUT WHEN USING VISUAL EDITOR */
const createIDPayInitiativeConfigurationMachine = () =>
  /** @xstate-layout N4IgpgJg5mDOIC5QCUDyqAqBiAigVQEkMBtABgF1FQAHAe1gEsAXB2gOypAA9EBWXgIy8AdAHYALPwCc4qaSlSBAZgA0IAJ6JRvKcNKiAbKPkGDADgNKlBgL421aTMIDqAQSIEAcgHEA+gGUMV2RsQOCMXwBhVE8AMQJvPGRXDAIYskokEDpGFnZOHgQAJjNDYVNSAXEDIqV+USK1TWKzXXkFXlEhUiLSAyq7B3QMYQAZVFcAES8-Lw8UggA1AFEsCHYwYQY2ADdaAGtNgBtaAEMIAjZmBlOWHbAMzhzr-KzC3lKi4SVapVkFJTaJqIARmL68UiQqS8IrGGRFKSDECOEbjKYzXxzVILFZYMAAJ3xtHxwmoR1uADNiQBbYQnc6Xa63Bj3R5ZZ55DhvPifb6-f5SQG8YEIJSkcTCMwCwSAqSfJEo4TLRauUZ4BY+TGeeapFZRGLxRLJVIxLBsmj0F5c0CFAydESVCy8ao6CxSEVFASkPSGZ28O2iVoGUhmBXDJUqtUa2ba7G65b6uIJJILU3EASZC25VjW7gg-QigRyESlXh-KSiaFyu1hpzK1Xq1KarEEHEJ6JJo2pzxmoqZ7KWzkFRC1QXCBTBj6g4xVAyFgQSH2WST8cziIpFWsjetRpsxnVLdsG5PGtI94hKfscnPDhABh2gu0u6vujSIcTiURLmqGSxFAziFKW7CNM-gAAqjK4ACaGJeBgaBYJ4ywABokBQTyDje3IIJ0ShmJKSgyH0oLiICqhvggAgIuChh4XaOgwpYwEdoaSSwQAQq4PbrGwmywEwtybIqLEnhxXHmgO2avDafCCCIEjSLI7TKCKgLBsIXr6JIsignhzHHkaYncRswj8YJwjCQZbHNpxnjplemHSXmOH-l8RSSF64ghtYliFuIVF8gBPxynI1iiPpnbWbMtljBM0w2VxvijAQgRrCZ2x7IcdJnBcABGpxsKMDD8RJ15OYUPyQsIOi0ZCzrmCpFHudUBEwr6C5eUx9jIuGImGQlnixeiA1JSl2AEkSJJkpSNLZQy+WFcVTClY5ubvII3oKToSkKI1zQ-P6wjVGYZj6DIEJyJu3WWZFyBGUN8XRYlyWpRNxKkuSTBUvitL0nlBVFSVGYYVJa2yUIYgrjIci7eRzT-oCehmB87Q-P5iLXb1Vl3QNEYNtGmK2aNqUraDt7WEoAiQzV-nmPojRNZ+BjjoG-COpT4WY04fVRYTXF47uRnE9g9kg1a5OWFTCkVrTp0NB6VgShuUqfvofysxFrE409g2gRB0FCzE7ETMgj2IShaEOWT2H+XhBFSOYgaAaCZgK+u1UlNUG7mDoAia6JuN65BMEjUbJtm5xkQANKk+L2H8BDW3Q8pcP5lVnR2pUa7+nK-v9TrIEpfrIc674YfBBHrjR6L7KrbeCfyVDO2KKnxQfMzHydAuauEUBXMjDz2t87rRfB4bnjGxXGKxKgyAALJYCJ8-D7HQ421U3qeoB-nt1R4gekWIj2gYcqnTIAi2P3wiD-dQcG6HE-h9Ps8L5HMfobX1syQgn529o1gVn4HUT0HoSib2hHhB2gFvZ515gQGKd8S7DzLo-KemoZ7zywG-GuWY47f1tvhMwhFHZSjMC7UBUgvg9CISfLy0JjCXyGNzbG90l5zyMmlXiWxdgHE2AAY3YBSBgP0CALVXlhfByhCHENKKQ8hFEhCEUCpTMUXkqiVlgUPeB-M2EcLelNT631aQCLYEIkRYiP64LXpIu2RCHayOdidD0+gRAX0FJCIQp1SyaNvqPe+pcXrYGwZYySeDnIN2pttGGLdCykEEEuBEgI6p9B8YHPxSDtGeGFlgquMdgafzCetROTdol7RHGWZmIZ-TuS3oCUQnMmEDxYWk8CY8RqBPNs4ZB5dTYzHEeVd8cthCwlED8ZGYpAzIwVmKMQ0JoEQgaNURhPVmG3V8a0-xyCOnLE8GgUYowV4hLKmDH+rQvh2lqFKHoXQ8KFhkEoPQCIajyB6MFXgqSC47L2clAanDNgZV4cIMAbAiRHCOKIgq-STm-3wv-E+2gywwgEM4pR8zKF-FXEQj5w8lS7NQPsjhPF-k8KysC0F4KxH5KsRI5yMKxAVMAYikBCi7T4QznUTuC4JBXUadfZpny8UEt+foj6M0fpApBbQMFEK2BQtvHSuFjLgHIqakIXQJ1WjRPMA7ZZN0tawU8IEZAeA547IwP4P5pkBJMCEljNZzZDXwRNWa-wcrsKjgeROOJZDSiVGqKpaEVNkbyEBFKf8phsVeCNc6zw5rLVmRtRZO1+qHXRtNbG11VLQnWOch68cDtvXTj9XOCiakqbBi0ooeQDQL6Rsdca9N5qHoGrTS6+N1rbWrJTTGVtGbm2pqdY211Ry67YQEIo4Z64ijOmgRIMEHo4T5s9BuAtsh3lXxvgOhtLr+09sHW2olVrzJ6oDnu7dfa0SPS1L281ODs00sKOOssk6NwzrBHOhm8NTBfFkL0MigIaniDrTe-wu7r37oze249ybT3gfPU2y9LaIO3r7GLHNhQ81eqnL62cqkz4aUhEQ3+CIJDAeQ6BxDW6Y0IbihiNw+zlgRCjeR3dlqAVZT+s4U4YKwBMEuPxfEABXakwKmCwDdd-YMzND51C8V6UwqlehfloUQhxRYMa8s3We6jFHaNUaHWB+joxGNwZ06xkV00vqzU49xo4vH+NMCEyJtgYmJO5sIp6gt2GZz+tLb3coMhVNO3U2R+DunhraYM5RvwRmTPMbC+Zwk71LNGLmhALjPG+NsAE8J0T4ms3HNvJhrzPqfMlvhjoXQnc-gbinTLULZnoumai3p-ccZDzNZ3dFtjJLjg5UZCwZk9wHNOby2594Y5ISQkrP6D8oJP0jlOm5dcIY-UnRPg1lrEXOsXta1qA8ep4uNda3iJLBixW-X61cQbdwwAjdyy58TI6v7ubHFh0rxaPSnWZv+eok4pQNJWU0+1kWut7aO1tq9LY2w7ZoxF07k1RVWfFX9AbNxbv3ec65gro7v7Ff+0W3DjNKwaUDPcnQJgNNA75SD2HoHEFIbC1gMI3gEwQ7NeNkE0gfTrhhOt-0pRQHaDEFUWEYvJbik2zuhn+m21fPxQc9nsbOeUV+2IO0J8tJCGna7JqwZdCSEpsWRQNMpd9pl6DyDkxljGYwGz+t1GVdUQAuUeQbNDAnQrCiqmQo2r0wRGCM3TaLd06wFMSYvgwLQUbb4U1GAAASqBJhO5hJvPCfwPOfgdgfEn-5NLikInKQHJ78508LhsjJDuh05Ors9wpI4PP5oJzh3zzRSjqvDXEowFQeXU602XkPSu43YJxy9jDjf3uE9byOdc+EjAnQWUb2QSgg-0-SYznT5tUJO5oZKGpCgpSdGMLr+GH4vwKCnaOB2DRV-l+Lhv6v-go4EDAjv6we-1wH8kPUkMCt4nOjd0qGUD+AsFv3lyFUt2wEPXY02DJSlXBWy0cwe2Wjr3QxBAnRqWnQ-HfWgQVnMHKDoWhm0C9AdjAMFR+UgIR2S0MVmjgOlUQNGxcydwwKnTfVhFwMZhqD0HhArWnVMCAw3X5QHxt0YwfzNR60yk2AgDADsxtUx1E2YOfUwLYI-QPlhD3zIQrCMHcjLFv2t1tzENjSoPO2R1pGkNkLuwYOQMUIeWUOwPYPnSag3CphKFnDFzFBDGAhD0Hm7ACDwEiEiGWH8AtWiDnggkYyPFum7BVwiSTmbjKVFCGQrSIXHW6DkAEN5W8Oxl8P8H8MCOCLD0mAjyjyghjzj0T2T1QIfUQGsB0HHH8gRE-GRh0lUnMAeSqDIVIHT0-GdF7xLxTBNCyU8EwF8CQmWGt0mEXlQDCNt0iK1miKqIGWKAnxKyn3KxqIUF0DqC9FqGfBIjsG6jYFoGkPgCyBRDQ2qJwhFBkHzU2LuLuIyOpzcA8E1DCBCAuKWPDR+3cQ-FMErASMphoifHMEsGRkDF1XDCa2h3jA+JOX4BKA0jklGUECnSBCalaCXCUl0m70-GAh3EbANQOzmJPG7FhNvGeW9FIgD14KdmcQlCZjLHkA8galDCvkH1jTQDJPjl5B+EVk2KFA9H6F0AYTqkAnFDiUjVsi5Lx2Rjn2DDcI5XlgUQ8j3xqC5RPl6HXU0yEMyTA0yWFmlNzTkGZgqAVPqAWzblKGqjwlIkP3fS6MlP5nxIJn1MCUNIqkL3qOUHHXMCIUqGFE4MIXHQsDzw5msEdJHgr3Hknl6R8HdJqKWw0l6FKDqB8nOgVhDBZlU1kH4Jv0ENp11MHyJh6SvQwTnnjJ-jqQ0gUDiUUEAi6DtAoQlFDTBAWW1wrAjJp3iHniMgrLwlqG+DqlhAhCI33iahDF0BqFHEsAkD6El3zO7RxSLOejGgrI2geRqCZn0G0CrQDNP16FanNKIUYk7PAIoOHgrI-A+ElB6JuX12nTpO9HW2oUDTFD0gXNg11P1J8MGP1BmIiMmDXOrWGVfQviqScRZS6HKGsGnU6EPzqlXzXNbiLFIklG0FIlBEqA5RXw-NLyH3CyhyrxdQrK9BVQqxPmGRdhVm2L9lwrgSIt2223wsM1VFtzpxIq4MPlhGRgvgAkDAtMpnkFJ1BEEBnAUmLxgzwoYrh0IpAxYoYyY2koIpmArM9G9C4tZl4qaIEqLBNJuUkBKAuRSToq0SUr1LMqa1i0UrksvT8ICKCP8ArIsGbLqAdmnXURq0UwRPXFF0fAhC6m1ILIsvB2CqYtjFbHjHYoKTQMolkAXS6JFxhjFH4KEFvyhNCsIqJLL2ixIq9yan+MotlNMEECLDSpCpspCqyuYtstyPsuCKcpdysB0BqBRNGXXC+w3HHBBL-BIysD0PX1lwzRIphAeTarm1plInFAVnqQ0iMD9EqARnDJMsMKbTPJWorMrAeVaB4qLC6LBAvgViIRfS6D6FaHbj0JEL3Fhw2qlGGQdjmQ-Adm2LpIlC0Jmw3i6NhFv3wr-PCLt0AuisuN6CEorBKA3B6EoUUDIobzISOhq3U2DF2IkqcCyKiN-NqvyMcsBqWJgvBBlnRV6AAgEqdld23I-HLHkE0V8OGIiDGImJIq6K-GsD3gsFGW7nWNFC0O+Auj+LBMBCpt-NCL+vGLXJ5P5H5LRP2hkC-GBrkChGDHqQFrPCiHGH8BFuxrhLFr5IBElsQAP3HDz2MCsD6D4qVpiF8FiHcDVGQGWFFoaD5G1sFF1tFEAgN0AlqM9GXE5jsCAA */
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
        /**
         * Global event which closes the configuration
         */
        QUIT: {
          target: "#ROOT.CONFIGURATION_CLOSED"
        }
      },
      states: {
        /**
         * In this state the machine is waiting for the start of the configuration
         */
        WAITING_START: {
          tags: [LOADING_TAG],
          on: {
            /**
             * Event which starts the configuration setting the initiative and configuration mode to the context
             */
            START_CONFIGURATION: {
              target: "LOADING_INITIATIVE",
              actions: "startConfiguration"
            }
          }
        },

        /**
         * In this state the machine is fetching the initiative details.
         * If success the received data is set to the context.
         * If error the machine sets the failure in the context and transits to the failure state
         */
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

        /**
         * Evaluation state. Based on the received data in the previous state, the machines decides which
         * state to go next.
         */
        EVALUATING_INITIATIVE_CONFIGURATION: {
          tags: [LOADING_TAG],
          always: [
            {
              /**
               * Configuration in "INSTRUMENTS" mode
               */
              cond: "isInstrumentsOnlyMode",
              target: "CONFIGURING_INSTRUMENTS"
            },
            {
              /**
               * Configuration in "IBAN" mode
               */
              cond: "isIbanOnlyMode",
              target: "CONFIGURING_IBAN"
            },
            {
              /**
               * Configuration in "COMPLETE" mode, no iban or instruments already configured
               */
              cond: "isInitiativeConfigurationNeeded",
              target: "DISPLAYING_INTRO"
            },
            {
              /**
               * Configuration not needed (instruments and/or iban already configured)
               */
              target: "CONFIGURATION_NOT_NEEDED"
            }
          ]
        },

        /**
         * Configuration intro where we show what the user needs to configure the initiaitve
         */
        DISPLAYING_INTRO: {
          tags: [WAITING_USER_INPUT_TAG],
          entry: "navigateToConfigurationIntro",
          on: {
            /**
             * Generic event to go to the next state
             */
            NEXT: {
              target: "CONFIGURING_IBAN"
            }
          }
        },
        /**
         * Iban configuration states.
         * As soon as the machines enteres in this state, the "LOADING_IBAN_LIST" state is started
         */
        CONFIGURING_IBAN: {
          id: "IBAN",
          initial: "LOADING_IBAN_LIST",
          states: {
            /**
             * In this state we are fetching the iban list of the user.
             * If success, the `loadIbanListSuccess` actions sets the received data to the context
             */
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
                    /**
                     * If configuration mode is "IBAN", the machine should set the received failure to the
                     * context and go to the failure state
                     */
                    cond: "isIbanOnlyMode",
                    target: "#ROOT.CONFIGURATION_FAILURE",
                    actions: "setFailure"
                  },
                  {
                    /**
                     * If configuration mode is "COMPLETE", the machine should set the received failure to the
                     * context and go to the previous state
                     */
                    target: "#ROOT.DISPLAYING_INTRO",
                    actions: ["setFailure", "showFailureToast"]
                  }
                ]
              }
            },

            /**
             * In this state we are checking if the user has available ibans.
             */
            EVALUATING_IBAN_LIST: {
              tags: [LOADING_TAG],
              always: [
                {
                  /**
                   * If at least one iban is present, next state should be the iban selection state.
                   */
                  target: "DISPLAYING_IBAN_LIST",
                  cond: "hasIbanList"
                },
                {
                  /**
                   * If no iban is present, next state should be the iban onboarding.
                   */
                  target: "DISPLAYING_IBAN_ONBOARDING"
                }
              ]
            },

            /**
             * In this state we are showing to the user why there is a need of an IBAN
             */
            DISPLAYING_IBAN_ONBOARDING: {
              tags: [WAITING_USER_INPUT_TAG],
              entry: "navigateToIbanLandingScreen",
              on: {
                /**
                 * Generic next event to go to the next state
                 */
                NEXT: {
                  target: "DISPLAYING_IBAN_ONBOARDING_FORM"
                },
                /**
                 * Generic back event
                 */
                BACK: [
                  {
                    /**
                     * If configuration mode is "IBAN", the machine should go the the final state
                     */
                    cond: "isIbanOnlyMode",
                    target: "#ROOT.CONFIGURATION_CLOSED"
                  },
                  {
                    /**
                     * If configuration mode is "COMPLETE", the machine should go back to the previous state
                     */
                    target: "#ROOT.DISPLAYING_INTRO"
                  }
                ]
              }
            },

            /**
             * In this state we are showing the IBAN onboarding form
             */
            DISPLAYING_IBAN_ONBOARDING_FORM: {
              tags: [WAITING_USER_INPUT_TAG],
              entry: "navigateToIbanOnboardingScreen",
              on: {
                /**
                 * This event sets the created iban to the context wiht the `confirmIbanOnboarding` actions
                 * and then goes to the `CONFIRMING_IBAN` state
                 */
                CONFIRM_IBAN: {
                  target: "CONFIRMING_IBAN",
                  actions: "confirmIbanOnboarding"
                },
                /**
                 * Generic back event
                 */
                BACK: [
                  {
                    /**
                     * If the user has at least one IBAN, the machine goes to the display state
                     */
                    cond: "hasIbanList",
                    target: "DISPLAYING_IBAN_LIST"
                  },
                  {
                    /**
                     * If the user does not have an IBABN, the machine goes to the previous state
                     */
                    target: "DISPLAYING_IBAN_ONBOARDING"
                  }
                ]
              }
            },

            /**
             * In this state the machine is sending the IBAN to be created.
             * If success, the machine goes to the final state.
             * If error, the machine returns to the form and shows a failure
             */
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

            /**
             * In this state the machine shows the IBAN list to the user.
             * On entry, it navigates to the IBAN list screen
             */
            DISPLAYING_IBAN_LIST: {
              tags: [WAITING_USER_INPUT_TAG],
              entry: "navigateToIbanEnrollmentScreen",
              on: {
                /**
                 * Generic back event
                 */
                BACK: [
                  {
                    /**
                     * If the configuration mode is "IBAN", the configuration should be closed
                     */
                    cond: "isIbanOnlyMode",
                    target: "#ROOT.CONFIGURATION_CLOSED"
                  },
                  {
                    /**
                     * If the configuration mode is "COMPLETE", the machine should go back to the previous state
                     */
                    target: "#ROOT.DISPLAYING_INTRO"
                  }
                ],
                /**
                 * Event to transit to the IBAN creation
                 */
                NEW_IBAN_ONBOARDING: {
                  target: "DISPLAYING_IBAN_ONBOARDING_FORM"
                },
                /**
                 * This event set the selected IBAN in the context and prepares it to be enrolled in the next state.
                 */
                ENROLL_IBAN: {
                  target: "ENROLLING_IBAN",
                  actions: "selectIban"
                }
              }
            },

            /**
             * In this state the selected iban is being enrolled to the initiative with the `enrollIban` service
             * If success, the selected iban is removed from the context.
             * If error, the received failuer is put in the context and a failure toast is showed.
             */
            ENROLLING_IBAN: {
              tags: [UPSERTING_TAG],
              invoke: {
                src: "enrollIban",
                id: "enrollIban",
                onDone: [
                  {
                    /**
                     * If success and configuration mode is "IBAN", the next state is the IBAN list
                     * A success toast is displayed
                     */
                    cond: "isIbanOnlyMode",
                    target: "DISPLAYING_IBAN_LIST",
                    actions: ["enrollIbanSuccess", "showUpdateIbanToast"]
                  },
                  {
                    /**
                     * If success and configuration mode is "COMPLETE", the next state is the final state of the IBAN
                     */
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
            /**
             * Final Iban state, it triggers the parent `onDone`
             */
            IBAN_CONFIGURATION_COMPLETED: {
              type: "final"
            }
          },
          onDone: [
            {
              /**
               * If configuration mode is "IBAN", the configuration si completed
               */
              cond: "isIbanOnlyMode",
              target: "CONFIGURATION_COMPLETED"
            },
            {
              /**
               * If configuration mode is "COMPLETE", the next state is the instruments steps
               */
              target: "#ROOT.CONFIGURING_INSTRUMENTS"
            }
          ]
        },

        /**
         * Payment instrument configuration states.
         * As soon as the machines enteres in this state, the "LOADING_INSTRUMENTS" state is started
         */
        CONFIGURING_INSTRUMENTS: {
          id: "INSTRUMENTS",
          initial: "LOADING_INSTRUMENTS",
          states: {
            /**
             * In this state we are fetching the user's instruments.
             * This is a parallel state, which means that all the child states are executes simultaneously.
             * So as soon as the machine enters in this state, both `LOADING_WALLET_INSTRUMENTS` and `LOADING_INITIATIVE_INSTRUMENTS` starts
             */
            LOADING_INSTRUMENTS: {
              tags: [LOADING_TAG],
              entry: "navigateToInstrumentsEnrollmentScreen",
              type: "parallel",
              states: {
                /**
                 * In this state we are fetching the PagoPA payment instruments of the user.
                 * On success we set the received instrument to the context
                 *
                 * Note: instead to have a single state we have two child states (LOADING and LOAD_SUCCESS).
                 * This, unfortunately, is due to a limitation (or bug) of XState. A single state does not work.
                 */
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

                /**
                 * In this state we are fetching the IDPay payment instruments of the user.
                 * On success we set the received instrument to the context
                 *
                 * Note: instead to have a single state we have two child states (LOADING and LOAD_SUCCESS).
                 * This, unfortunately, is due to a limitation (or bug) of XState. A single state does not work.
                 */
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
                  /**
                   * If the user has PagoPA instruments we go to the state where we show the instrument toggles
                   */
                  cond: "hasInstruments",
                  target: "DISPLAYING_INSTRUMENTS"
                },
                {
                  /**
                   * If the configuration mode is "INSTRUMENT", we go to the state where we show the instrument toggles.
                   * In this case we do not care if the user does not have any PagoPA instrument
                   */
                  cond: "isInstrumentsOnlyMode",
                  target: "DISPLAYING_INSTRUMENTS"
                },
                {
                  /**
                   * User has no instrument to show, the machine goes to the success state and inform the user that
                   * he should add an instrument in order to use the initiative
                   */
                  target: "#ROOT.DISPLAYING_CONFIGURATION_SUCCESS"
                }
              ]
            },

            /**
             * In this state we are showing the instruments list to the user.
             * On entry we are updating the instrument statuses in the context to show the correct status in the instrument switch
             */
            DISPLAYING_INSTRUMENTS: {
              tags: [WAITING_USER_INPUT_TAG],
              entry: "updateInstrumentStatuses",
              invoke: {
                id: "instrumentsEnrollmentService",
                src: "instrumentsEnrollmentService"
              },
              on: {
                /**
                 * This event forwards the "ENROLL_INSTRUMENT" event to instrumentsEnrollmentService.
                 */
                ENROLL_INSTRUMENT: {
                  actions: [
                    "updateInstrumentStatus",
                    "forwardToInstrumentsEnrollmentService"
                  ]
                },

                ENROLL_INSTRUMENT_SUCCESS: {
                  actions: "updateInstrumentStatus"
                },

                ENROLL_INSTRUMENT_FAILURE: {
                  actions: [
                    "updateInstrumentStatus",
                    "showInstrumentFailureToast"
                  ]
                },

                /**
                 * This event forwards the "DELETE_INSTRUMEMT" event to instrumentsEnrollmentService.
                 */
                DELETE_INSTRUMENT: {
                  actions: [
                    "updateInstrumentStatus",
                    "forwardToInstrumentsEnrollmentService"
                  ]
                },

                DELETE_INSTRUMENT_SUCCESS: {
                  actions: "updateInstrumentStatus"
                },

                DELETE_INSTRUMENT_FAILURE: {
                  actions: [
                    "updateInstrumentStatus",
                    "showInstrumentFailureToast"
                  ]
                },

                /**
                 * Navigates to the payment method form
                 */
                ADD_PAYMENT_METHOD: {
                  actions: "navigateToAddPaymentMethodScreen"
                },

                /**
                 * Back navigation event
                 */
                BACK: [
                  {
                    /**
                     * If we are configuring instruments only, back navigation should close the configuration flow
                     */
                    cond: "isInstrumentsOnlyMode",
                    target: "#ROOT.CONFIGURATION_CLOSED"
                  },
                  {
                    /**
                     * If we are configuring the entire initiative, back navigation should go back to previous state
                     */
                    target: "#ROOT.CONFIGURING_IBAN"
                  }
                ],

                /**
                 * Default next event, we are going to the next state which completes the instruments configurations
                 */
                NEXT: {
                  target: "INSTRUMENTS_COMPLETED"
                },

                /**
                 * This event is like the NEXT event, except it sets to the context the `areInstrumentsSkipped` flag.
                 * This flag is used to display additional CTA at the end of the configuration process (DISPLAYING_CONFIGURATION_SUCCESS)
                 */
                SKIP: {
                  target: "INSTRUMENTS_COMPLETED",
                  actions: "skipInstruments"
                }
              }
            },

            /**
             * Final instrument section status. It triggers the parent `onDone`
             */
            INSTRUMENTS_COMPLETED: {
              type: "final"
            }
          },
          onDone: [
            {
              /**
               * If we are configuring instruments, the next state is the final state
               */
              cond: "isInstrumentsOnlyMode",
              target: "CONFIGURATION_COMPLETED"
            },
            {
              /**
               * If we are configuring the entire initiative, the next state is where we display the success message to the user
               */
              target: "DISPLAYING_CONFIGURATION_SUCCESS"
            }
          ]
        },

        /**
         * State where we are displaying the success message to the user.
         * On entry we navigate to the success screen with the `navigateToConfigurationSuccessScreen` action
         */
        DISPLAYING_CONFIGURATION_SUCCESS: {
          tags: [WAITING_USER_INPUT_TAG],
          entry: "navigateToConfigurationSuccessScreen",
          on: {
            /**
             * Transition to the final state
             */
            COMPLETE_CONFIGURATION: {
              target: "CONFIGURATION_COMPLETED"
            },

            /**
             * Navigation outside the configuration flow to the instrument form
             */
            ADD_PAYMENT_METHOD: {
              actions: "navigateToAddPaymentMethodScreen"
            }
          }
        },

        /**
         * If the configuration is already complete, the machine transit to this state which navigates to the
         * configuration success screen.
         */
        CONFIGURATION_NOT_NEEDED: {
          tags: [WAITING_USER_INPUT_TAG],
          entry: "navigateToConfigurationSuccessScreen",
          on: {
            /**
             * Transition to the final state
             */
            COMPLETE_CONFIGURATION: {
              target: "CONFIGURATION_COMPLETED"
            }
          }
        },

        /**
         * Final state, it navigates back to the initiative details screen
         */
        CONFIGURATION_COMPLETED: {
          type: "final",
          entry: "navigateToInitiativeDetailScreen"
        },

        /**
         * Final state, configuration closed by the user. It closes the configuration flow
         */
        CONFIGURATION_CLOSED: {
          type: "final",
          entry: "exitConfiguration"
        },

        /**
         * Final state, configuration failure. It shows a failure to the user and exits the configuration
         */
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
        confirmIbanOnboarding: assign((_, event) => ({
          ibanBody: event.ibanBody,
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
        forwardToInstrumentsEnrollmentService: forwardTo(
          "instrumentsEnrollmentService"
        ),
        updateInstrumentStatus: assign((context, event) => {
          switch (event.type) {
            case "ENROLL_INSTRUMENT":
              return {
                instrumentStatuses: {
                  ...context.instrumentStatuses,
                  [event.instrument.idWallet]: p.noneLoading
                }
              };
            case "ENROLL_INSTRUMENT_SUCCESS":
              const currentEnrollStatus =
                context.instrumentStatuses[event.instrument.idWallet];

              if (p.isSome(currentEnrollStatus)) {
                // No need to update instrument status
                return {};
              }

              return {
                instrumentStatuses: {
                  ...context.instrumentStatuses,
                  [event.instrument.idWallet]: p.some(
                    InstrumentStatusEnum.PENDING_ENROLLMENT_REQUEST
                  )
                }
              };
            case "ENROLL_INSTRUMENT_FAILURE":
              return {
                instrumentStatuses: {
                  ...context.instrumentStatuses,
                  [event.instrument.idWallet]: p.none
                }
              };
            case "DELETE_INSTRUMENT":
              if (event.instrument.idWallet === undefined) {
                return {};
              }

              return {
                instrumentStatuses: {
                  ...context.instrumentStatuses,
                  [event.instrument.idWallet]: p.noneLoading
                }
              };
            case "DELETE_INSTRUMENT_SUCCESS":
              if (event.instrument.idWallet === undefined) {
                return {};
              }

              const currentDeleteStatus =
                context.instrumentStatuses[event.instrument.idWallet];

              if (p.isSome(currentDeleteStatus)) {
                // No need to update instrument status
                return {};
              }

              return {
                instrumentStatuses: {
                  ...context.instrumentStatuses,
                  [event.instrument.idWallet]: p.some(
                    InstrumentStatusEnum.PENDING_DEACTIVATION_REQUEST
                  )
                }
              };
            case "DELETE_INSTRUMENT_FAILURE":
              if (event.instrument.idWallet === undefined) {
                return {};
              }

              return {
                instrumentStatuses: {
                  ...context.instrumentStatuses,
                  [event.instrument.idWallet]: p.some(
                    InstrumentStatusEnum.ACTIVE
                  )
                }
              };
          }
        }),
        skipInstruments: assign((_, __) => ({
          areInstrumentsSkipped: true
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
