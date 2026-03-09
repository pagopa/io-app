import { CommonActions } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { call, put, race, take } from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";
import NavigationService from "../../../../../../navigation/NavigationService";
import {
  navigateToCgnActivationCompleted,
  navigateToCgnActivationIneligible,
  navigateToCgnActivationLoading,
  navigateToCgnActivationPending,
  navigateToCgnActivationTimeout,
  navigateToCgnAlreadyActive
} from "../navigation/actions";
import CGN_ROUTES from "../../../navigation/routes";
import {
  cgnActivationCancel,
  cgnActivationStatus
} from "../../../store/actions/activation";
import { CgnActivationProgressEnum } from "../../../store/reducers/activation";
import { cgnActivationSaga } from "../../networking/activation/getBonusActivationSaga";

const mapEnumToNavigation = new Map<CgnActivationProgressEnum, () => void>([
  [CgnActivationProgressEnum.SUCCESS, navigateToCgnActivationCompleted],
  [CgnActivationProgressEnum.PENDING, navigateToCgnActivationPending],
  [CgnActivationProgressEnum.TIMEOUT, navigateToCgnActivationTimeout],
  [CgnActivationProgressEnum.INELIGIBLE, navigateToCgnActivationIneligible],
  [CgnActivationProgressEnum.EXISTS, navigateToCgnAlreadyActive]
]);

type CgnActivationType = ReturnType<typeof cgnActivationSaga>;

// Get the next activation steps from the saga call function based on status ENUM
const getNextNavigationStep = (
  action: ActionType<typeof cgnActivationStatus>
): (() => void) =>
  isActionOf(cgnActivationStatus.success, action)
    ? pipe(
        mapEnumToNavigation.get(action.payload.status),
        O.fromNullable,
        O.getOrElse(() => navigateToCgnActivationLoading)
      )
    : navigateToCgnActivationLoading;

const isLoadingScreen = (screenName: string) =>
  screenName === CGN_ROUTES.ACTIVATION.LOADING;

export function* cgnActivationWorker(cgnActivationSaga: CgnActivationType) {
  const currentRoute: ReturnType<typeof NavigationService.getCurrentRouteName> =
    yield* call(NavigationService.getCurrentRouteName);
  if (currentRoute !== undefined && !isLoadingScreen(currentRoute)) {
    // show the loading page for the CGN activation
    yield* call(navigateToCgnActivationLoading);
  }

  const progress = yield* call(cgnActivationSaga);
  yield* put(progress);

  const nextNavigationStep = getNextNavigationStep(progress);
  if (nextNavigationStep !== navigateToCgnActivationLoading) {
    yield* call(nextNavigationStep);
  }
}

/**
 * This saga handles the CGN activation polling
 */
export function* handleCgnActivationSaga(cgnActivationSaga: CgnActivationType) {
  const { cancelAction } = yield* race({
    activation: call(cgnActivationWorker, cgnActivationSaga),
    cancelAction: take(cgnActivationCancel)
  });
  if (cancelAction) {
    yield* call(
      NavigationService.dispatchNavigationAction,
      CommonActions.goBack()
    );
  }
}
