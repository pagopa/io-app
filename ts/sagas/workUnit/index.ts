import { NavigationActions, NavigationNavigateAction } from "react-navigation";
import { call, Effect, put, select, take } from "redux-saga/effects";
import {
  ActionCreator,
  ActionType,
  getType,
  isActionOf,
  TypeConstant
} from "typesafe-actions";
import { navigationHistoryPop } from "../../store/actions/navigationHistory";
import { navigationHistorySizeSelector } from "../../store/middlewares/navigationHistory";
import { navigationCurrentRouteSelector } from "../../store/reducers/navigation";

/**
 * The data model needed to run the workunit
 */
export type WorkUnit = {
  // The navigation action that will be used if the current screen isn't the `startScreenName`
  startScreenNavigation: NavigationNavigateAction;
  // The expected first screen of the workflow
  startScreenName: string;
  // The action that will be taken when the workflow is completed
  complete: ActionCreator<TypeConstant>;
  // The action that will be taken when the workflow has been canceled
  cancel: ActionCreator<TypeConstant>;
  // The action that will be taken when `back` is pressed from the `startScreenName`
  back: ActionCreator<TypeConstant>;
};

/**
 * The result of the WorkUnit
 */
export enum ESagaResult {
  Cancel = "Cancel",
  Completed = "Completed",
  Back = "Back"
}

/**
 * Ensure that the `startScreen` is the current screen or navigate to `startScreen` using `navigateTo`
 * @param navigateTo
 * @param startScreen
 */
function* ensureScreen(
  navigateTo: NavigationNavigateAction,
  startScreen: string
) {
  const currentRoute: ReturnType<typeof navigationCurrentRouteSelector> = yield select(
    navigationCurrentRouteSelector
  );

  if (currentRoute.isSome() && currentRoute.value !== startScreen) {
    yield put(navigateTo);
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
  const currentNavigationStackSize: ReturnType<typeof navigationHistorySizeSelector> = yield select(
    navigationHistorySizeSelector
  );
  const res: T = yield call(g);
  const newNavigationStackSize: ReturnType<typeof navigationHistorySizeSelector> = yield select(
    navigationHistorySizeSelector
  );
  const deltaNavigation = newNavigationStackSize - currentNavigationStackSize;
  if (deltaNavigation > 1) {
    yield put(navigationHistoryPop(deltaNavigation - 1));
  }
  yield put(NavigationActions.back());
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
  ESagaResult,
  ActionType<typeof wu.cancel | typeof wu.complete | typeof wu.back>
> {
  yield call(ensureScreen, wu.startScreenNavigation, wu.startScreenName);

  const result = yield take([
    getType(wu.complete),
    getType(wu.cancel),
    getType(wu.back)
  ]);

  if (isActionOf(wu.complete, result)) {
    return ESagaResult.Completed;
  } else if (isActionOf(wu.cancel, result)) {
    return ESagaResult.Cancel;
  } else if (isActionOf(wu.back, result)) {
    return ESagaResult.Back;
  }
  throw new Error(`Unhandled case for ${result}`);
}
