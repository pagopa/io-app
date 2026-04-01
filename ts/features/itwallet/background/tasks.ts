import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { runSaga } from "redux-saga";
import { store } from "../../../boot/configureStoreAndPersistor";
import { trackItwBackgroundFetchWakeUp } from "../analytics";
import { checkWalletInstanceAndCredentialsValiditySaga } from "../common/saga";
import { itwNeedWalletInstanceStatusCheck } from "../walletInstance/store/selectors";
import { ITW_WALLET_CHECK_TASK } from "./constants";

export { ITW_WALLET_CHECK_TASK };

/**
 * Handler for the ITW background task.
 *
 * Checks whether the Wallet Instance status needs to be refreshed (i.e. last
 * check was more than 24 hours ago) and, if so, runs the full validity check
 * saga against the redux store.
 *
 * Exported for unit testing purposes.
 */
export async function itwWalletCheckTaskHandler(): Promise<BackgroundTask.BackgroundTaskResult> {
  try {
    trackItwBackgroundFetchWakeUp();
    const needCheck = itwNeedWalletInstanceStatusCheck(store.getState());
    if (needCheck) {
      await runSaga(
        store,
        checkWalletInstanceAndCredentialsValiditySaga
      ).toPromise();
    }
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
}

// IMPORTANT: must be called in global scope, outside any React component.
// All task definitions must be registered before the app renders.
TaskManager.defineTask(ITW_WALLET_CHECK_TASK, itwWalletCheckTaskHandler);
