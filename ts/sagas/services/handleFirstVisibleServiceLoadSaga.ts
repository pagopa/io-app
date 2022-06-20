import * as pot from "@pagopa/ts-commons/lib/pot";
import { SagaIterator } from "redux-saga";
import { put, select } from "typed-redux-saga/macro";
import { firstServiceLoadSuccess } from "../../store/actions/services";
import { visibleServicesDetailLoadStateSelector } from "../../store/reducers/entities/services";
import { isFirstVisibleServiceLoadCompletedSelector } from "../../store/reducers/entities/services/firstServicesLoading";

/**
 *  A function to check if all services detail and scopes are loaded with success.
 *  If it is true, by dispatching firstServiceLoadSuccess the app stop considering loaded services as read
 */
export function* handleFirstVisibleServiceLoadSaga(): SagaIterator {
  const isFirstVisibleServiceLoadCompleted: ReturnType<
    typeof isFirstVisibleServiceLoadCompletedSelector
  > = yield* select(isFirstVisibleServiceLoadCompletedSelector);
  if (!isFirstVisibleServiceLoadCompleted) {
    const visibleServicesDetailsLoadState: ReturnType<
      typeof visibleServicesDetailLoadStateSelector
    > = yield* select(visibleServicesDetailLoadStateSelector);
    if (pot.isSome(visibleServicesDetailsLoadState)) {
      yield* put(firstServiceLoadSuccess());
    }
  }
}
