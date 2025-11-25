import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";

import { loadMessageDetails as action } from "../../store/actions";
import {
  apiPayload,
  paymentValidInvalidAfterDueDate,
  successLoadMessageDetails
} from "../../__mocks__/message";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { handleLoadMessageDetails } from "../handleLoadMessageDetails";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { backendClientManager } from "../../../../api/BackendClientManager";

const id = paymentValidInvalidAfterDueDate.id;

// Mock the backendClientManager
jest.mock("../../../../api/BackendClientManager");

const mockGetMessage = jest.fn();
const mockBackendClientManager = backendClientManager as jest.Mocked<
  typeof backendClientManager
>;

beforeEach(() => {
  jest.clearAllMocks();
  mockBackendClientManager.getBackendClient.mockReturnValue({
    getMessage: mockGetMessage
  } as any);
});

describe("handleLoadMessageDetails", () => {
  const getMessagesPayload = { id };
  const sessionToken = "mockSessionToken";

  describe("when the response is successful", () => {
    it(`should put ${getType(
      action.success
    )} with the parsed messages and pagination data`, () => {
      testSaga(handleLoadMessageDetails, action.request({ id }))
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .call(
          withRefreshApiCall,
          mockGetMessage(getMessagesPayload),
          action.request({ id })
        )
        // .call(getMessage, getMessagesPayload)
        .next(E.right({ status: 200, value: apiPayload }))
        .put(action.success(successLoadMessageDetails))
        .next()
        .isDone();
    });
  });

  describe("when the response is an Error", () => {
    it(`should put ${getType(action.failure)} with the error message`, () => {
      testSaga(handleLoadMessageDetails, action.request({ id }))
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .call(
          withRefreshApiCall,
          mockGetMessage(getMessagesPayload),
          action.request({ id })
        )
        .next(E.right({ status: 500, value: { title: "Backend error" } }))
        .put(action.failure({ id, error: Error("Backend error") }))
        .next()
        .isDone();
    });
  });

  describe("when the handler throws", () => {
    it(`should catch it and put ${getType(action.failure)}`, () => {
      testSaga(handleLoadMessageDetails, action.request({ id }))
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .throw(new Error("I made a boo-boo, sir!"))
        .put(
          action.failure({
            id,
            error: new Error("I made a boo-boo, sir!")
          })
        )
        .next()
        .isDone();
    });
  });
});
