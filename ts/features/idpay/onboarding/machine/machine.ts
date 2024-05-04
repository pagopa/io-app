/* eslint-disable sonarjs/no-identical-functions */
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { and, assertEvent, assign, fromPromise, setup } from "xstate";
import { InitiativeDataDTO } from "../../../../../definitions/idpay/InitiativeDataDTO";
import { StatusEnum as OnboardingStatusEnum } from "../../../../../definitions/idpay/OnboardingStatusDTO";
import { RequiredCriteriaDTO } from "../../../../../definitions/idpay/RequiredCriteriaDTO";
import {
  LOADING_TAG,
  WAITING_USER_INPUT_TAG,
  notImplementedStub
} from "../../../../xstate/utils";
import {
  OnboardingFailure,
  OnboardingFailureEnum
} from "../types/OnboardingFailure";
import * as Context from "./context";
import * as Events from "./events";
import {
  getBooleanSelfDeclarationListFromContext,
  getMultiSelfDeclarationListFromContext
} from "./selectors";

export const idPayOnboardingMachine = setup({
  types: {
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
    closeOnboarding: notImplementedStub
  },
  actors: {
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
    assertServiceId: ({ event }) => {
      assertEvent(event, "start-onboarding");
      return event.serviceId.length > 0;
    },
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
    isFirstMultiConsentPage: ({ context }) =>
      context.selfDeclarationsMultiPage === 0,
    isLastMultiConsent: ({ context }) =>
      context.selfDeclarationsMultiPage >=
      getMultiSelfDeclarationListFromContext(context).length - 1
  }
}).createMachine({
  id: "idpay-onboarding",
  context: Context.Context,
  initial: "Idle",
  on: {
    close: {
      actions: "closeOnboarding"
    }
  },
  states: {
    Idle: {
      tags: [LOADING_TAG],
      on: {
        "start-onboarding": {
          guard: "assertServiceId",
          actions: assign(({ event }) => ({
            serviceId: event.serviceId
          })),
          target: "LoadingInitiative"
        }
      }
    },
    LoadingInitiative: {
      tags: [LOADING_TAG],
      entry: "navigateToInitiativeDetailsScreen",
      initial: "LoadingInitiativeInfo",
      states: {
        LoadingInitiativeInfo: {
          invoke: {
            src: "getInitiativeInfo",
            input: ({ context }) => context.serviceId,
            onDone: {
              actions: assign(({ event }) => ({
                initiative: O.some(event.output)
              })),
              target: "LoadingOnboardingStatus"
            },
            onError: {
              actions: assign(({ event }) => ({
                failure: pipe(
                  OnboardingFailure.decode(event.error),
                  O.fromEither
                )
              })),
              target: "#idpay-onboarding.OnboardingFailure"
            }
          }
        },

        LoadingOnboardingStatus: {
          type: "final",
          invoke: {
            src: "getOnboardingStatus",
            input: ({ context }) => selectInitiativeId(context),
            onDone: {
              actions: assign(({ event }) => ({
                onboardingStatus: event.output
              }))
            },
            onError: {
              actions: assign(({ event }) => ({
                failure: pipe(
                  OnboardingFailure.decode(event.error),
                  O.fromEither
                )
              })),
              target: "#idpay-onboarding.OnboardingFailure"
            }
          }
        }
      },

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
        onError: {
          actions: assign(({ event }) => ({
            failure: pipe(OnboardingFailure.decode(event.error), O.fromEither)
          })),
          target: "OnboardingFailure"
        },
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
        onError: {
          actions: assign(({ event }) => ({
            failure: pipe(OnboardingFailure.decode(event.error), O.fromEither)
          })),
          target: "OnboardingFailure"
        },
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
          target: "#idpay-onboarding.DisplayingInitiativeInfo"
        }
      }
    },

    DisplayingSelfDeclarationList: {
      tags: [WAITING_USER_INPUT_TAG],
      initial: "Evaluating",
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
                target: "#idpay-onboarding.DisplayingPdndCriteria"
              },
              {
                target: "#idpay-onboarding.DisplayingInitiativeInfo"
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
                target: "#idpay-onboarding.AcceptingCriteria"
              }
            ]
          }
        },

        DisplayingMultiSelfDeclarationList: {
          tags: [WAITING_USER_INPUT_TAG],
          initial: "DisplayingMultiSelfDeclarationItem",
          states: {
            DisplayingMultiSelfDeclarationItem: {
              entry: "navigateToMultiSelfDeclarationListScreen",
              on: {
                "select-multi-consent": {
                  actions: assign(({ context, event }) => ({
                    selfDeclarationsMultiAnwsers: {
                      ...context.selfDeclarationsMultiAnwsers,
                      [context.selfDeclarationsMultiPage]: event.data
                    }
                  })),
                  target: "EvaluatingMultiSelfDeclarationList"
                },
                back: [
                  {
                    guard: and([
                      "isFirstMultiConsentPage",
                      "hasBooleanSelfDeclarationList"
                    ]),
                    target:
                      "#idpay-onboarding.DisplayingSelfDeclarationList.DisplayingBooleanSelfDeclarationList"
                  },
                  {
                    guard: and(["isFirstMultiConsentPage", "hasPdndCriteria"]),
                    target: "#idpay-onboarding.DisplayingPdndCriteria"
                  },
                  {
                    guard: "isFirstMultiConsentPage",
                    target: "#idpay-onboarding.DisplayingInitiativeInfo"
                  },
                  {
                    actions: assign(({ context }) => ({
                      selfDeclarationsMultiPage:
                        +context.selfDeclarationsMultiPage - 1
                    }))
                  }
                ]
              }
            },
            EvaluatingMultiSelfDeclarationList: {
              always: [
                {
                  guard: "isLastMultiConsent",
                  target: "#idpay-onboarding.AcceptingCriteria"
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
        onError: {
          actions: assign(({ event }) => ({
            failure: pipe(OnboardingFailure.decode(event.error), O.fromEither)
          })),
          target: "OnboardingFailure"
        },
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
      always: {
        guard: ({ context }) =>
          pipe(
            context.failure,
            O.map(f => f === OnboardingFailureEnum.SESSION_EXPIRED),
            O.getOrElse(() => false)
          ),
        actions: "closeOnboarding"
      },
      on: {
        next: {
          actions: "navigateToInitiativeMonitoringScreen"
        }
      }
    }
  }
});

const selectInitiativeId = (context: Context.Context) =>
  pipe(
    context.initiative,
    O.map(initiative => initiative.initiativeId)
  );

export type IdPayOnboardingMachine = typeof idPayOnboardingMachine;
