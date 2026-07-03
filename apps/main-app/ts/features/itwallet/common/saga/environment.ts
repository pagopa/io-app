import { SagaIterator } from "redux-saga";
import { put, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { itwLifecycleStoresReset } from "../../lifecycle/store/actions";
import { walletRemoveCardsByCategory } from "../../../wallet/store/actions/cards";
import { itwResetEnv, itwSetEnv } from "../store/actions/environment";
import { itwDebugReset } from "../../playgrounds/store/actions";

/**
 * Ensures the wallet is correctly reset when the environment changes.
 */
function* handleItwEnvironmentChanged(
  action: ActionType<typeof itwSetEnv> | ActionType<typeof itwResetEnv>
): SagaIterator {
  yield* put(itwLifecycleStoresReset());
  yield* put(walletRemoveCardsByCategory("itw"));

  // Actions that follow this condition are dispatched only when switching to PROD.
  if (action.type === getType(itwSetEnv) && action.payload === "pre") {
    return;
  }

  // Clear any persisted debug overrides when leaving PRE.
  yield* put(itwDebugReset());
}

/**
 * Watch environment actions and triggers the IT Wallet reset.
 */
export function* watchItwEnvironment(): SagaIterator {
  yield* takeLatest(itwSetEnv, handleItwEnvironmentChanged);
  yield* takeLatest(itwResetEnv, handleItwEnvironmentChanged);
}
