import { put, select, takeEvery } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import {
  completeTourAction,
  nextTourStepAction,
  startTourAction
} from "../store/actions";
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

function* handleStartTour(action: ReturnType<typeof startTourAction>) {
  const completed: ReadonlyArray<string> = yield* select(
    state => state.features.tour.completed
  );
  if (completed.includes(action.payload.groupId)) {
    // Already completed, the reducer already no-ops but this
    // prevents any downstream effects
    return;
  }
}

export function* watchTourSaga() {
  yield* takeEvery(getType(nextTourStepAction), handleNextStep);
  yield* takeEvery(getType(startTourAction), handleStartTour);
}
