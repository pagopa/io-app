import { CreateFilledDocument } from "@io-app/api-types/generated/definitions/fci/CreateFilledDocument";
import { FilledDocumentDetailView } from "@io-app/api-types/generated/definitions/fci/FilledDocumentDetailView";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { left, right } from "fp-ts/lib/Either";
import { expectSaga, testSaga } from "redux-saga-test-plan";
import { throwError } from "redux-saga-test-plan/providers";
import { ActionType, getType } from "typesafe-actions";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { getNetworkError } from "../../../../../utils/errors";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import {
  fciLoadQtspFilledDocument,
  fciPollFilledDocument
} from "../../../store/actions";
import {
  fciPollFilledDocumentSelector,
  fciPollFilledDocumentSettledSelector
} from "../../../store/reducers/fciPollFilledDocument";
import { qtspFilledDocument } from "../../../types/__mocks__/CreateFilledDocumentBody.mock";
import {
  filledDocumentPollWatcher,
  handleCreateFilledDocument,
  watchFciPollSaga
} from "../handleCreateFilledDocument";

const mockedPayload: CreateFilledDocument = {
  document_url: "https://mockedUrl" as NonEmptyString
};

const successResponse = {
  status: 201,
  value: qtspFilledDocument as FilledDocumentDetailView
};

const failureResponse = {
  status: 403
};

describe("handleCreateFilledDocument", () => {
  const mockBackendFciClient = jest.fn();
  const loadAction: ActionType<typeof fciLoadQtspFilledDocument.request> = {
    type: "FCI_QTSP_FILLED_DOC_REQUEST",
    payload: mockedPayload
  };
  const postQtspFilledBodyRequest = mockBackendFciClient({
    body: loadAction.payload,
    Bearer: "mock-token"
  });
  it("Should dispatch fciLoadQtspFilledDocument.success with the response payload if the response is right and the status code is 200", () => {
    testSaga(
      handleCreateFilledDocument,
      mockBackendFciClient,
      "mock-token",
      loadAction
    )
      .next()
      .call(withRefreshApiCall, postQtspFilledBodyRequest, loadAction)
      .next(right(successResponse))
      .put(fciLoadQtspFilledDocument.success(successResponse.value))
      .next()
      .call(filledDocumentPollWatcher, qtspFilledDocument.filled_document_url)
      .next()
      .isDone();
  });
  it("Should dispatch fciLoadQtspFilledDocument.failure with the response status code as payload if the response is right and the status code is different from 200", () => {
    testSaga(
      handleCreateFilledDocument,
      mockBackendFciClient,
      "mock-token",
      loadAction
    )
      .next()
      .call(withRefreshApiCall, postQtspFilledBodyRequest, loadAction)
      .next(right(failureResponse))
      .next(
        fciLoadQtspFilledDocument.failure(
          getNetworkError(new Error(failureResponse.status.toString()))
        )
      )
      .next()
      .isDone();
  });
  it("Should dispatch fciLoadQtspFilledDocument.failure with a fixed message as payload if the response left", () => {
    testSaga(
      handleCreateFilledDocument,
      mockBackendFciClient,
      "mock-token",
      loadAction
    )
      .next()
      .call(withRefreshApiCall, postQtspFilledBodyRequest, loadAction)
      .next(left(new Error()))
      .next(
        fciLoadQtspFilledDocument.failure(
          getNetworkError(
            new Error("Invalid payload from fciLoadQtspFilledDocument")
          )
        )
      )
      .next()
      .isDone();
  });
  it("Should dispatch fciLoadQtspFilledDocument.failure with the error message as payload if an exception is raised", () => {
    const mockedError = new Error("mockedErrorMessage");
    testSaga(
      handleCreateFilledDocument,
      mockBackendFciClient,
      "mock-token",
      loadAction
    )
      .next()
      .call(withRefreshApiCall, postQtspFilledBodyRequest, loadAction)
      .throw(mockedError)
      .next(fciLoadQtspFilledDocument.failure(getNetworkError(mockedError)))
      .next()
      .isDone();
  });
});
// Mirror the polling timings of handleCreateFilledDocument
const POLLING_FREQ_TIMEOUT = 2000;
const POLLING_TIME_THRESHOLD = 20000;

const filledDocumentUrl = qtspFilledDocument.filled_document_url;

const expectedPollingRequestInit = {
  headers: { "Cache-Control": "no-cache, no-store" }
};

const notReadyResponse = { status: 404 } as Response;
const readyResponse = { status: 200 } as Response;

const pollingCancelledFailure = fciPollFilledDocument.failure(
  getNetworkError(new Error("Polling cancelled"))
);

