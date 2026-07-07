import { testSaga } from "redux-saga-test-plan";
import { cgnEycaActivation } from "../../../../../store/actions/eyca/activation";
import { getActivation } from "../getEycaActivationSaga";
import { getEycaActivationStatusSaga } from "../getEycaActivationStatus";
import { getNetworkError } from "../../../../../../../../utils/errors";
import { CgnEycaActivationStatus } from "../../../../../store/reducers/eyca/activation";

describe("getEycaActivationStatus", () => {
  const getEycaActivation = jest.fn();

  it("should dispatch failure when getActivation throws", () => {
    const error = new Error("Network error");

    testSaga(getEycaActivationStatusSaga, getEycaActivation)
      .next()
      .call(getActivation, getEycaActivation)
      .throw(error)
      .put(cgnEycaActivation.failure(getNetworkError(error)))
      .next()
      .isDone();
  });

  it("should dispatch success when activationInfo is available", () => {
    testSaga(getEycaActivationStatusSaga, getEycaActivation)
      .next()
      .call(getActivation, getEycaActivation)
      .next("COMPLETED")
      .put(cgnEycaActivation.success("COMPLETED" as CgnEycaActivationStatus))
      .next()
      .isDone();
  });
});
