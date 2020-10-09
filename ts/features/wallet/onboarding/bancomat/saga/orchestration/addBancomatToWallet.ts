import { call, put } from "redux-saga/effects";
import {
  ESagaResult,
  executeWorkUnit,
  withResetNavigationStack
} from "../../../../../../sagas/workUnit";
import { navigateToWalletHome } from "../../../../../../store/actions/navigation";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { navigateToWalletPoc1 } from "../../navigation/action";
import WALLET_ADD_BANCOMAT_ROUTES from "../../navigation/routes";
import {
  walletAddBancomatBack,
  walletAddBancomatCancel,
  walletAddBancomatCompleted
} from "../../store/actions";

/**
 * Define the workflow that allows the user to add a bancomat to the wallet.
 * The workflow ends when:
 * - The user add at least one owned bancomat to the wallet {@link walletAddBancomatCompleted}
 * - The user abort the insertion of a bancomat {@link walletAddBancomatCancel}
 * - The user choose back from the first screen {@link walletAddBancomatBack}
 */
function* bancomatWorkUnit() {
  return yield call(executeWorkUnit, {
    startScreenNavigation: navigateToWalletPoc1(),
    startScreenName: WALLET_ADD_BANCOMAT_ROUTES.POC1,
    complete: walletAddBancomatCompleted,
    back: walletAddBancomatBack,
    cancel: walletAddBancomatCancel
  });
}

/**
 * A saga that invokes the addition of a bancomat workflow {@link bancomatWorkUnit} and return
 * to the wallet after the insertion.
 */
export function* addBancomatToWalletGeneric() {
  const res: SagaCallReturnType<typeof executeWorkUnit> = yield call(
    withResetNavigationStack,
    bancomatWorkUnit
  );
  if (res !== ESagaResult.Back) {
    yield put(navigateToWalletHome());
  }
}
