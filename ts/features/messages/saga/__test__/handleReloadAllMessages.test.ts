import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";

import { reloadAllMessages as action } from "../../store/actions";
import {
  apiPayload,
  defaultRequestError,
  defaultRequestPayload,
  successReloadMessagesPayload
} from "../../__mocks__/messages";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { handleReloadAllMessages } from "../handleReloadAllMessages";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { getCommunicationClient } from "../../utils/client";

jest.mock("../../utils/client");

const mockGetMessages = jest.fn();

describe("handleReloadAllMessages", () => {
  const sessionToken = "mockedSessionToken";

  const getMessagesPayload = {
    enrich_result_data: true,
    page_size: defaultRequestPayload.pageSize,
    archived: defaultRequestPayload.filter.getArchived
  };

  describe("when the response is successful", () => {
    it(`should put ${getType(
      action.success
    )} with the parsed messages and pagination data`, () => {
      testSaga(handleReloadAllMessages, action.request(defaultRequestPayload))
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .call(getCommunicationClient, sessionToken)
        .next({ getUserMessages: mockGetMessages })
        .call(
          withRefreshApiCall,
          mockGetMessages(getMessagesPayload),
          action.request(defaultRequestPayload)
        )
        .next(E.right({ status: 200, value: apiPayload }))
        .put(action.success(successReloadMessagesPayload))
        .next()
        .isDone();
    });
  });

  describe("when the response is an Error", () => {
    it(`should put ${getType(action.failure)} with the error message`, () => {
      testSaga(handleReloadAllMessages, action.request(defaultRequestPayload))
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .call(getCommunicationClient, sessionToken)
        .next({ getUserMessages: mockGetMessages })
        .call(
          withRefreshApiCall,
          mockGetMessages(getMessagesPayload),
          action.request(defaultRequestPayload)
        )
        .next(
          E.right({
            status: 500,
            value: { title: defaultRequestError.error.message }
          })
        )
        .put(
          action.failure({
            error: new Error(
              `Response status code 500 ${defaultRequestError.error.message}`
            ),
            filter: defaultRequestPayload.filter
          })
        )
        .next()
        .isDone();
    });
  });

  describe("when the handler throws", () => {
    it(`should catch it and put ${getType(action.failure)}`, () => {
      testSaga(handleReloadAllMessages, action.request(defaultRequestPayload))
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .call(getCommunicationClient, sessionToken)
        .next({ getUserMessages: mockGetMessages })
        .throw(new Error(defaultRequestError.error.message))
        .put(
          action.failure({
            error: new Error(defaultRequestError.error.message),
            filter: defaultRequestPayload.filter
          })
        )
        .next()
        .isDone();
    });
  });
});
