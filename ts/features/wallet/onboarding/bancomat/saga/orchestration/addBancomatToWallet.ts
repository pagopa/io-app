import { NavigationNavigateAction } from "react-navigation";
import { call, Effect, put, select, take } from "redux-saga/effects";
import { ActionType, getType, isActionOf } from "typesafe-actions";
import {
  ESagaResult,
  executeWorkUnit,
  withResetNavigationStack
} from "../../../../../../sagas/workUnit";
import { navigateToWalletHome } from "../../../../../../store/actions/navigation";
import { navigationCurrentRouteSelector } from "../../../../../../store/reducers/navigation";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { navigateToWalletPoc1 } from "../../navigation/action";
import WALLET_ADD_BANCOMAT_ROUTES from "../../navigation/routes";
import {
  walletAddBancomatBack,
  walletAddBancomatCancel,
  walletAddBancomatCompleted
} from "../../store/actions";

export function* addBancomatToWallet() {
  const res: SagaCallReturnType<typeof baseAddBancomatToWallet> = yield call(
    withResetNavigationStack,
    myBancomat
  );
  console.log("RESSSS ->" + res);
  yield put(navigateToWalletHome());
}

function* myBancomat() {
  return yield call(executeWorkUnit, {
    startScreenNavigation: navigateToWalletPoc1(),
    startScreenName: WALLET_ADD_BANCOMAT_ROUTES.POC1,
    complete: walletAddBancomatCompleted,
    back: walletAddBancomatBack,
    cancel: walletAddBancomatCancel
  });
}

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

function* baseAddBancomatToWallet(): Generator<
  Effect,
  ESagaResult,
  ActionType<typeof walletAddBancomatCancel | typeof walletAddBancomatCompleted>
> {
  yield call(
    ensureScreen,
    navigateToWalletPoc1(),
    WALLET_ADD_BANCOMAT_ROUTES.POC1
  );

  const result: ActionType<
    typeof walletAddBancomatCancel | typeof walletAddBancomatCompleted
  > = yield take([
    getType(walletAddBancomatCancel),
    getType(walletAddBancomatCompleted)
  ]);
  if (isActionOf(walletAddBancomatCompleted, result)) {
    return ESagaResult.Completed;
  }
  return ESagaResult.Cancel;
}
