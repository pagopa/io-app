import { CommonActions } from "@react-navigation/native";
import { call, take } from "typed-redux-saga/macro";
import {
  ActionCreator,
  ActionType,
  isActionOf,
  TypeConstant
} from "typesafe-actions";
import NavigationService from "../../navigation/NavigationService";
import { navigateToWorkunitGenericFailureScreen } from "../../store/actions/navigation";
import { ReduxSagaEffect } from "../../types/utils";

/**
 * The data model needed to run the workunit
 * @deprecated
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
 * @deprecated
 */
export type SagaResult = "cancel" | "completed" | "back" | "failure";

/**
 * @deprecated
 */
export type WorkUnitHandler<T = unknown> = (
  g: (...args: Array<any>) => Generator<ReduxSagaEffect, SagaResult>
) => Generator<ReduxSagaEffect, SagaResult, T>;

/**
 * Ensure that the `startScreen` is the current screen or navigate to `startScreen` using `navigateTo`
 * @param navigateTo
 * @param startScreen
 * @deprecated
 */
function* ensureScreen(navigateTo: () => void, startScreen: string) {
  const currentRoute: ReturnType<typeof NavigationService.getCurrentRouteName> =
    yield* call(NavigationService.getCurrentRouteName);

  if (currentRoute !== undefined && currentRoute !== startScreen) {
    yield* call(navigateTo);
  }
}

/**
 * Ensure that after the execution of the saga `g`,
 * the navigation stack return to the screen from which the saga was invoked
 * @param g
 * @deprecated
 */
export function* withResetNavigationStack<T>(
  g: (...args: Array<any>) => Generator<ReduxSagaEffect, T>
): Generator<ReduxSagaEffect, T, any> {
  const navigator = yield* call(NavigationService.getNavigator);
  const initialState = navigator.current?.getRootState();

  const res: T = yield* call(g);
  if (initialState !== undefined) {
    yield* call(
      NavigationService.dispatchNavigationAction,
      CommonActions.reset(initialState)
    );
  }
  return res;
}

/**
 * TODO: Generic handling for the failure of a workunit, navigate to GenericFailureScren
 * @param g
 * @deprecated
 */
export function* withFailureHandling<T>(
  g: (...args: Array<any>) => Generator<ReduxSagaEffect, SagaResult, T>
) {
  const res = yield* call(g);
  if (res === "failure") {
    yield* call(navigateToWorkunitGenericFailureScreen);
  }
  return res;
}

/**
 * Execute the work unit, and wait for an action to complete
 * @param wu
 * @deprecated
 */
export function* executeWorkUnit(
  wu: WorkUnit
): Generator<
  ReduxSagaEffect,
  SagaResult,
  ActionType<
    typeof wu.cancel | typeof wu.complete | typeof wu.back | typeof wu.failure
  >
> {
  yield* call(ensureScreen, wu.startScreenNavigation, wu.startScreenName);

  const result = yield* take<
    ActionType<
      typeof wu.cancel | typeof wu.complete | typeof wu.back | typeof wu.failure
    >
  >([wu.complete, wu.cancel, wu.back, wu.failure]);

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
