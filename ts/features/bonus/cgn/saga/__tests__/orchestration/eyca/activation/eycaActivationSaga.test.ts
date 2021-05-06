import { testSaga } from "redux-saga-test-plan";
import { left, right } from "fp-ts/lib/Either";
import { navigationHistoryPop } from "../../../../../../../../store/actions/navigationHistory";
import { eycaActivationWorker } from "../../../../orchestration/eyca/eycaActivationSaga";
import {
  navigateToCgnDetails,
  navigateToEycaActivationLoading
} from "../../../../../navigation/actions";
import {
  getActivation,
  handleEycaActivationSaga,
  handleStartActivation
} from "../../../../networking/eyca/activation/getEycaActivationSaga";
import { cgnEycaStatus } from "../../../../../store/actions/eyca/details";
import { cgnEycaActivation } from "../../../../../store/actions/eyca/activation";
import { getGenericError } from "../../../../../../../../utils/errors";

describe("eycaActivationWorker", () => {
  const getEycaActivation = jest.fn();
  const startEycaActivation = jest.fn();

  it("should activate user's EYCA", () => {
    const returnedStatus = right("COMPLETED");
    const returnedActivation = right("PROCESSING");

    testSaga(eycaActivationWorker, getEycaActivation, startEycaActivation)
      .next()
      .put(navigateToEycaActivationLoading())
      .next()
      .put(navigationHistoryPop(1))
      .next()
      .call(getActivation, getEycaActivation)
      .next(returnedStatus)
      .call(handleStartActivation, startEycaActivation)
      .next(returnedActivation)
      .call(handleEycaActivationSaga, getEycaActivation)
      .next()
      .put(cgnEycaStatus.request())
      .next()
      .put(navigateToCgnDetails())
      .next()
      .put(navigationHistoryPop(1));
  });

  it("should activate user's EYCA without requesting the start activation", () => {
    const returnedStatus = right("PROCESSING");

    testSaga(eycaActivationWorker, getEycaActivation, startEycaActivation)
      .next()
      .put(navigateToEycaActivationLoading())
      .next()
      .put(navigationHistoryPop(1))
      .next()
      .call(getActivation, getEycaActivation)
      .next(returnedStatus)
      .call(handleEycaActivationSaga, getEycaActivation)
      .next()
      .put(cgnEycaStatus.request())
      .next()
      .put(navigateToCgnDetails())
      .next()
      .put(navigationHistoryPop(1));
  });

  it("Cannot Activate EYCA", () => {
    const returnedStatus = right("COMPLETED");
    const returnedActivation = right("INELIGIBLE");

    testSaga(eycaActivationWorker, getEycaActivation, startEycaActivation)
      .next()
      .put(navigateToEycaActivationLoading())
      .next()
      .put(navigationHistoryPop(1))
      .next()
      .call(getActivation, getEycaActivation)
      .next(returnedStatus)
      .call(handleStartActivation, startEycaActivation)
      .next(returnedActivation)
      .put(cgnEycaActivation.success("INELIGIBLE"))
      .next()
      .put(navigateToCgnDetails())
      .next()
      .put(navigationHistoryPop(1));
  });

  it("cannot activate user's EYCA error on status check", () => {
    const returnedStatus = left(
      getGenericError(new Error(`response status 500`))
    );

    testSaga(eycaActivationWorker, getEycaActivation, startEycaActivation)
      .next()
      .put(navigateToEycaActivationLoading())
      .next()
      .put(navigationHistoryPop(1))
      .next()
      .call(getActivation, getEycaActivation)
      .next(returnedStatus)
      .put(cgnEycaStatus.request())
      .next()
      .put(navigateToCgnDetails())
      .next()
      .put(navigationHistoryPop(1));
  });

  it("couldn't activate user's EYCA activation error", () => {
    const returnedStatus = right("COMPLETED");
    const returnedActivation = left(
      getGenericError(new Error(`response status 500`))
    );

    testSaga(eycaActivationWorker, getEycaActivation, startEycaActivation)
      .next()
      .put(navigateToEycaActivationLoading())
      .next()
      .put(navigationHistoryPop(1))
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
