import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";

import {
  loadNextPageMessages as action,
  loadNextPageMessages
} from "../../../store/actions/messages";
import {
  apiPayload,
  defaultRequestPayload,
  successLoadNextPageMessagesPayload
} from "../../../__mocks__/messages";
import { testTryLoadNextPageMessages } from "../watchLoadNextPageMessages";
import { withRefreshApiCall } from "../../../features/fastLogin/saga/utils";

const tryLoadNextPageMessages = testTryLoadNextPageMessages!;

describe("tryLoadNextPageMessages", () => {
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
      const getMessages = jest.fn();
      testSaga(
        tryLoadNextPageMessages(getMessages),
        action.request(defaultRequestPayload)
      )
        .next()
        .call(
          withRefreshApiCall,
          getMessages(getMessagesPayload),
          loadNextPageMessages.request(defaultRequestPayload)
        )
        .next(E.right({ status: 200, value: apiPayload }))
        .put(action.success(successLoadNextPageMessagesPayload))
        .next()
        .isDone();
    });
  });

  describe("when the response is an Error", () => {
    it(`should put ${getType(action.failure)} with the error message`, () => {
      const getMessages = jest.fn();
      testSaga(
        tryLoadNextPageMessages(getMessages),
        action.request(defaultRequestPayload)
      )
        .next()
        .call(
          withRefreshApiCall,
          getMessages(getMessagesPayload),
          loadNextPageMessages.request(defaultRequestPayload)
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
      const getMessages = () => {
        throw new Error("I made a boo-boo, sir!");
      };
      testSaga(
        tryLoadNextPageMessages(getMessages),
        action.request(defaultRequestPayload)
      )
        .next()
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
