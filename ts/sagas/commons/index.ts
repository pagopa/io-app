import { put } from "typed-redux-saga/macro";
import { startApplicationInitialization } from "../../store/actions/application";
import { clearCache } from "../../features/settings/common/store/actions";
import { resetAssistanceData } from "../../utils/supportAssistance";

export function* restartCleanApplication() {
  // clean up any assistance data
  resetAssistanceData();
  yield* put(clearCache());
  // start again the application
  yield* put(startApplicationInitialization());
}