describe("watchFciPollSaga", () => {
  it("should send every GET with the anti-cache directives and retry with the same request after a 404", () => {
    testSaga(watchFciPollSaga, filledDocumentUrl)
      .next()
      .put(fciPollFilledDocument.request())
      .next()
      .call(fetch, filledDocumentUrl, expectedPollingRequestInit)
      .next(notReadyResponse)
      .delay(POLLING_FREQ_TIMEOUT)
      .next()
      .put(fciPollFilledDocument.request())
      .next()
      .call(fetch, filledDocumentUrl, expectedPollingRequestInit);
  });

  it("should dispatch success and cancel the polling when the document is ready", () => {
    testSaga(watchFciPollSaga, filledDocumentUrl)
      .next()
      .put(fciPollFilledDocument.request())
      .next()
      .call(fetch, filledDocumentUrl, expectedPollingRequestInit)
      .next(readyResponse)
      .put(fciPollFilledDocument.success({ isReady: true }))
      .next()
      .put(fciPollFilledDocument.cancel())
      .next()
      .delay(POLLING_FREQ_TIMEOUT);
  });

  it("should dispatch failure and cancel the polling when the request throws", () => {
    const error = new Error("Network request failed");
    testSaga(watchFciPollSaga, filledDocumentUrl)
      .next()
      .put(fciPollFilledDocument.request())
      .next()
      .call(fetch, filledDocumentUrl, expectedPollingRequestInit)
      .throw(error)
      .put(fciPollFilledDocument.failure(getNetworkError(error)))
      .next()
      .put(fciPollFilledDocument.cancel());
  });

  it("should dispatch failure when cancelled before the document is settled", () => {
    testSaga(watchFciPollSaga, filledDocumentUrl)
      .next()
      .put(fciPollFilledDocument.request())
      .next()
      .finish()
      .cancelled()
      .next(true)
      .select(fciPollFilledDocumentSettledSelector)
      .next(false)
      .put(pollingCancelledFailure);
  });

  it("should not dispatch failure again when cancelled after the document is settled", () => {
    testSaga(watchFciPollSaga, filledDocumentUrl)
      .next()
      .put(fciPollFilledDocument.request())
      .next()
      .finish()
      .cancelled()
      .next(true)
      .select(fciPollFilledDocumentSettledSelector)
      .next(true)
      .isDone();
  });
});

describe("filledDocumentPollWatcher", () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));

  // The deadline is expired manually, at a precise attempt, without real waits
  const createDeadline = () => {
    // eslint-disable-next-line functional/no-let
    let expire: () => void = () => undefined;
    const promise = new Promise<void>(resolve => {
      expire = resolve;
    });
    return { promise, expire: () => expire() };
  };

  const runPollWatcher = (
    fetchMock: jest.Mock,
    deadline: Promise<void> = new Promise<void>(() => undefined)
  ) =>
    expectSaga(filledDocumentPollWatcher, filledDocumentUrl)
      .withReducer(appReducer, initialState)
      .provide({
        call(effect, next) {
          if (effect.fn === fetch) {
            return fetchMock(...effect.args);
          }
          if (effect.args[0] === POLLING_FREQ_TIMEOUT) {
            // Yield to the event loop between attempts, as a real delay would
            return Promise.resolve();
          }
          if (effect.args[0] === POLLING_TIME_THRESHOLD) {
            return deadline;
          }
          return next();
        }
      });

  const expectEveryRequestWithAntiCacheDirectives = (fetchMock: jest.Mock) =>
    fetchMock.mock.calls.forEach(args =>
      expect(args).toEqual([filledDocumentUrl, expectedPollingRequestInit])
    );

  it("should complete successfully on a 404 -> 404 -> 200 sequence within the deadline", async () => {
    const fetchMock = jest
      .fn()
      .mockReturnValueOnce(notReadyResponse)
      .mockReturnValueOnce(notReadyResponse)
      .mockReturnValueOnce(readyResponse);

    const result = await runPollWatcher(fetchMock)
      .put(fciPollFilledDocument.success({ isReady: true }))
      .put(fciPollFilledDocument.cancel())
      .not.put.actionType(getType(fciPollFilledDocument.failure))
      .run();

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expectEveryRequestWithAntiCacheDirectives(fetchMock);
    expect(
      fciPollFilledDocumentSelector(result.storeState as GlobalState)
    ).toEqual(pot.some({ isReady: true }));
  });

  type TimeoutCase = {
    expectedAttempts: number;
    mockFetch: (fetchMock: jest.Mock, expireDeadline: () => void) => void;
    name: string;
  };

  const timeoutCases: ReadonlyArray<TimeoutCase> = [
    {
      name: "the document is persistently missing",
      expectedAttempts: 3,
      mockFetch: (fetchMock, expireDeadline) =>
        fetchMock.mockImplementation(() => {
          if (fetchMock.mock.calls.length === 3) {
            expireDeadline();
          }
          return notReadyResponse;
        })
    },
    {
      name: "the request stays pending",
      expectedAttempts: 1,
      mockFetch: (fetchMock, expireDeadline) =>
        fetchMock.mockImplementation(() => {
          expireDeadline();
          return new Promise(() => undefined);
        })
    }
  ];

  it.each(timeoutCases)(
    "should stop polling and dispatch failure at the deadline when $name",
    async ({ expectedAttempts, mockFetch }) => {
      const deadline = createDeadline();
      const fetchMock = jest.fn();
      mockFetch(fetchMock, deadline.expire);

      const result = await runPollWatcher(fetchMock, deadline.promise)
        .put(pollingCancelledFailure)
        .not.put(fciPollFilledDocument.success({ isReady: true }))
        .run();

      expect(fetchMock).toHaveBeenCalledTimes(expectedAttempts);
      expectEveryRequestWithAntiCacheDirectives(fetchMock);
      expect(
        pot.isError(
          fciPollFilledDocumentSelector(result.storeState as GlobalState)
        )
      ).toBe(true);
    }
  );

  it("should track the failure only once when the request throws", async () => {
    const error = new Error("Network request failed");
    const fetchMock = jest.fn().mockReturnValue(throwError(error));

    const result = await runPollWatcher(fetchMock)
      .put(fciPollFilledDocument.failure(getNetworkError(error)))
      .run();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const failureActions = result.effects.put.filter(
      (effect: { payload: { action: { type: string } } }) =>
        effect.payload.action.type === getType(fciPollFilledDocument.failure)
    );
    expect(failureActions).toHaveLength(1);
  });
});
