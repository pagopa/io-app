import { NavigationActions, NavigationNavigateAction } from "react-navigation";
import { select, call, put, Effect } from "redux-saga/effects";
import {
  navigateToPaymentScanQrCode,
  navigateToWalletHome
} from "../../../../../../store/actions/navigation";
import { navigationHistoryPop } from "../../../../../../store/actions/navigationHistory";
import { navigationHistorySizeSelector } from "../../../../../../store/middlewares/navigationHistory";
import { navigationCurrentRouteSelector } from "../../../../../../store/reducers/navigation";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { navigateToBpdIbanInsertion } from "../../../../../bonus/bpd/navigation/action/iban";
import BPD_ROUTES from "../../../../../bonus/bpd/navigation/routes";

export enum ESagaResult {
  Cancel = "Cancel",
  Completed = "Completed",
  Back = "Back"
}

export function* addBancomatToWallet() {
  const res: SagaCallReturnType<typeof baseAddBancomatToWallet> = yield call(
    withResetNavigationStack,
    baseAddBancomatToWallet
  );
  yield put(navigateToWalletHome());
  console.log("asdasd");
}

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

function* ensureMainScreen(
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

function* baseAddBancomatToWallet(): Generator<Effect, ESagaResult> {
  yield call(ensureMainScreen, navigateToBpdIbanInsertion(), "asd");
}
