import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { ValidationError } from "io-ts";
import { expectSaga, testSaga } from "redux-saga-test-plan";
import { call } from "redux-saga-test-plan/matchers";
import { select } from "typed-redux-saga/macro";
import * as PERSISTED_SELECTORS from "../../../../../store/reducers/persistedPreferences";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import * as TRACK_FAILURE from "../../../common/analytics";
import { preferredLanguageToString } from "../../../common/utils";
import { FimsHistoryClient } from "../../api/client";
import { fimsHistoryGet } from "../../store/actions";
import {
  extractFimsHistoryResponseAction,
  handleGetFimsHistorySaga
} from "../handleGetFimsHistorySaga";

type ResponseType = Awaited<ReturnType<FimsHistoryClient["getAccessHistory"]>>;

const decodedSuccessResponse = {
  status: 200,
  value: {
    data: [
      {
        id: "id",
        redirect: {
          display_name: "An Url",
          uri: "https://www.anUrl.com"
        },
        service_id: "sid",
        timestamp: new Date()
      }
    ]
  },
  headers: {}
};

const action = fimsHistoryGet.request({});

describe("handleGetFimsHistorySaga", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("Should dispatch fimsHistoryGet.success if status is 200 and the response is [right], while passing the correct parameters to the client", () => {
    const mockTrackFailure = jest.fn();
    jest
      .spyOn(TRACK_FAILURE, "trackHistoryFailure")
      .mockImplementation(mockTrackFailure);

    const successResponse = E.right(decodedSuccessResponse) as ResponseType;
    const resultPromiseSuccess = Promise.resolve(successResponse);
    const mockSuccessClient = jest.fn(() => resultPromiseSuccess);
    testSaga(handleGetFimsHistorySaga, mockSuccessClient, "MOCK_BEARER", action)
      .next()
      .select(PERSISTED_SELECTORS.preferredLanguageSelector)
      .next(O.some("it"))
      .call(preferredLanguageToString, O.some("it"))
      .next("it")
      .call(withRefreshApiCall, resultPromiseSuccess, action)
      .next(successResponse)
      .call(extractFimsHistoryResponseAction, successResponse)
      .next(fimsHistoryGet.success(decodedSuccessResponse.value))
      .put(fimsHistoryGet.success(decodedSuccessResponse.value))
      .next()
      .isDone();
    expect(mockSuccessClient).toHaveBeenCalledWith({
      Bearer: "Bearer MOCK_BEARER",
      "Accept-Language": "it",
      page: action.payload.continuationToken
    });
    expect(mockTrackFailure).not.toHaveBeenCalled();
  });
  it("Should dispatch fimsHistoryGet.failure if status is not 200 and the response is [right]", () => {
    const mockTrackFailure = jest.fn();
    jest
      .spyOn(TRACK_FAILURE, "trackHistoryFailure")
      .mockImplementation(mockTrackFailure);

    const failureResponse = E.right({ status: 404 }) as ResponseType;
    const resultPromiseFailure = Promise.resolve(failureResponse);
    const mockFailureClient = () => resultPromiseFailure;
    testSaga(handleGetFimsHistorySaga, mockFailureClient, "MOCK_BEARER", action)
      .next()
      .select(PERSISTED_SELECTORS.preferredLanguageSelector)
      .next(O.some("it"))
      .call(preferredLanguageToString, O.some("it"))
      .next("it")
      .call(withRefreshApiCall, resultPromiseFailure, action)
      .next(failureResponse)
      .call(extractFimsHistoryResponseAction, failureResponse)
      .next(fimsHistoryGet.failure("GENERIC_NON_200: 404"))
      .put(fimsHistoryGet.failure("GENERIC_NON_200: 404"))
      .next()
      .isDone();

    expect(mockTrackFailure).toHaveBeenCalledWith("GENERIC_NON_200: 404");
  });
  it("Should dispatch fimsHistoryGet.failure if the response's decode has failed ( its status is [left] ) ", () => {
    const mockTrackFailure = jest.fn();
    jest
      .spyOn(TRACK_FAILURE, "trackHistoryFailure")
      .mockImplementation(mockTrackFailure);

    const errorContent: ReadonlyArray<ValidationError> = [
      {
        context: [],
        value: "",
        message: "error message"
      }
    ];
    const errorMessage = readableReportSimplified(errorContent);
    const failureResponse = E.left(errorContent) as ResponseType;
    const resultPromiseFailure = Promise.resolve(failureResponse);
    const mockFailureClient = () => resultPromiseFailure;
    testSaga(handleGetFimsHistorySaga, mockFailureClient, "MOCK_BEARER", action)
      .next()
      .select(PERSISTED_SELECTORS.preferredLanguageSelector)
      .next(O.some("it"))
      .call(preferredLanguageToString, O.some("it"))
      .next("it")
      .call(withRefreshApiCall, resultPromiseFailure, action)
      .next(failureResponse)
      .call(extractFimsHistoryResponseAction, failureResponse)
      .next(fimsHistoryGet.failure(errorMessage))
      .put(fimsHistoryGet.failure(errorMessage))
      .next()
      .isDone();

    expect(mockTrackFailure).toHaveBeenCalledWith(errorMessage);
  });
  it("Should dispatch fimsHistoryGet.failure if the request is rejected", async () => {
    const mockTrackFailure = jest.fn();
    jest
      .spyOn(TRACK_FAILURE, "trackHistoryFailure")
      .mockImplementation(mockTrackFailure);
    const failureResponse = E.right({ status: 404 }) as ResponseType;
    const resultPromiseFailure = Promise.reject(failureResponse);
    const mockFailureClient = () => resultPromiseFailure;

    const errorMessage = `${failureResponse} ${JSON.stringify(
      failureResponse
    )}`;

    const result = await expectSaga(
      handleGetFimsHistorySaga,
      mockFailureClient,
      "MOCK_BEARER",
      action
    )
      .provide([
        [select(PERSISTED_SELECTORS.preferredLanguageSelector), O.some("it")],
        [call.fn(preferredLanguageToString), "it"]
      ])
      .put(fimsHistoryGet.failure(errorMessage))
      .run();
    expect(mockTrackFailure).toHaveBeenCalledWith(errorMessage);
    return result;
  });
});

describe("extractFimsHistoryResponseAction", () => {
  it("Should return fimsHistoryGet.success if the response is [right], with a 200 status", () => {
    const successResponse = E.right(decodedSuccessResponse) as ResponseType;
    expect(extractFimsHistoryResponseAction(successResponse)).toEqual(
      fimsHistoryGet.success(decodedSuccessResponse.value)
    );
  });
  it("Should return fimsHistoryGet.failure if the response is [right], with a different status", () => {
    const failureResponse = E.right({ status: 404 }) as ResponseType;
    expect(extractFimsHistoryResponseAction(failureResponse)).toEqual(
      fimsHistoryGet.failure("GENERIC_NON_200: 404")
    );
  });
  it("Should return fimsHistoryGet.failure if the response is [left]", () => {
    const errorContent: ReadonlyArray<ValidationError> = [
      {
        context: [],
        value: "",
        message: "error message"
      }
    ];
    const errorMessage = readableReportSimplified(errorContent);
    const failureResponse = E.left(errorContent) as ResponseType;
    expect(extractFimsHistoryResponseAction(failureResponse)).toEqual(
      fimsHistoryGet.failure(errorMessage)
    );
  });
});
