import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";

import { reloadAllMessages as action } from "../../../store/actions/messages";
import {
  apiPayload,
  defaultRequestError,
  defaultRequestPayload,
  successReloadMessagesPayload
} from "../../../__mocks__/messages";
import { testTryLoadPreviousPageMessages } from "../watchReloadAllMessages";
import { withRefreshApiCall } from "../../../features/fastLogin/saga/utils";

const tryReloadAllMessages = testTryLoadPreviousPageMessages!;

describe("tryReloadAllMessages", () => {
  const getMessagesPayload = {
    enrich_result_data: true,
    page_size: defaultRequestPayload.pageSize,
    archived: defaultRequestPayload.filter.getArchived
  };

  describe("when the response is successful", () => {
    it(`should put ${getType(
      action.success
    )} with the parsed messages and pagination data`, () => {
      const getMessages = jest.fn();
      testSaga(
        tryReloadAllMessages(getMessages),
        action.request(defaultRequestPayload)
      )
        .next()
        .call(
          withRefreshApiCall,
          getMessages(getMessagesPayload),
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
      const getMessages = jest.fn();
      testSaga(
        tryReloadAllMessages(getMessages),
        action.request(defaultRequestPayload)
      )
        .next()
        .call(
          withRefreshApiCall,
          getMessages(getMessagesPayload),
          action.request(defaultRequestPayload)
        )
        .next(
          E.right({
            status: 500,
            value: { title: defaultRequestError.error.message }
          })
        )
        .put(action.failure(defaultRequestError))
        .next()
        .isDone();
    });
  });

  describe("when the handler throws", () => {
    it(`should catch it and put ${getType(action.failure)}`, () => {
      const getMessages = () => {
        throw new Error(defaultRequestError.error.message);
      };
      testSaga(
        tryReloadAllMessages(getMessages),
        action.request(defaultRequestPayload)
      )
        .next()
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
