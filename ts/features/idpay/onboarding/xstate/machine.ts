import * as O from "fp-ts/lib/Option";
import { assign, createMachine } from "xstate";
import { InitiativeDto } from "../../../../../definitions/idpay/onboarding/InitiativeDto";
import { StatusEnum } from "../../../../../definitions/idpay/onboarding/OnboardingStatusDTO";
import { RequiredCriteriaDTO } from "../../../../../definitions/idpay/onboarding/RequiredCriteriaDTO";
import {
  LOADING_TAG,
  UPSERTING_TAG,
  WAITING_USER_INPUT_TAG
} from "../../../../utils/xstate";
import { OnboardingFailureType } from "./failure";

// Context types
export type Context = {
  serviceId?: string;
  initiative?: InitiativeDto;
  initiativeStatus?: StatusEnum;
  requiredCriteria?: O.Option<RequiredCriteriaDTO>;
  failure?: OnboardingFailureType;
};

// Events types
type E_SELECT_INITIATIVE = {
  type: "SELECT_INITIATIVE";
  serviceId: string;
};

type E_ACCEPT_TOS = {
  type: "ACCEPT_TOS";
};

type E_ACCEPT_REQUIRED_PDND_CRITERIA = {
  type: "ACCEPT_REQUIRED_PDND_CRITERIA";
};

type E_ACCEPT_REQUIRED_SELF_CRITERIA = {
  type: "ACCEPT_REQUIRED_SELF_CRITERIA";
};

type E_QUIT_ONBOARDING = {
  type: "QUIT_ONBOARDING";
};

type E_GO_BACK = {
  type: "GO_BACK";
};

type Events =
  | E_SELECT_INITIATIVE
  | E_ACCEPT_TOS
  | E_ACCEPT_REQUIRED_PDND_CRITERIA
  | E_ACCEPT_REQUIRED_SELF_CRITERIA
  | E_QUIT_ONBOARDING
  | E_GO_BACK;

// Services types
type Services = {
  loadInitiative: {
    data: InitiativeDto;
  };
  loadInitiativeStatus: {
    data: StatusEnum | undefined;
  };
  acceptTos: {
    data: undefined;
  };
  loadRequiredCriteria: {
    data: O.Option<RequiredCriteriaDTO>;
  };
  acceptRequiredCriteria: {
    data: undefined;
  };
};

const isOnboardingDone = (context: Context) => {
  const initiativeStatus = context.initiativeStatus;
  return (
    initiativeStatus === StatusEnum.ONBOARDING_OK ||
    initiativeStatus === StatusEnum.ON_EVALUATION
  );
};

const isOnboardingFailed = (context: Context) => {
  const initiativeStatus = context.initiativeStatus;
  return initiativeStatus === StatusEnum.ONBOARDING_KO;
};

const hasPDNDRequiredCriteria = (context: Context) => {
  const requiredCriteria = context.requiredCriteria;
  if (requiredCriteria !== undefined && O.isSome(requiredCriteria)) {
    return requiredCriteria.value.pdndCriteria.length > 0;
  }

  return false;
};

const hasSelfRequiredCriteria = (context: Context) => {
  const requiredCriteria = context.requiredCriteria;
  if (requiredCriteria !== undefined && O.isSome(requiredCriteria)) {
    return requiredCriteria.value.selfDeclarationList.length > 0;
  }

  return false;
};

