import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";

import { loadNextPageMessages as action } from "../../store/actions";
import {
  apiPayload,
  defaultRequestPayload,
  successLoadNextPageMessagesPayload
} from "../../__mocks__/messages";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { handleLoadNextPageMessages } from "../handleLoadNextPageMessages";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { backendClientManager } from "../../../../api/BackendClientManager";

// Mock the backendClientManager
jest.mock("../../../../api/BackendClientManager");

const mockGetMessages = jest.fn();
const mockBackendClientManager = backendClientManager as jest.Mocked<
  typeof backendClientManager
>;

beforeEach(() => {
  jest.clearAllMocks();
  mockBackendClientManager.getBackendClient.mockReturnValue({
    getMessages: mockGetMessages
  } as any);
});

describe("handleLoadNextPageMessages", () => {
  const sessionToken = "mockSessionToken";
  const getMessagesPayload = {
    enrich_result_data: true,
    page_size: defaultRequestPayload.pageSize,
    maximum_id: undefined,
    archived: defaultRequestPayload.filter.getArchived
  };

  describe("when the response is successful", () => {
    it(`should put ${getType(
      action.success
    )} with the parsed messages and pagination data`, () => {
      testSaga(
        handleLoadNextPageMessages,
        action.request(defaultRequestPayload)
      )
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .call(
          withRefreshApiCall,
          mockGetMessages(getMessagesPayload),
          action.request(defaultRequestPayload)
        )
        .next(E.right({ status: 200, value: apiPayload }))
        .put(action.success(successLoadNextPageMessagesPayload))
        .next()
        .isDone();
    });
  });

  describe("when the response is an Error", () => {
    it(`should put ${getType(action.failure)} with the error message`, () => {
      testSaga(
        handleLoadNextPageMessages,
        action.request(defaultRequestPayload)
      )
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .call(
          withRefreshApiCall,
          mockGetMessages(getMessagesPayload),
          action.request(defaultRequestPayload)
        )
        .next(E.right({ status: 500, value: { title: "Backend error" } }))
        .put(
          action.failure({
            error: new Error("Backend error"),
            filter: defaultRequestPayload.filter
          })
        )
        .next()
        .isDone();
    });
  });

  describe("when the handler throws", () => {
    it(`should catch it and put ${getType(action.failure)}`, () => {
      testSaga(
        handleLoadNextPageMessages,
        action.request(defaultRequestPayload)
      )
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .throw(new Error("I made a boo-boo, sir!"))
        .put(
          action.failure({
            error: new Error("I made a boo-boo, sir!"),
            filter: defaultRequestPayload.filter
          })
        )
        .next()
        .isDone();
    });
  });
});
