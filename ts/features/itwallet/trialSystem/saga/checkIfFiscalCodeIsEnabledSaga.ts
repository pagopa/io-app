import { SagaIterator } from "redux-saga";
import { call, put, select } from "typed-redux-saga/macro";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { assert } from "../../../../utils/assert.ts";
import { itwSetL3Enabled } from "../../common/store/actions/preferences.ts";
import {getIsFiscalCodeEnabled} from "../utils/itwTrialSystemUtils.ts";

/**
 * Saga responsible to check whether the fiscal code is enabled or not, for the L3 features.
 */
export function* checkIsFiscalCodeEnabledSaga(): SagaIterator {
  const sessionToken = yield* select(sessionTokenSelector);
  assert(sessionToken, "Missing session token");
  const isCFEnabled = yield* call(getIsFiscalCodeEnabled, sessionToken);
  yield* put(itwSetL3Enabled(isCFEnabled));
}
