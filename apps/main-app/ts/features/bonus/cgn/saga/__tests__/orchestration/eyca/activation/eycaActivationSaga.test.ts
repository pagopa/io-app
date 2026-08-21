import { testSaga } from "redux-saga-test-plan";

import { getNetworkError } from "../../../../../../../../utils/errors";
import { cgnEycaActivation } from "../../../../../store/actions/eyca/activation";
import { cgnEycaStatus } from "../../../../../store/actions/eyca/details";
import {
  getActivation,
  handleEycaActivationSaga,
  handleStartActivation
} from "../../../../networking/eyca/activation/getEycaActivationSaga";
import { eycaActivationWorker } from "../../../../orchestration/eyca/eycaActivationSaga";
import {
  navigateToCgnDetails,
  navigateToEycaActivationLoading
} from "../../../../orchestration/navigation/actions";

describe("eycaActivationWorker", () => {
  const getEycaActivation = jest.fn();
  const startEycaActivation = jest.fn();

  it("should activate user's EYCA", () => {
    const returnedStatus = "COMPLETED";
    const returnedActivation = "PROCESSING";

    testSaga(eycaActivationWorker, getEycaActivation, startEycaActivation)
      .next()
      .call(navigateToEycaActivationLoading)
      .next()
      .call(getActivation, getEycaActivation)
      .next(returnedStatus)
      .call(handleStartActivation, startEycaActivation)
      .next(returnedActivation)
      .call(handleEycaActivationSaga, getEycaActivation)
      .next()
      .put(cgnEycaStatus.request())
      .next()
      .call(navigateToCgnDetails)
      .next()
      .isDone();
  });

  it("should activate user's EYCA without requesting the start activation", () => {
    const returnedStatus = "PROCESSING";

    testSaga(eycaActivationWorker, getEycaActivation, startEycaActivation)
      .next()
      .call(navigateToEycaActivationLoading)
      .next()
      .call(getActivation, getEycaActivation)
      .next(returnedStatus)
      .call(handleEycaActivationSaga, getEycaActivation)
      .next()
      .put(cgnEycaStatus.request())
      .next()
      .call(navigateToCgnDetails)
      .next()
      .isDone();
  });

  it("Cannot Activate EYCA", () => {
    const returnedStatus = "COMPLETED";
    const returnedActivation = "INELIGIBLE";

    testSaga(eycaActivationWorker, getEycaActivation, startEycaActivation)
      .next()
      .call(navigateToEycaActivationLoading)
      .next()
      .call(getActivation, getEycaActivation)
      .next(returnedStatus)
      .call(handleStartActivation, startEycaActivation)
      .next(returnedActivation)
      .put(cgnEycaActivation.success("INELIGIBLE"))
      .next()
      .call(navigateToCgnDetails)
      .next()
      .isDone();
  });

  it("cannot activate user's EYCA error on status check", () => {
    const returnedStatus = new Error(`response status 500`);

    testSaga(eycaActivationWorker, getEycaActivation, startEycaActivation)
      .next()
      .call(navigateToEycaActivationLoading)
      .next()
      .call(getActivation, getEycaActivation)
      .throw(returnedStatus)
      .put(cgnEycaActivation.failure(getNetworkError(returnedStatus)))
      .next()
      .isDone();
  });

  it("couldn't activate user's EYCA activation error", () => {
    const returnedStatus = "COMPLETED";
    const returnedActivation = new Error(`response status 500`);

    testSaga(eycaActivationWorker, getEycaActivation, startEycaActivation)
      .next()
      .call(navigateToEycaActivationLoading)
      .next()
      .call(getActivation, getEycaActivation)
      .next(returnedStatus)
      .call(handleStartActivation, startEycaActivation)
      .throw(returnedActivation)
      .put(cgnEycaActivation.failure(getNetworkError(returnedActivation)))
      .next()
      .isDone();
  });
});
