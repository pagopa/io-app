/* eslint-disable sonarjs/no-identical-functions */
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { and, assertEvent, assign, fromPromise, setup } from "xstate";
import { InitiativeDataDTO } from "../../../../../definitions/idpay/InitiativeDataDTO";
import { StatusEnum as OnboardingStatusEnum } from "../../../../../definitions/idpay/OnboardingStatusDTO";
import { RequiredCriteriaDTO } from "../../../../../definitions/idpay/RequiredCriteriaDTO";
import { IdPayTags } from "../../common/machine/tags";
import { InitiativeFailureType } from "../../configuration/types/failure";
import { OnboardingFailure } from "../types/OnboardingFailure";
import { Context, InitialContext } from "./context";
import { IdPayOnboardingEvents } from "./events";
import {
  getBooleanSelfDeclarationListFromContext,
  getInputFormSelfDeclarationFromContext,
  getMultiSelfDeclarationListFromContext
} from "./selectors";

const notImplementedStub = () => {
  throw new Error("Not implemented");
};

export const idPayOnboardingMachine = setup({
  types: {
    context: {} as Context,
    events: {} as IdPayOnboardingEvents
  },
  actions: {
    navigateToInitiativeDetailsScreen: notImplementedStub,
    navigateToPdndCriteriaScreen: notImplementedStub,
    navigateToBoolSelfDeclarationListScreen: notImplementedStub,
    navigateToMultiSelfDeclarationListScreen: notImplementedStub,
    navigateToCompletionScreen: notImplementedStub,
    navigateToFailureScreen: notImplementedStub,
    navigateToFailureToRetryScreen: notImplementedStub,
    navigateToInitiativeMonitoringScreen: notImplementedStub,
    closeOnboarding: notImplementedStub,
    handleSessionExpired: notImplementedStub,
    navigateToInputFormScreen: notImplementedStub,
    navigateToEnableNotificationScreen: notImplementedStub,
    navigateToEnableMessageScreen: notImplementedStub
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
    acceptRequiredCriteria: fromPromise<undefined, Context>(notImplementedStub)
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
    hasInputFormDeclaration: ({ context }) =>
      getInputFormSelfDeclarationFromContext(context).length > 0,
    isFirstMultiConsentPage: ({ context }) =>
      context.selfDeclarationsMultiPage === 0,
    isLastMultiConsent: ({ context }) =>
      context.selfDeclarationsMultiPage >=
      getMultiSelfDeclarationListFromContext(context).length - 1,
    isFirstMultiTextConsent: ({ context }) =>
      context.activeTextConsentPage === 0,
    isLastTextConsent: ({ context }) =>
      context.activeTextConsentPage >=
      getInputFormSelfDeclarationFromContext(context).length - 1,
    isSessionExpired: ({ event }: { event: IdPayOnboardingEvents }) =>
      "error" in event && event.error === InitiativeFailureType.SESSION_EXPIRED,
    isTooManyRequests: ({ event }: { event: IdPayOnboardingEvents }) =>
      "error" in event &&
      event.error === InitiativeFailureType.TOO_MANY_REQUESTS,

    shouldShowEnableNotificationOnClose: ({ context }) =>
      !context.isPushNotificationsEnabled,
    hasMessageConsent: ({ context }) => !context.hasInbox
  }
}).createMachine({
  id: "idpay-onboarding",
  context: InitialContext,
  initial: "Idle",
  on: {
    close: {
      actions: "closeOnboarding"
    }
  },
  states: {
    Idle: {
      tags: [IdPayTags.Loading],
      on: {
        "start-onboarding": {
          guard: "assertServiceId",
          actions: assign(({ event }) => ({
            serviceId: event.serviceId,
            hasInbox: event.hasInbox,
            currentStep: 1
          })),
          target: "LoadingInitiative"
        }
      }
    },
    LoadingInitiative: {
      tags: [IdPayTags.Loading],
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
            onError: [
              {
                guard: "isSessionExpired",
                target: "#idpay-onboarding.SessionExpired"
              },
              {
                actions: assign(({ event }) => ({
                  failure: pipe(
                    OnboardingFailure.decode(event.error),
                    O.fromEither
                  )
                })),
                target: "#idpay-onboarding.OnboardingFailure"
              }
            ]
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
      on: {
        next: [
          {
            guard: "hasMessageConsent",
            target: "EnableMessage"
          },
          {
            target: "AcceptingTos"
          }
        ]
      }
    },

    EnableMessage: {
      entry: "navigateToEnableMessageScreen",
      on: {
        next: {
          target: "AcceptingTos"
        }
      }
    },

    AcceptingTos: {
      tags: [IdPayTags.Loading],
      invoke: {
        src: "acceptTos",
        input: ({ context }) => selectInitiativeId(context),
        onDone: {
          target: "LoadingCriteria"
        },
        onError: [
          {
            guard: "isTooManyRequests",
            target: "TooManyRequests"
          },
          {
            guard: "isSessionExpired",
            target: "SessionExpired"
          },
          {
            actions: assign(({ event }) => ({
              failure: pipe(OnboardingFailure.decode(event.error), O.fromEither)
            })),
            target: "OnboardingFailure"
          }
        ]
      }
    },

    LoadingCriteria: {
      tags: [IdPayTags.Loading],
      invoke: {
        src: "getRequiredCriteria",
        input: ({ context }) => selectInitiativeId(context),
        onDone: {
          actions: assign(({ event }) => ({
            requiredCriteria: event.output
          })),
          target: "EvaluatingRequiredCriteria"
        },
        onError: [
          {
            guard: "isTooManyRequests",
            target: "TooManyRequests"
          },
          {
            guard: "isSessionExpired",
            target: "SessionExpired"
          },
          {
            actions: assign(({ event }) => ({
              failure: pipe(OnboardingFailure.decode(event.error), O.fromEither)
            })),
            target: "OnboardingFailure"
          }
        ]
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
      entry: "navigateToPdndCriteriaScreen",
      on: {
        next: [
          {
            actions: assign(({ context }) => ({
              currentStep: context.currentStep + 1
            })),
            guard: "hasSelfDecalrationList",
            target: "DisplayingSelfDeclarationList"
          },
          {
            actions: assign(({ context }) => ({
              currentStep: context.currentStep + 1
            })),
            target: "AcceptingCriteria"
          }
        ],
        back: {
          actions: assign(({ context }) => ({
            currentStep: context.currentStep - 1
          })),
          target: "#idpay-onboarding.DisplayingInitiativeInfo"
        }
      }
    },

    DisplayingSelfDeclarationList: {
      initial: "Evaluating",
      states: {
        Evaluating: {
          tags: [IdPayTags.Loading],
          always: [
            {
              guard: "hasBooleanSelfDeclarationList",
              target: "DisplayingBooleanSelfDeclarationList"
            },
            {
              guard: "hasMultiSelfDeclarationList",
              target: "DisplayingMultiSelfDeclarationList"
            },
            {
              guard: "hasInputFormDeclaration",
              target: "DisplayingInputForm"
            }
          ]
        },

        DisplayingBooleanSelfDeclarationList: {
          entry: "navigateToBoolSelfDeclarationListScreen",
          on: {
            back: [
              {
                actions: assign(({ context }) => ({
                  currentStep: context.currentStep - 1
                })),
                guard: "hasPdndCriteria",
                target: "#idpay-onboarding.DisplayingPdndCriteria"
              },
              {
                actions: assign(({ context }) => ({
                  currentStep: context.currentStep - 1
                })),
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
                target: "DisplayingMultiSelfDeclarationList",
                actions: assign(({ context }) => ({
                  currentStep: context.currentStep + 1
                }))
              },
              {
                guard: "hasInputFormDeclaration",
                target: "DisplayingInputForm"
              },
              {
                target: "#idpay-onboarding.AcceptingCriteria"
              }
            ]
          }
        },

        DisplayingMultiSelfDeclarationList: {
          initial: "DisplayingMultiSelfDeclarationItem",
          states: {
            DisplayingMultiSelfDeclarationItem: {
              entry: "navigateToMultiSelfDeclarationListScreen",
              on: {
                "select-multi-consent": {
                  actions: assign(({ context, event }) => ({
                    currentStep: context.currentStep + 1,
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
                      "#idpay-onboarding.DisplayingSelfDeclarationList.DisplayingBooleanSelfDeclarationList",
                    actions: assign(({ context }) => ({
                      selfDeclarationsMultiPage:
                        +context.selfDeclarationsMultiPage - 1,
                      currentStep: context.currentStep - 1
                    }))
                  },
                  {
                    guard: and(["isFirstMultiConsentPage", "hasPdndCriteria"]),
                    target: "#idpay-onboarding.DisplayingPdndCriteria",
                    actions: assign(({ context }) => ({
                      selfDeclarationsMultiPage:
                        +context.selfDeclarationsMultiPage - 1,
                      currentStep: context.currentStep - 1
                    }))
                  },
                  {
                    guard: "isFirstMultiConsentPage",
                    target: "#idpay-onboarding.DisplayingInitiativeInfo",
                    actions: assign(({ context }) => ({
                      selfDeclarationsMultiPage:
                        +context.selfDeclarationsMultiPage - 1,
                      currentStep: context.currentStep - 1
                    }))
                  }
                ]
              }
            },
            EvaluatingMultiSelfDeclarationList: {
              always: [
                {
                  guard: "hasInputFormDeclaration",
                  target:
                    "#idpay-onboarding.DisplayingSelfDeclarationList.DisplayingInputForm"
                },
                {
                  guard: "isLastMultiConsent",
                  target: "#idpay-onboarding.AcceptingCriteria"
                },
                {
                  actions: assign(({ context }) => ({
                    selfDeclarationsMultiPage:
                      +context.selfDeclarationsMultiPage + 1,
                    currentStep: context.currentStep + 1
                  })),
                  target: "DisplayingMultiSelfDeclarationItem"
                }
              ]
            }
          }
        },

        DisplayingInputForm: {
          initial: "DisplayingInputFormScreen",
          states: {
            DisplayingInputFormScreen: {
              entry: "navigateToInputFormScreen",
              on: {
                "input-text-criteria": {
                  actions: assign(({ context, event }) => ({
                    selfDeclarationsTextAnswers: {
                      ...context.selfDeclarationsTextAnswers,
                      [context.activeTextConsentPage]: event.criteria
                    },
                    currentStep: context.currentStep + 1
                  })),
                  target: "EvaluatingInputForm"
                },
                back: [
                  {
                    guard: and([
                      "isFirstMultiTextConsent",
                      "hasMultiSelfDeclarationList"
                    ]),
                    target:
                      "#idpay-onboarding.DisplayingSelfDeclarationList.DisplayingMultiSelfDeclarationList"
                  },
                  {
                    guard: and([
                      "isFirstMultiTextConsent",
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
                    guard: "isFirstMultiTextConsent",
                    target: "#idpay-onboarding.DisplayingInitiativeInfo"
                  },
                  {
                    actions: assign(({ context }) => ({
                      activeTextConsentPage: +context.activeTextConsentPage - 1,
                      currentStep: context.currentStep - 1
                    }))
                  }
                ]
              }
            },
            EvaluatingInputForm: {
              always: [
                {
                  guard: "isLastTextConsent",
                  target: "#idpay-onboarding.AcceptingCriteria"
                },
                {
                  actions: assign(({ context }) => ({
                    activeTextConsentPage: +context.activeTextConsentPage + 1
                  })),
                  target: "DisplayingInputFormScreen"
                }
              ]
            }
          }
        }
      }
    },

    AcceptingCriteria: {
      tags: [IdPayTags.Loading],
      invoke: {
        src: "acceptRequiredCriteria",
        input: ({ context }) => context,
        onDone: {
          target: "OnboardingCompleted"
        },
        onError: [
          {
            guard: "isSessionExpired",
            target: "SessionExpired"
          },
          {
            actions: assign(({ event }) => ({
              failure: pipe(OnboardingFailure.decode(event.error), O.fromEither)
            })),
            target: "OnboardingFailure"
          }
        ]
      }
    },

    EnableNotification: {
      entry: "navigateToEnableNotificationScreen",
      on: {
        "update-notification-status": {
          actions: assign(({ event }) => ({
            isPushNotificationsEnabled: event.isPushNotificationEnabled
          }))
        },
        back: {
          actions: "closeOnboarding",
          target: "Idle"
        },
        close: {
          actions: "closeOnboarding",
          target: "Idle"
        }
      }
    },

    OnboardingCompleted: {
      entry: "navigateToCompletionScreen",
      on: {
        "update-notification-status": {
          actions: assign(({ event }) => ({
            isPushNotificationsEnabled: event.isPushNotificationEnabled
          }))
        },
        close: [
          {
            target: "EnableNotification",
            guard: "shouldShowEnableNotificationOnClose"
          },
          {
            actions: "closeOnboarding"
          }
        ]
      }
    },

    TooManyRequests: {
      entry: "navigateToFailureToRetryScreen",
      on: {
        retry: {
          target: "LoadingInitiative",
          actions: assign(() => InitialContext)
        },
        back: {
          actions: "closeOnboarding",
          target: "Idle"
        }
      }
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
      entry: ["handleSessionExpired"],
      always: { target: "LoadingInitiative" }
    }
  }
});

const selectInitiativeId = (context: Context) =>
  pipe(
    context.initiative,
    O.map(initiative => initiative.initiativeId)
  );

export type IdPayOnboardingMachine = typeof idPayOnboardingMachine;
