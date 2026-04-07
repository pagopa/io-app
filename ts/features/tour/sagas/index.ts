import { put, select, takeEvery } from "typed-redux-saga/macro";
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
import { trackTourGuideAction } from "../analytics";

function* handleStartTour(action: ReturnType<typeof startTourAction>) {
  yield trackTourGuideAction(action.payload.groupId, "shown");
}

function* handleNextStep() {
  const groupId = yield* select(activeGroupIdSelector);
  const stepIndex = yield* select(activeStepIndexSelector);
  const items = yield* select(tourItemsForActiveGroupSelector);

  if (groupId && stepIndex >= items.length) {
    yield* put(completeTourAction({ groupId }));
  }
}

export function* watchTourSaga() {
  yield* takeEvery(startTourAction, handleStartTour);
  yield* takeEvery(nextTourStepAction, handleNextStep);
}
