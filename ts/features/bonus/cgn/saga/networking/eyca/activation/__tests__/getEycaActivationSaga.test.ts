import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getGenericError } from "../../../../../../../../utils/errors";
import { startTimer } from "../../../../../../../../utils/timer";
import { cgnEycaActivation } from "../../../../../store/actions/eyca/activation";
import {
  getActivation,
  handleEycaActivationSaga
} from "../getEycaActivationSaga";

describe("handleEycaActivationSaga", () => {
  const getEycaActivation = jest.fn();

  it("should dispatch failure when getActivation returns Left", () => {
    const networkError = getGenericError(new Error("Network error"));
    testSaga(handleEycaActivationSaga, getEycaActivation)
      .next()
      .call(getActivation, getEycaActivation)
      .next(E.left(networkError))
      .put(cgnEycaActivation.failure(networkError))
      .next()
      .isDone();
  });

  it("should dispatch COMPLETED and stop", () => {
    testSaga(handleEycaActivationSaga, getEycaActivation)
      .next()
      .call(getActivation, getEycaActivation)
      .next(E.right("COMPLETED"))
      .put(cgnEycaActivation.success("COMPLETED"))
      .next()
      .isDone();
  });

  it("should dispatch NOT_FOUND and stop", () => {
    testSaga(handleEycaActivationSaga, getEycaActivation)
      .next()
      .call(getActivation, getEycaActivation)
      .next(E.right("NOT_FOUND"))
      .put(cgnEycaActivation.success("NOT_FOUND"))
      .next()
      .isDone();
  });

  it("should dispatch ERROR and stop", () => {
    testSaga(handleEycaActivationSaga, getEycaActivation)
      .next()
      .call(getActivation, getEycaActivation)
      .next(E.right("ERROR"))
      .put(cgnEycaActivation.success("ERROR"))
      .next()
      .isDone();
  });

  it("should enter polling flow and then complete", () => {
    testSaga(handleEycaActivationSaga, getEycaActivation)
      .next()
      .call(getActivation, getEycaActivation)
      .next(E.right("PROCESSING"))
      .put(cgnEycaActivation.success("POLLING"))
      .next()
      .call(startTimer, 1000)
      .next()
      .call(getActivation, getEycaActivation)
      .next(E.right("COMPLETED"))
      .put(cgnEycaActivation.success("COMPLETED"))
      .next()
      .isDone();
  });
});