const createIDPayOnboardingMachine = () =>
  /** @xstate-layout N4IgpgJg5mDOIC5QEkAiAFAggTQPoHkA5AIX0wCVVlCBxAOgHVNkAVam3a15TNgNQCiuAMoCAMgIDCbIgGJRE6Z0LdeyQQG0ADAF1EoAA4B7WAEsALqaMA7fSACeiAEwAWLQBoQAD2cB2AMx0vgCs-v6+TgCMAJxO-gAcTvEAvsmeaFh4RKQUVLR0YmR5HFxsaoKyEDZgdKbWAG5GANY1ADZGAIYQyNYWph2W9WDaekggxmaWNnaOCP7B8UGR8aFaAGzBLtFaEZ4+CE6+i+Errkdah-4uLqnpGDgEJGSU7HRUwuhiOOzKqvwCskwkkkAnQLFwLHwwhGdgmfWmY32kSOdC0LiOLic22iwV8WminlmuN8dEiLmROM2WmC0RCtxAGQe2WexToQJBYJ+kOElWqtQazRqHQAxsKwAZzCwTDCxnCprZEYgwotljF4kdIsFlmjCYg8cdMS55gtIpEtP5IvTGVknrlXoVMMVcOQBABFACqyBdqFwknIrAE-swvOsNTqjRadHaXXIYAAjgBXUwAJ0gkmTFjAGY6MsMJnhCtAs3VWjoawCvhcazN2y08Xie0QLmCTjoLfi0X86zWbjWTmCqTSIGsRggcDs1seORe+SY3FovzK-xE4ikMkIsPz8rs+w8Dmcbit9xt09ZDqdpR4-03kyshe8iD3s3mi18y1WGy2OycR8yU5ZrzvJ83wLpe5QCDeBY7o+uoIMEaJ0OqazRJEaz1qEvhrL+TK2jO9DsqCbALtykHboqCBPogyFrIhmEoWhKzhFhQ6Tsydr5OePwuh6XoCD6foBkGpF3tBFGwSWZYVlWNZaHWKQsce-7sfQAh8JgYjumoC7cZ63q+v6LCBjwwkIqAu6wWaayBOaVYrJEVz1r4vjYSeAG0CZ977AAtC4Db7ggmqRKiUTqniWj2aEcSDskQA */
  createMachine(
    {
      context: {},
      tsTypes: {} as import("./machine.typegen").Typegen0,
      schema: {
        context: {} as Context,
        events: {} as Events,
        services: {} as Services
      },
      predictableActionArguments: true,
      id: "IDPAY_ONBOARDING",
      initial: "WAITING_INITIATIVE_SELECTION",
      on: {
        QUIT_ONBOARDING: {
          actions: "exitOnboarding"
        }
      },
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
                target: "LOADING_INITIATIVE_STATUS",
                actions: "loadInitiativeSuccess"
              }
            ],
            onError: [
              {
                target: "DISPLAYING_ONBOARDING_FAILURE",
                actions: "loadInitiativeFailure"
              }
            ]
          }
        },
        LOADING_INITIATIVE_STATUS: {
          tags: [LOADING_TAG],
          invoke: {
            src: "loadInitiativeStatus",
            id: "loadInitiativeStatus",
            onDone: [
              {
                target: "EVALUATING_INITIATIVE_STATUS",
                actions: "loadInitiativeStatusSuccess"
              }
            ],
            onError: [
              {
                target: "DISPLAYING_ONBOARDING_FAILURE",
                actions: "loadInitiativeStatusFailure"
              }
            ]
          }
        },
        EVALUATING_INITIATIVE_STATUS: {
          always: [
            {
              target: "DISPLAYING_ONBOARDING_FAILURE",
              cond: "isOnboardingDone",
              actions: "onOnboardingDone"
            },
            {
              target: "DISPLAYING_ONBOARDING_FAILURE",
              cond: "isOnboardingFailed",
              actions: "onOnboardingFailed"
            },
            {
              target: "DISPLAYING_INITIATIVE"
            }
          ]
        },
        DISPLAYING_INITIATIVE: {
          entry: "navigateToInitiativeDetailsScreen",
          on: {
            ACCEPT_TOS: {
              target: "ACCEPTING_TOS"
            }
          }
        },
        ACCEPTING_TOS: {
          tags: [UPSERTING_TAG],
          invoke: {
            id: "acceptTos",
            src: "acceptTos",
            onDone: [
              {
                target: "LOADING_REQUIRED_CRITERIA"
              }
            ],
            onError: [
              {
                target: "DISPLAYING_ONBOARDING_FAILURE",
                actions: "acceptTosFailure"
              }
            ]
          }
        },
        LOADING_REQUIRED_CRITERIA: {
          tags: [LOADING_TAG],
          invoke: {
            id: "loadRequiredCriteria",
            src: "loadRequiredCriteria",
            onDone: [
              {
                target: "EVALUATING_REQUIRED_CRITERIA",
                actions: "loadRequiredCriteriaSuccess"
              }
            ],
            onError: [
              {
                target: "DISPLAYING_ONBOARDING_FAILURE",
                actions: "loadRequiredCriteriaFailure"
              }
            ]
          }
        },
        // Self transition node to evaluate required criteria
        EVALUATING_REQUIRED_CRITERIA: {
          tags: [LOADING_TAG],
          always: [
            {
              target: "DISPLAYING_REQUIRED_PDND_CRITERIA",
              cond: "hasPDNDRequiredCriteria"
            },
            {
              target: "DISPLAYING_REQUIRED_SELF_CRITERIA",
              cond: "hasSelfRequiredCriteria"
            },
            {
              target: "DISPLAYING_ONBOARDING_COMPLETED"
            }
          ]
        },
        DISPLAYING_REQUIRED_PDND_CRITERIA: {
          tags: [WAITING_USER_INPUT_TAG],
          entry: "navigateToPDNDCriteriaScreen",
          on: {
            ACCEPT_REQUIRED_PDND_CRITERIA: [
              {
                target: "DISPLAYING_REQUIRED_SELF_CRITERIA",
                cond: "hasSelfRequiredCriteria"
              },
              {
                target: "ACCEPTING_REQUIRED_CRITERIA"
              }
            ],
            GO_BACK: [
              {
                target: "DISPLAYING_INITIATIVE"
              }
            ]
          }
        },
        DISPLAYING_REQUIRED_SELF_CRITERIA: {
          tags: [WAITING_USER_INPUT_TAG],
          entry: "navigateToSelfDeclarationsScreen",
          on: {
            ACCEPT_REQUIRED_SELF_CRITERIA: {
              target: "ACCEPTING_REQUIRED_CRITERIA"
            },
            GO_BACK: [
              {
                target: "DISPLAYING_REQUIRED_PDND_CRITERIA",
                cond: "hasPDNDRequiredCriteria"
              },
              {
                target: "DISPLAYING_INITIATIVE"
              }
            ]
          }
        },
        ACCEPTING_REQUIRED_CRITERIA: {
          tags: [UPSERTING_TAG],
          entry: "navigateToCompletionScreen",
          invoke: {
            src: "acceptRequiredCriteria",
            id: "acceptRequiredCriteria",
            onDone: [
              {
                target: "DISPLAYING_ONBOARDING_COMPLETED"
              }
            ]
          }
        },
        DISPLAYING_ONBOARDING_COMPLETED: {
          entry: "navigateToCompletionScreen"
        },
        DISPLAYING_ONBOARDING_FAILURE: {
          entry: "navigateToFailureScreen"
        }
      }
    },
    {
      actions: {
        selectInitiative: assign((_, event) => ({
          serviceId: event.serviceId
        })),
        loadInitiativeSuccess: assign((_, event) => ({
          initiative: event.data
        })),
        loadInitiativeFailure: assign((_, event) => ({
          failure: event.data as OnboardingFailureType
        })),
        loadInitiativeStatusSuccess: assign((_, event) => ({
          initiativeStatus: event.data
        })),
        loadInitiativeStatusFailure: assign((_, event) => ({
          failure: event.data as OnboardingFailureType
        })),
        onOnboardingDone: assign((_, __) => ({
          failure: OnboardingFailureType.ALREADY_COMPLETED
        })),
        onOnboardingFailed: assign((_, __) => ({
          failure: OnboardingFailureType.ONBOARDING_KO
        })),
        loadRequiredCriteriaSuccess: assign((_, event) => ({
          requiredCriteria: event.data
        })),
        loadRequiredCriteriaFailure: assign((_, event) => ({
          failure: event.data as OnboardingFailureType
        })),
        acceptTosFailure: assign((_, event) => ({
          failure: event.data as OnboardingFailureType
        }))
      },
      guards: {
        isOnboardingDone,
        isOnboardingFailed,
        hasPDNDRequiredCriteria,
        hasSelfRequiredCriteria
      }
    }
  );

type IDPayOnboardingMachineType = ReturnType<
  typeof createIDPayOnboardingMachine
>;

export type { IDPayOnboardingMachineType };
export { createIDPayOnboardingMachine };
