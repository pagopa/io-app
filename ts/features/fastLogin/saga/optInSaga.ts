import { select, take } from "typed-redux-saga/macro";
import { setFastLoginOptIn } from "../store/actions/optInActions";
import {
  isFastLoginFFEnabled,
  isFastLoginOptInEnabledSelector
} from "../store/selectors";

export function* checkFastLoginOptInSaga() {
  const fastloginFFEnabled = yield* select(isFastLoginFFEnabled);

  if (!fastloginFFEnabled) {
    return;
  }

  const fastLoginOptInPreferenceSet = yield* select(
    isFastLoginOptInEnabledSelector
  );

  if (fastLoginOptInPreferenceSet !== undefined) {
    return;
  }

  // TODO: Jira Ticket IOPID-895. Navigate to opt-in screen

  yield* take(setFastLoginOptIn);
}
