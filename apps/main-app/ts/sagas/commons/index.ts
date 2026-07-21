import { put } from "typed-redux-saga/macro";

import { clearCache } from "../../features/settings/common/store/actions";
import { setMainNavigatorReady } from "../../navigation/NavigationService";
import { startApplicationInitialization } from "../../store/actions/application";
import { resetAssistanceData } from "../../utils/supportAssistance";

export function* resetAssistanceDataAndClearCache() {
  resetAssistanceData();
  yield* put(clearCache());
}

export function* restartCleanApplication() {
  // clean up any assistance data
  resetAssistanceDataAndClearCache();
  // start again the application
  yield* put(startApplicationInitialization());
  setMainNavigatorReady(false);
}
