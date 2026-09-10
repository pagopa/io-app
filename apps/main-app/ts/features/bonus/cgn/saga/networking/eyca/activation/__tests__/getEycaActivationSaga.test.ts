import { err, ok } from "neverthrow";
import { testSaga } from "redux-saga-test-plan";

import { getGenericError } from "../../../../../../../../utils/errors";
import { startTimer } from "../../../../../../../../utils/timer";
import { withRefreshApiCall } from "../../../../../../../authentication/fastLogin/saga/utils";
import { cgnEycaActivation } from "../../../../../store/actions/eyca/activation";
import { getActivation, GetActivationResult } from "../getActivation";
import { handleEycaActivationSaga } from "../handleEycaActivationSaga";
import {
  handleStartActivation,
  StartActivationResult
} from "../handleStartActivation";

describe("handleEycaActivationSaga", () => {
  const getEycaActivation = jest.fn();

  it("should dispatch failure when getActivation returns an error", () => {
    const networkError = getGenericError(new Error("Network error"));
    expect(() => {
      testSaga(handleEycaActivationSaga, getEycaActivation)
        .next()
        .call(getActivation, getEycaActivation)
        .next(err(networkError))
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
        .next(ok("COMPLETED"))
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
        .next(ok("NOT_FOUND"))
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
        .next(ok("ERROR"))
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
        .next(ok("PROCESSING"))
        .put(cgnEycaActivation.success("POLLING"))
        .next()
        .call(startTimer, 1000)
        .next()
        .call(getActivation, getEycaActivation)
        .next(ok("COMPLETED"))
        .put(cgnEycaActivation.success("COMPLETED"))
        .next()
        .isDone();
    }).not.toThrow();
  });

  it("should dispatch timeout when polling threshold is exceeded", () => {
    const nowSpy = jest
      .spyOn(Date, "now")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(10001);

    expect(() => {
      testSaga(handleEycaActivationSaga, getEycaActivation)
        .next()
        .call(getActivation, getEycaActivation)
        .next(ok("PROCESSING"))
        .put(cgnEycaActivation.success("POLLING"))
        .next()
        .call(startTimer, 1000)
        .next()
        .put(cgnEycaActivation.success("POLLING_TIMEOUT"))
        .next()
        .isDone();
    }).not.toThrow();

    nowSpy.mockRestore();
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
          .returns(ok(status.returnValue))
          .next()
          .isDone();
      }).not.toThrow();
    });
  });

  it("should return an error on decoding failure", () => {
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

    const result = iterator.next(wrongResponse as never);
    const activationResult = result.value as GetActivationResult;
    if (activationResult.isOk()) {
      throw new Error("expected getActivation to return an error result");
    }
    expect(activationResult.error.kind).toBe("generic");
    if (activationResult.error.kind !== "generic") {
      throw new Error("expected a generic error");
    }
    expect(activationResult.error.value.message).toBe(
      "unexpected status result UNKNOWN"
    );
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
        .returns(ok("NOT_FOUND"))
        .next()
        .isDone();
    }).not.toThrow();
  });

  it("should return an error on non-200/404 response", () => {
    const mockResponse = {
      _tag: "Right" as const,
      right: {
        status: 500,
        value: {}
      }
    };

    const iterator = getActivation(getEycaActivation);
    iterator.next();

    const result = iterator.next(mockResponse as never);
    const activationResult = result.value as GetActivationResult;
    if (activationResult.isOk()) {
      throw new Error("expected getActivation to return an error result");
    }
    expect(activationResult.error.kind).toBe("generic");
    if (activationResult.error.kind !== "generic") {
      throw new Error("expected a generic error");
    }
    expect(activationResult.error.value.message).toBe("response status 500");
  });

  it("should return a network error if the API call throws", () => {
    const networkError = new Error("Network error");
    const iterator = getActivation(getEycaActivation);
    iterator.next();

    const result = iterator.throw(networkError);
    const activationResult = result.value as GetActivationResult;
    if (activationResult.isOk()) {
      throw new Error("expected getActivation to return an error result");
    }
    expect(activationResult.error.kind).toBe("generic");
    if (activationResult.error.kind !== "generic") {
      throw new Error("expected a generic error");
    }
    expect(activationResult.error.value.message).toBe("Network error");
  });

  it("should return an error on decoder failure payload", () => {
    const iterator = getActivation(getEycaActivation);
    iterator.next();

    const result = iterator.next({ _tag: "Left", left: [] } as never);
    const activationResult = result.value as GetActivationResult;
    if (activationResult.isOk()) {
      throw new Error("expected getActivation to return an error result");
    }
    expect(activationResult.error.kind).toBe("generic");
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
          .returns(ok(mappedStatus))
          .next()
          .isDone();
      }).not.toThrow();
    });
  });

  it("should return an error on unexpected start activation status", () => {
    const iterator = handleStartActivation(startEycaActivation);
    iterator.next();

    const result = iterator.next({
      _tag: "Right",
      right: { status: 500 }
    } as never);
    const activationResult = result.value as StartActivationResult;
    if (activationResult.isOk()) {
      throw new Error(
        "expected handleStartActivation to return an error result"
      );
    }
    expect(activationResult.error.kind).toBe("generic");
    if (activationResult.error.kind !== "generic") {
      throw new Error("expected a generic error");
    }
    expect(activationResult.error.value.message).toBe("response status 500");
  });
});
