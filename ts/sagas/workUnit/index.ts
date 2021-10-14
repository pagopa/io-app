import { NavigationActions } from "react-navigation";
import { call, Effect, take } from "redux-saga/effects";
import {
  ActionCreator,
  ActionType,
  getType,
  isActionOf,
  TypeConstant
} from "typesafe-actions";
import NavigationService from "../../navigation/NavigationService";
import { navigateToWorkunitGenericFailureScreen } from "../../store/actions/navigation";
import { SagaCallReturnType } from "../../types/utils";

/**
 * The data model needed to run the workunit
 */
export type WorkUnit = {
  // The navigation action that will be used if the current screen isn't the `startScreenName`
  startScreenNavigation: () => void;
  // The expected first screen of the workflow
  startScreenName: string;
  // The action that will be taken when the workflow is completed
  complete: ActionCreator<TypeConstant>;
  // The action that will be taken when the workflow has been canceled
  cancel: ActionCreator<TypeConstant>;
  // The action that will be taken when `back` is pressed from the `startScreenName`
  back: ActionCreator<TypeConstant>;
  // The action that will be taken when the workflow fails for unexpected reasons
  failure: ActionCreator<TypeConstant>;
};

/**
 * The result of the WorkUnit
 */
export type SagaResult = "cancel" | "completed" | "back" | "failure";

/**
 * Ensure that the `startScreen` is the current screen or navigate to `startScreen` using `navigateTo`
 * @param navigateTo
 * @param startScreen
 */
function* ensureScreen(navigateTo: () => void, startScreen: string) {
  const currentRoute: ReturnType<typeof NavigationService.getCurrentRouteName> =
    yield call(NavigationService.getCurrentRouteName);

  if (currentRoute !== undefined && currentRoute !== startScreen) {
    yield call(navigateTo);
  }
}

/**
 * Ensure that after the execution of the saga `g`,
 * the navigation stack return to the screen from which the saga was invoked
 * @param g
 */
export function* withResetNavigationStack<T>(
  g: (...args: Array<any>) => Generator<Effect, T>
): Generator<Effect, T, any> {
  const initialScreen: ReturnType<typeof NavigationService.getCurrentRoute> =
    yield call(NavigationService.getCurrentRoute);
  const res: T = yield call(g);
  if (initialScreen?.routeName !== undefined) {
    yield call(
      NavigationService.dispatchNavigationAction,
      NavigationActions.navigate({
        routeName: initialScreen.routeName,
        // TODO: are the params needed?
        params: initialScreen?.params
      })
    );
  }
  return res;
}

/**
 * TODO: Generic handling for the failure of a workunit, navigate to GenericFailureScren
 * @param g
 */
export function* withFailureHandling<T>(
  g: (...args: Array<any>) => Generator<Effect, T, SagaResult>
) {
  const res: SagaCallReturnType<typeof executeWorkUnit> = yield call(g);
  if (res === "failure") {
    yield call(navigateToWorkunitGenericFailureScreen);
  }
  return res;
}

/**
 * Execute the work unit, and wait for an action to complete
 * @param wu
 */
export function* executeWorkUnit(
  wu: WorkUnit
): Generator<
  Effect,
  SagaResult,
  ActionType<
    typeof wu.cancel | typeof wu.complete | typeof wu.back | typeof wu.failure
  >
> {
  yield call(ensureScreen, wu.startScreenNavigation, wu.startScreenName);

  const result = yield take([
    getType(wu.complete),
    getType(wu.cancel),
    getType(wu.back),
    getType(wu.failure)
  ]);

  if (isActionOf(wu.complete, result)) {
    return "completed";
  } else if (isActionOf(wu.cancel, result)) {
    return "cancel";
  } else if (isActionOf(wu.back, result)) {
    return "back";
  } else if (isActionOf(wu.failure, result)) {
    return "failure";
  }
  throw new Error(`Unhandled case for ${result}`);
}
