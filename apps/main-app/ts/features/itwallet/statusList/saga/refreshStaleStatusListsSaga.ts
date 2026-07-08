import { call, select } from "typed-redux-saga/macro";
import { selectItwSpecsVersion } from "../../common/store/selectors/environment";
import { refreshStaleEntries } from "../utils/refresh";
import { StatusListRepository } from "../utils/repository";
import { storeLastStatusListCheckTimestamp } from "../utils/storage";

/**
 * Runs startup coherence for the Status List Token cache pruning stored entries
 * no longer referenced by any owner
 */
export function* refreshStaleStatusListsSaga() {
  const now = Date.now();

  const itwVersion = yield* select(selectItwSpecsVersion);
  const cached = yield* call(StatusListRepository.list);

  yield* call(refreshStaleEntries, cached, { itwVersion }, now);
  yield* call(storeLastStatusListCheckTimestamp, now);
}
