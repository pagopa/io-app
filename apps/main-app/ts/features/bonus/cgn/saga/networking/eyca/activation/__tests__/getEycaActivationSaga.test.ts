import { testSaga } from "redux-saga-test-plan";
import { getGenericError } from "../../../../../../../../utils/errors";
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
    expect(() => {
      testSaga(handleEycaActivationSaga, getEycaActivation)
        .next()
        .call(getActivation, getEycaActivation)
        .throw(networkError as any)
        .put(cgnEycaActivation.failure(networkError))
        .next()
        .isDone();
    }).not.toThrow();
  });

  it("should dispatch COMPLETED and stop", () => {
    expect(() => {
      testSaga(handleEycaActivationSaga, getEycaActivation)
        .next()
        .call(getActivation, getEycaActivation)
        .next("COMPLETED")
        .put(cgnEycaActivation.success("COMPLETED"))
        .next()
        .isDone();
    }).not.toThrow();
  });

  it("should dispatch NOT_FOUND and stop", () => {
    expect(() => {
      testSaga(handleEycaActivationSaga, getEycaActivation)
        .next()
        .call(getActivation, getEycaActivation)
        .next("NOT_FOUND")
        .put(cgnEycaActivation.success("NOT_FOUND"))
        .next()
        .isDone();
    }).not.toThrow();
  });

  it("should dispatch ERROR and stop", () => {
    expect(() => {
      testSaga(handleEycaActivationSaga, getEycaActivation)
        .next()
        .call(getActivation, getEycaActivation)
        .next("ERROR")
        .put(cgnEycaActivation.success("ERROR"))
        .next()
        .isDone();
    }).not.toThrow();
  });

  it("should enter polling flow and then complete", () => {
    expect(() => {
      testSaga(handleEycaActivationSaga, getEycaActivation)
        .next()
        .call(getActivation, getEycaActivation)
        .next("PROCESSING")
        .put(cgnEycaActivation.success("POLLING"))
        .next()
        .call(startTimer, 1000)
        .next()
        .call(getActivation, getEycaActivation)
        .next("COMPLETED")
        .put(cgnEycaActivation.success("COMPLETED"))
        .next()
        .isDone();
    }).not.toThrow();
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
    it(`should return status ${status.value} on success response`, () => {
      const mockResponse = {
        _tag: "Right" as const,
        right: {
          status: 200,
          value: {
            status: status.value
          }
        }
      };

      expect(() => {
        testSaga(getActivation, getEycaActivation)
          .next()
          .call(
            withRefreshApiCall,
            getEycaActivation({}),
            cgnEycaActivation.request()
          )
          .next(mockResponse)
          .returns(status.returnValue)
          .next()
          .isDone();
      }).not.toThrow();
    });
  });

  it("should throw error on decoding failure", () => {
    const wrongResponse = {
      _tag: "Right" as const,
      right: {
        status: 200,
        value: {
          status: "UNKNOWN"
        }
      }
    };

    const iterator = getActivation(getEycaActivation);
    iterator.next();

    try {
      iterator.next(wrongResponse as never);
      throw new Error("expected getActivation to throw");
    } catch (e) {
      const error = e as ReturnType<typeof getGenericError>;
      expect(error.kind).toBe("generic");
      expect(error.value.message).toBe("unexpected status result UNKNOWN");
    }
  });

  it("should return NOT_FOUND on 404 response", () => {
    const mockResponse = {
      _tag: "Right" as const,
      right: {
        status: 404,
        value: {}
      }
    };

    expect(() => {
      testSaga(getActivation, getEycaActivation)
        .next()
        .call(
          withRefreshApiCall,
          getEycaActivation({}),
          cgnEycaActivation.request()
        )
        .next(mockResponse)
        .returns("NOT_FOUND")
        .next()
        .isDone();
    }).not.toThrow();
  });

  it("should throw error on non-200/404 response", () => {
    const mockResponse = {
      _tag: "Right" as const,
      right: {
        status: 500,
        value: {}
      }
    };

    const iterator = getActivation(getEycaActivation);
    iterator.next();

    try {
      iterator.next(mockResponse as never);
      throw new Error("expected getActivation to throw");
    } catch (e) {
      const error = e as ReturnType<typeof getGenericError>;
      expect(error.kind).toBe("generic");
      expect(error.value.message).toBe("response status 500");
    }
  });

  it("should throw an error if API returns a network error", () => {
    const networkError = new Error("Network error");
    const iterator = getActivation(getEycaActivation);
    iterator.next();

    try {
      iterator.throw(networkError);
      throw new Error("expected getActivation to throw");
    } catch (e) {
      const error = e as ReturnType<typeof getGenericError>;
      expect(error.kind).toBe("generic");
      expect(error.value.message).toBe("Network error");
    }
  });
});

describe("handleStartActivation", () => {
  const startEycaActivation = jest.fn();

  const mapStatus = new Map([
    [201, "PROCESSING"],
    [202, "PROCESSING"],
    [403, "INELIGIBLE"],
    [409, "ALREADY_ACTIVE"]
  ] as const);

  mapStatus.forEach((mappedStatus, backendStatus) => {
    it(`should return ${mappedStatus} when response status is ${backendStatus}`, () => {
      const mockResponse = {
        _tag: "Right" as const,
        right: {
          status: backendStatus
        }
      };

      expect(() => {
        testSaga(handleStartActivation, startEycaActivation)
          .next()
          .call(
            withRefreshApiCall,
            startEycaActivation({}),
            cgnEycaActivation.request()
          )
          .next(mockResponse)
          .returns(mappedStatus)
          .next()
          .isDone();
      }).not.toThrow();
    });
  });
});
