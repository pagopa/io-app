import { put, select, takeEvery } from "typed-redux-saga/macro";

import { isTestEnv } from "../../../utils/environment";
import { trackTourGuideAction } from "../analytics";
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

export function* watchTourSaga() {
  yield* takeEvery(startTourAction, handleStartTour);
  yield* takeEvery(nextTourStepAction, handleNextStep);
}

function* handleNextStep() {
  const groupId = yield* select(activeGroupIdSelector);
  const stepIndex = yield* select(activeStepIndexSelector);
  const items = yield* select(tourItemsForActiveGroupSelector);

  if (groupId && stepIndex >= items.length) {
    yield* put(completeTourAction({ groupId }));
  }
}

function* handleStartTour(action: ReturnType<typeof startTourAction>) {
  yield trackTourGuideAction(action.payload.groupId, "shown");
}

export const testable = isTestEnv
  ? { handleStartTour, handleNextStep }
  : undefined;
