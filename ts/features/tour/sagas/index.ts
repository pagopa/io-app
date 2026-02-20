import { put, select, takeEvery } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { completeTourAction, nextTourStepAction } from "../store/actions";
import {
  activeGroupIdSelector,
  activeStepIndexSelector,
  tourItemsForActiveGroupSelector
} from "../store/selectors";

function* handleNextStep() {
  const groupId = yield* select(activeGroupIdSelector);
  const stepIndex = yield* select(activeStepIndexSelector);
  const items = yield* select(tourItemsForActiveGroupSelector);

  if (groupId && stepIndex >= items.length) {
    yield* put(completeTourAction({ groupId }));
  }
}

export function* watchTourSaga() {
  yield* takeEvery(getType(nextTourStepAction), handleNextStep);
}
