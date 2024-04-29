import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { assertEvent, assign, fromPromise, setup } from "xstate";
import { InitiativeDataDTO } from "../../../../../definitions/idpay/InitiativeDataDTO";
import { StatusEnum as OnboardingStatusEnum } from "../../../../../definitions/idpay/OnboardingStatusDTO";
import { RequiredCriteriaDTO } from "../../../../../definitions/idpay/RequiredCriteriaDTO";
import {
  LOADING_TAG,
  WAITING_USER_INPUT_TAG,
  notImplementedStub
} from "../../../../xstate/utils";
import * as Context from "./context";
import * as Events from "./events";
import * as Input from "./input";
import {
  getBooleanSelfDeclarationListFromContext,
  getMultiSelfDeclarationListFromContext
} from "./selectors";

export const idPayOnboardingMachine = setup({
  types: {
    input: {} as Input.Input,
    context: {} as Context.Context,
    events: {} as Events.Events
  },
  actions: {
    navigateToInitiativeDetailsScreen: notImplementedStub,
    navigateToPdndCriteriaScreen: notImplementedStub,
    navigateToBoolSelfDeclarationListScreen: notImplementedStub,
    navigateToMultiSelfDeclarationListScreen: notImplementedStub,
    navigateToCompletionScreen: notImplementedStub,
    navigateToFailureScreen: notImplementedStub,
    navigateToInitiativeMonitoringScreen: notImplementedStub,
    handleSessionExpired: notImplementedStub,
    closeOnboarding: notImplementedStub
  },
  actors: {
    onInit: fromPromise<Context.Context, Input.Input>(({ input }) =>
      Input.Input(input)
    ),
    getInitiativeInfo: fromPromise<InitiativeDataDTO, string>(
      notImplementedStub
    ),
    getOnboardingStatus: fromPromise<
      O.Option<OnboardingStatusEnum>,
      O.Option<string>
    >(notImplementedStub),
    acceptTos: fromPromise<undefined, O.Option<string>>(notImplementedStub),
    getRequiredCriteria: fromPromise<
      O.Option<RequiredCriteriaDTO>,
      O.Option<string>
    >(notImplementedStub),
    acceptRequiredCriteria: fromPromise<undefined, Context.Context>(
      notImplementedStub
    )
  },
  guards: {
    isSessionExpired: () => false,
    hasPdndCriteria: ({ context }) =>
      pipe(
        context.requiredCriteria,
        O.map(({ pdndCriteria }) => pdndCriteria.length > 0),
        O.getOrElse(() => false)
      ),
    hasSelfDecalrationList: ({ context }) =>
      pipe(
        context.requiredCriteria,
        O.map(({ selfDeclarationList }) => selfDeclarationList.length > 0),
        O.getOrElse(() => false)
      ),
    hasBooleanSelfDeclarationList: ({ context }) =>
      getBooleanSelfDeclarationListFromContext(context).length > 0,
    hasMultiSelfDeclarationList: ({ context }) =>
      getMultiSelfDeclarationListFromContext(context).length > 0,
    isLastMultiConsent: ({ context }) =>
      context.selfDeclarationsMultiPage >=
      getMultiSelfDeclarationListFromContext(context).length - 1
  }
}).createMachine({
  id: "idpay-onboarding",
  context: Context.Context,
  invoke: {
    src: "onInit",
    input: ({ event }) => {
      assertEvent(event, "xstate.init");
      return event.input;
    },
    onError: {
      target: ".OnboardingFailure"
    },
    onDone: {
      actions: assign(event => ({ ...event.event.output })),
      target: ".LoadingInitiativeInfo"
    }
  },
  initial: "LoadingInitiative",
  on: {
    close: {
      actions: "closeOnboarding"
    }
  },
  states: {
    LoadingInitiative: {
      tags: [LOADING_TAG],
      entry: "navigateToInitiativeDetailsScreen",
      states: {
        LoadingInitiativeInfo: {
          invoke: {
            src: "getInitiativeInfo",
            input: ({ context }) => context.serviceId,
            onDone: {
              actions: assign(({ event }) => ({
                initiative: O.some(event.output)
              })),
              target: ".LoadingInitiative.LoadingOnboardingStatus"
            }
          }
        },

        LoadingOnboardingStatus: {
          invoke: {
            src: "getOnboardingStatus",
            input: ({ context }) => selectInitiativeId(context),
            onDone: {
              actions: assign(({ event }) => ({
                onboardingStatus: event.output
              }))
            }
          }
        }
      },
      onError: [
        {
          guard: "isSessionExpired",
          target: "SessionExpired"
        },
        {
          target: "OnboardingFailure"
        }
      ],
      onDone: {
        target: "DisplayingInitiativeInfo"
      }
    },

    DisplayingInitiativeInfo: {
      tags: [WAITING_USER_INPUT_TAG],
      on: {
        next: {
          target: "AcceptingTos"
        }
      }
    },

    AcceptingTos: {
      tags: [LOADING_TAG],
      invoke: {
        src: "acceptTos",
        input: ({ context }) => selectInitiativeId(context),
        onError: [
          {
            guard: "isSessionExpired",
            target: "SessionExpired"
          },
          {
            target: "OnboardingFailure"
          }
        ],
        onDone: {
          target: "LoadingCriteria"
        }
      }
    },

    LoadingCriteria: {
      tags: [LOADING_TAG],
      invoke: {
        src: "getRequiredCriteria",
        input: ({ context }) => selectInitiativeId(context),
        onError: [
          {
            guard: "isSessionExpired",
            target: "SessionExpired"
          },
          {
            target: "OnboardingFailure"
          }
        ],
        onDone: {
          actions: assign(({ event }) => ({
            requiredCriteria: event.output
          })),
          target: "EvaluatingRequiredCriteria"
        }
      }
    },

    EvaluatingRequiredCriteria: {
      always: [
        {
          guard: "hasPdndCriteria",
          target: "DisplayingPdndCriteria"
        },
        {
          guard: "hasSelfDecalrationList",
          target: "DisplayingSelfDeclarationList"
        },
        {
          target: "OnboardingCompleted"
        }
      ]
    },

    DisplayingPdndCriteria: {
      tags: [WAITING_USER_INPUT_TAG],
      entry: "navigateToPdndCriteriaScreen",
      on: {
        next: [
          {
            guard: "hasSelfDecalrationList",
            target: "DisplayingSelfDeclarationList"
          },
          {
            target: "AcceptingCriteria"
          }
        ],
        back: {
          target: "DisplayingInitiativeInfo"
        }
      }
    },

    DisplayingSelfDeclarationList: {
      tags: [WAITING_USER_INPUT_TAG],
      states: {
        Evaluating: {
          tags: [LOADING_TAG],
          always: [
            {
              guard: "hasBooleanSelfDeclarationList",
              target: "DisplayingBooleanSelfDeclarationList"
            },
            {
              guard: "hasMultiSelfDeclarationList",
              target: "DisplayingMultiSelfDeclarationList"
            }
          ]
        },

        DisplayingBooleanSelfDeclarationList: {
          tags: [WAITING_USER_INPUT_TAG],
          entry: "navigateToBoolSelfDeclarationListScreen",
          on: {
            back: [
              {
                guard: "hasPdndCriteria",
                target: "DisplayingPdndCriteria"
              },
              {
                target: "DisplayingInitiativeInfo"
              }
            ],
            "toggle-bool-criteria": {
              actions: assign(({ context, event }) => ({
                selfDeclarationsBoolAnswers: {
                  ...context.selfDeclarationsBoolAnswers,
                  [event.criteria.code]: event.criteria.value
                }
              }))
            },
            next: [
              {
                guard: "hasMultiSelfDeclarationList",
                target: "DisplayingMultiSelfDeclarationList"
              },
              {
                target: "AcceptingCriteria"
              }
            ]
          }
        },

        DisplayingMultiSelfDeclarationList: {
          tags: [WAITING_USER_INPUT_TAG],
          states: {
            DisplayingMultiSelfDeclarationItem: {
              entry: "navigateToMultiSelfDeclarationListScreen",
              on: {
                "select-multi-consent": [
                  {
                    actions: assign(({ context, event }) => ({
                      selfDeclarationsMultiAnwsers: {
                        ...context.selfDeclarationsMultiAnwsers,
                        [context.selfDeclarationsMultiPage]: event.data
                      }
                    }))
                  }
                ]
              }
            },
            EvaluatingMultiSelfDeclarationList: {
              always: [
                {
                  guard: "isLastMultiConsent",
                  target: "AcceptingCriteria"
                },
                {
                  actions: assign(({ context }) => ({
                    selfDeclarationsMultiPage:
                      +context.selfDeclarationsMultiPage + 1
                  })),
                  target: "DisplayingMultiSelfDeclarationItem"
                }
              ]
            }
          }
        }
      }
    },

    AcceptingCriteria: {
      tags: [LOADING_TAG],
      invoke: {
        src: "acceptRequiredCriteria",
        input: ({ context }) => context,
        onError: [
          {
            guard: "isSessionExpired",
            target: "SessionExpired"
          },
          {
            target: "OnboardingFailure"
          }
        ],
        onDone: {
          target: "OnboardingCompleted"
        }
      }
    },

    OnboardingCompleted: {
      tags: [WAITING_USER_INPUT_TAG],
      entry: "navigateToCompletionScreen"
    },

    OnboardingFailure: {
      entry: "navigateToFailureScreen",
      on: {
        next: {
          actions: "navigateToInitiativeMonitoringScreen"
        }
      }
    },

    SessionExpired: {
      entry: ["handleSessionExpired", "closeOnboarding"]
    }
  }
});

const selectInitiativeId = (context: Context.Context) =>
  pipe(
    context.initiative,
    O.map(initiative => initiative.initiativeId)
  );

export type IdPayOnboardingMachine = typeof idPayOnboardingMachine;
