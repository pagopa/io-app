import { err, ok } from "neverthrow";
import { testSaga } from "redux-saga-test-plan";

import {
  getGenericError,
  getNetworkError
} from "../../../../../../../../utils/errors";
import { cgnEycaActivation } from "../../../../../store/actions/eyca/activation";
import { cgnEycaStatus } from "../../../../../store/actions/eyca/details";
import { getActivation } from "../../../../networking/eyca/activation/getActivation";
import { handleEycaActivationSaga } from "../../../../networking/eyca/activation/handleEycaActivationSaga";
import { handleStartActivation } from "../../../../networking/eyca/activation/handleStartActivation";
import { eycaActivationWorker } from "../../../../orchestration/eyca/eycaActivationWorker";
import {
  navigateToCgnDetails,
  navigateToEycaActivationLoading
} from "../../../../orchestration/navigation/actions";

describe("eycaActivationWorker", () => {
  const getEycaActivation = jest.fn();
  const startEycaActivation = jest.fn();

  it("should activate user's EYCA", () => {
    const returnedStatus = ok("COMPLETED" as const);
    const returnedActivation = ok("PROCESSING" as const);

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
    const returnedStatus = ok("PROCESSING" as const);

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
    const returnedStatus = ok("COMPLETED" as const);
    const returnedActivation = ok("INELIGIBLE" as const);

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
    const returnedStatus = err(
      getGenericError(new Error(`response status 500`))
    );

    testSaga(eycaActivationWorker, getEycaActivation, startEycaActivation)
      .next()
      .call(navigateToEycaActivationLoading)
      .next()
      .call(getActivation, getEycaActivation)
      .next(returnedStatus)
      .put(
        cgnEycaActivation.failure(
          getGenericError(new Error(`response status 500`))
        )
      )
      .next()
      .isDone();
  });

  it("should dispatch a failure and not refresh details/navigate on a timeout status check", () => {
    const returnedStatus = err({ kind: "timeout" } as const);

    testSaga(eycaActivationWorker, getEycaActivation, startEycaActivation)
      .next()
      .call(navigateToEycaActivationLoading)
      .next()
      .call(getActivation, getEycaActivation)
      .next(returnedStatus)
      .put(cgnEycaActivation.failure({ kind: "timeout" } as const))
      .next()
      .isDone();
  });

  it("couldn't activate user's EYCA activation error", () => {
    const returnedStatus = ok("COMPLETED" as const);
    const returnedActivationError = new Error(`response status 500`);
    const returnedActivation = err(getNetworkError(returnedActivationError));

    testSaga(eycaActivationWorker, getEycaActivation, startEycaActivation)
      .next()
      .call(navigateToEycaActivationLoading)
      .next()
      .call(getActivation, getEycaActivation)
      .next(returnedStatus)
      .call(handleStartActivation, startEycaActivation)
      .next(returnedActivation)
      .put(cgnEycaActivation.failure(getNetworkError(returnedActivationError)))
      .next()
      .isDone();
  });
});
