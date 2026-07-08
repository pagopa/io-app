import { call, select } from "typed-redux-saga/macro";

import { selectItwSpecsVersion } from "../../common/store/selectors/environment";
import { refreshStaleEntries } from "../utils/refresh";

/**
 * Refreshes stale cached status list entries and stores the check timestamp.
 */
export function* refreshStaleStatusListsSaga() {
  const itwVersion = yield* select(selectItwSpecsVersion);
  yield* call(refreshStaleEntries, { itwVersion });
}
