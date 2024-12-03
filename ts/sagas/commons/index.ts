import { put } from "typed-redux-saga/macro";
import { startApplicationInitialization } from "../../store/actions/application";
import { clearCache } from "../../store/actions/profile";
import { resetAssistanceData } from "../../utils/supportAssistance";
import { mixpanelTrack } from "../../mixpanel";

export function* restartCleanApplication() {
  mixpanelTrack("SESSION_EXPIRED_RESTART_CLEAN_APPLICATION");
  // clean up any assistance data
  resetAssistanceData();
  yield* put(clearCache());
  // start again the application
  yield* put(startApplicationInitialization());
}
