import { SagaIterator } from "redux-saga";
import { put, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { itwLifecycleStoresReset } from "../../lifecycle/store/actions";
import { walletRemoveCardsByCategory } from "../../../wallet/store/actions/cards";
import {
  itwResetEnv,
  itwSetEnv,
  itwSetSpecsVersion
} from "../store/actions/environment";

/**
 * Ensures the wallet is correctly reset when the environment changes.
 */
function* handleItwEnvironmentChanged(
  action: ActionType<typeof itwSetEnv> | ActionType<typeof itwResetEnv>
): SagaIterator {
  yield* put(itwLifecycleStoresReset());
  yield* put(walletRemoveCardsByCategory("itw"));

  // Keep the selected IT-Wallet version only if the env is still pre.
  if (action.type === getType(itwSetEnv) && action.payload === "pre") {
    return;
  }

  // Restore IT-Wallet to v1.0.0 when the env changes back to prod.
  yield* put(itwSetSpecsVersion("1.0.0"));
}

/**
 * Watch environment actions and triggers the IT Wallet reset.
 */
export function* watchItwEnvironment(): SagaIterator {
  yield* takeLatest(itwSetEnv, handleItwEnvironmentChanged);
  yield* takeLatest(itwResetEnv, handleItwEnvironmentChanged);
}
