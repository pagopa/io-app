import { CommonActions } from "@react-navigation/native";
import { SagaIterator } from "redux-saga";
import { call } from "typed-redux-saga/macro";
import NavigationService from "../../../../../../navigation/NavigationService";
import ROUTES from "../../../../../../navigation/routes";
import {
  executeWorkUnit,
  withResetNavigationStack
} from "../../../../../../sagas/workUnit";
import { SagaCallReturnType } from "../../../../../../types/utils";
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

function* cgnActivationWorkUnit() {
  return yield* call(executeWorkUnit, {
    startScreenNavigation: navigateToCgnActivationInformationTos,
    startScreenName: CGN_ROUTES.ACTIVATION.INFORMATION_TOS,
    complete: cgnActivationComplete,
    back: cgnActivationBack,
    cancel: cgnActivationCancel,
    failure: cgnActivationFailure
  });
}

const INITIAL_SCREENS_TO_WALLET_HOME: ReadonlyArray<string> = [
  ITW_ROUTES.ONBOARDING,
  CGN_ROUTES.DETAILS.DETAILS
];

/**
 * This saga handles the CGN activation workflow
 */
export function* handleCgnStartActivationSaga(): SagaIterator {
  const initialScreen: ReturnType<typeof NavigationService.getCurrentRoute> =
    yield* call(NavigationService.getCurrentRoute);

  const sagaExecution = () => withResetNavigationStack(cgnActivationWorkUnit);
  const result: SagaCallReturnType<typeof executeWorkUnit> = yield* call(
    sagaExecution
  );

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
      yield* call(
        NavigationService.dispatchNavigationAction,
        CommonActions.reset({
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
        })
      );
    } else {
      yield* call(navigateToCgnDetails);
    }
  }
}
