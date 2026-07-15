import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";

import {
  getGenericError,
  getNetworkError
} from "../../../../../../../../utils/errors";
import { cgnEycaActivation } from "../../../../../store/actions/eyca/activation";
import { CgnEycaActivationStatus } from "../../../../../store/reducers/eyca/activation";
import { getActivation } from "../getEycaActivationSaga";
import { getEycaActivationStatusSaga } from "../getEycaActivationStatus";

describe("getEycaActivationStatus", () => {
  const getEycaActivation = jest.fn();

  it("should dispatch failure when activationInfo is Left", () => {
    testSaga(getEycaActivationStatusSaga, getEycaActivation)
      .next()
      .call(getActivation, getEycaActivation)
      .next(E.left(getGenericError(new Error("Network error"))))
      .put(
        cgnEycaActivation.failure(getNetworkError(new Error("Network error")))
      )
      .next()
      .isDone();
  });

  it("should dispatch success when activationInfo is Right", () => {
    testSaga(getEycaActivationStatusSaga, getEycaActivation)
      .next()
      .call(getActivation, getEycaActivation)
      .next(E.right("COMPLETED"))
      .put(cgnEycaActivation.success("COMPLETED" as CgnEycaActivationStatus))
      .next()
      .isDone();
  });
});
