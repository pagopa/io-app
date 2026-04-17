import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import {
  getGenericError
} from "../../../../../../../../utils/errors";
import { startTimer } from "../../../../../../../../utils/timer";
import { withRefreshApiCall } from "../../../../../../../authentication/fastLogin/saga/utils";
import { cgnEycaActivation } from "../../../../../store/actions/eyca/activation";
import {
  getActivation,
  handleEycaActivationSaga,
  handleStartActivation
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

describe("getActivation", () => {
  const data = [
    {
      value: "COMPLETED",
      returnValue: "COMPLETED"
    },
    {
      value: "ERROR",
      returnValue: "ERROR"
    },
    {
      value: "RUNNING",
      returnValue: "PROCESSING"
    },
    {
      value: "PENDING",
      returnValue: "PROCESSING"
    }
  ];

  const getEycaActivation = jest.fn();
  data.forEach(status => {
    it(`should return right with status ${status.value} on success response`, async () => {
      const mockResponse = E.right({
        status: 200,
        value: {
          status: status.value
        }
      });

      testSaga(getActivation, getEycaActivation)
        .next()
        .call(
          withRefreshApiCall,
          getEycaActivation({}),
          cgnEycaActivation.request()
        )
        .next(mockResponse)
        .returns(E.right(status.returnValue))
        .next()
        .isDone();
    });
  });

  it("should return error on decoding failure", async () => {
    const wrongResponse = E.right({
      status: 200,
      value: {
        status: "UNKNOWN"
      }
    });

    testSaga(getActivation, getEycaActivation)
      .next()
      .call(
        withRefreshApiCall,
        getEycaActivation({}),
        cgnEycaActivation.request()
      )
      .next(wrongResponse)
      .returns(
        E.left(getGenericError(new Error("unexpected status result UNKNOWN")))
      )
      .next()
      .isDone();
  });

  it("should return right with NOT_FOUND on 404 response", async () => {
    const mockResponse = E.right({
      status: 404,
      value: {}
    });

    testSaga(getActivation, getEycaActivation)
      .next()
      .call(
        withRefreshApiCall,
        getEycaActivation({}),
        cgnEycaActivation.request()
      )
      .next(mockResponse)
      .returns(E.right("NOT_FOUND"))
      .next()
      .isDone();
  });

  it("should return left with error on non-200/404 response", async () => {
    const mockResponse = E.right({
      status: 500,
      value: {}
    });

    testSaga(getActivation, getEycaActivation)
      .next()
      .call(
        withRefreshApiCall,
        getEycaActivation({}),
        cgnEycaActivation.request()
      )
      .next(mockResponse)
      .returns(E.left(getGenericError(new Error("response status 500"))))
      .next()
      .isDone();
  });

  it("should throw an error if API returns a network error", () => {
    const networkError = new Error("Network error");
    testSaga(getActivation, getEycaActivation)
      .next()
      .call(
        withRefreshApiCall,
        getEycaActivation({}),
        cgnEycaActivation.request()
      )
      .throw(networkError)
      .returns(E.left(getGenericError(networkError)))
      .next()
      .isDone();
  });
});

describe("handleStartActivation", () => {
  const startEycaActivation = jest.fn();

  const mapStatus = new Map([
    [201, "PROCESSING"],
    [202, "PROCESSING"],
    [403, "INELIGIBLE"],
    [409, "ALREADY_ACTIVE"]
  ]);

  mapStatus.forEach((mappedStatus, backendStatus) => {
    it(`should return right with ${mappedStatus} when response status is ${backendStatus}`, async () => {
      const mockResponse = E.right({
        status: backendStatus
      });

      testSaga(handleStartActivation, startEycaActivation)
        .next()
        .call(
          withRefreshApiCall,
          startEycaActivation({}),
          cgnEycaActivation.request()
        )
        .next(mockResponse)
        .returns(E.right(mappedStatus))
        .next()
        .isDone();
    });
  });
});
