import { SagaIterator } from "redux-saga";
import { put, takeLatest } from "typed-redux-saga/macro";
import { itwLifecycleStoresReset } from "../../lifecycle/store/actions";
import { walletRemoveCardsByCategory } from "../../../wallet/store/actions/cards";
import { itwResetEnv, itwSetEnv } from "../store/actions/environment";

/**
 * Ensures the wallet is correctly reset when the environment changes.
 */
function* handleItwEnvironmentChanged(): SagaIterator {
  yield* put(itwLifecycleStoresReset());
  yield* put(walletRemoveCardsByCategory("itw"));
}

/**
 * Watch environment actions and triggers the IT Wallet reset.
 */
export function* watchItwEnvironment(): SagaIterator {
  yield* takeLatest(itwSetEnv, handleItwEnvironmentChanged);
  yield* takeLatest(itwResetEnv, handleItwEnvironmentChanged);
}
