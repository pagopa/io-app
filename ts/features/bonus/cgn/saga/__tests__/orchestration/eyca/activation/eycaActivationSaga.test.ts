import { left, right } from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getGenericError } from "../../../../../../../../utils/errors";
import {
  navigateToCgnDetails,
  navigateToEycaActivationLoading
} from "../../../../orchestration/navigation/actions";
import { cgnEycaActivation } from "../../../../../store/actions/eyca/activation";
import { cgnEycaStatus } from "../../../../../store/actions/eyca/details";
import {
  getActivation,
  handleEycaActivationSaga,
  handleStartActivation
} from "../../../../networking/eyca/activation/getEycaActivationSaga";
import { eycaActivationWorker } from "../../../../orchestration/eyca/eycaActivationSaga";

describe("eycaActivationWorker", () => {
  const getEycaActivation = jest.fn();
  const startEycaActivation = jest.fn();

  it("should activate user's EYCA", () => {
    const returnedStatus = right("COMPLETED");
    const returnedActivation = right("PROCESSING");

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
      .call(navigateToCgnDetails);
  });

  it("should activate user's EYCA without requesting the start activation", () => {
    const returnedStatus = right("PROCESSING");

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
      .call(navigateToCgnDetails);
  });

  it("Cannot Activate EYCA", () => {
    const returnedStatus = right("COMPLETED");
    const returnedActivation = right("INELIGIBLE");

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
      .next();
  });

  it("cannot activate user's EYCA error on status check", () => {
    const returnedStatus = left(
      getGenericError(new Error(`response status 500`))
    );

    testSaga(eycaActivationWorker, getEycaActivation, startEycaActivation)
      .next()
      .call(navigateToEycaActivationLoading)
      .next()
      .call(getActivation, getEycaActivation)
      .next(returnedStatus)
      .put(cgnEycaStatus.request())
      .next()
      .call(navigateToCgnDetails)
      .next();
  });

  it("couldn't activate user's EYCA activation error", () => {
    const returnedStatus = right("COMPLETED");
    const returnedActivation = left(
      getGenericError(new Error(`response status 500`))
    );

    testSaga(eycaActivationWorker, getEycaActivation, startEycaActivation)
      .next()
      .call(navigateToEycaActivationLoading)
      .next()
      .call(getActivation, getEycaActivation)
      .next(returnedStatus)
      .call(handleStartActivation, startEycaActivation)
      .next(returnedActivation)
      .put(
        cgnEycaActivation.failure(
          getGenericError(new Error(`response status 500`))
        )
      );
  });
});
