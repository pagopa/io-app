import { CommonActions } from "@react-navigation/native";
import { SagaIterator } from "redux-saga";
import { call, take } from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";

import NavigationService from "../../../../../../navigation/NavigationService";
import ROUTES from "../../../../../../navigation/routes";
import { ITW_ROUTES } from "../../../../../itwallet/navigation/routes";
import { MESSAGES_ROUTES } from "../../../../../messages/navigation/routes";
import CGN_ROUTES from "../../../navigation/routes";
import {
  cgnActivationBack,
  cgnActivationCancel,
  cgnActivationComplete,
  cgnActivationFailure
} from "../../../store/actions/activation";
import {
  navigateToCgnActivationInformationTos,
  navigateToCgnDetails
} from "../navigation/actions";

function* cgnActivationWorker() {
  const currentRouteName: ReturnType<
    typeof NavigationService.getCurrentRouteName
  > = yield* call(NavigationService.getCurrentRouteName);

  if (currentRouteName !== CGN_ROUTES.ACTIVATION.INFORMATION_TOS) {
    yield* call(navigateToCgnActivationInformationTos);
  }

  const result = yield* take<
    ActionType<
      | typeof cgnActivationBack
      | typeof cgnActivationCancel
      | typeof cgnActivationComplete
      | typeof cgnActivationFailure
    >
  >([
    cgnActivationComplete,
    cgnActivationCancel,
    cgnActivationBack,
    cgnActivationFailure
  ]);

  if (isActionOf(cgnActivationBack, result)) {
    return "back";
  }
  if (isActionOf(cgnActivationCancel, result)) {
    return "cancel";
  }
  if (isActionOf(cgnActivationComplete, result)) {
    return "completed";
  }
  return "failure";
}

const INITIAL_SCREENS_TO_WALLET_HOME: ReadonlyArray<string> = [
  ITW_ROUTES.ONBOARDING,
  ITW_ROUTES.L3_ONBOARDING,
  CGN_ROUTES.DETAILS.DETAILS
];

/** This saga handles the CGN activation workflow */
export function* handleCgnStartActivationSaga(): SagaIterator {
  const initialScreen: ReturnType<typeof NavigationService.getCurrentRoute> =
    yield* call(NavigationService.getCurrentRoute);

  const navigator = yield* call(NavigationService.getNavigator);
  const rootStateBeforeActivation = navigator.current?.getRootState();

  const result = yield* call(cgnActivationWorker);

  // restore the navigation stack as it was before starting the workflow
  if (rootStateBeforeActivation !== undefined) {
    yield* resetNavigationTo(rootStateBeforeActivation);
  }

  if (initialScreen?.name === CGN_ROUTES.ACTIVATION.CTA_START_CGN) {
    yield* call(NavigationService.navigate, ROUTES.MAIN, {
      screen: MESSAGES_ROUTES.MESSAGES_HOME
    });
  }
  if (result === "completed") {
    if (
      initialScreen?.name &&
      INITIAL_SCREENS_TO_WALLET_HOME.includes(initialScreen.name)
    ) {
      yield* resetNavigationTo({
        index: 0,
        routes: [
          {
            name: ROUTES.MAIN,
            params: {
              screen: ROUTES.WALLET_HOME,
              params: { newMethodAdded: true }
            }
          },
          {
            name: CGN_ROUTES.DETAILS.MAIN,
            params: {
              screen: CGN_ROUTES.DETAILS.DETAILS
            }
          }
        ]
      });
    } else {
      yield* call(navigateToCgnDetails);
    }
  }
}

function* resetNavigationTo(state: Parameters<typeof CommonActions.reset>[0]) {
  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.reset(state)
  );
}
