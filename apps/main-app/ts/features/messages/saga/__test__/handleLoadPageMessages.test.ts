import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import {
  loadNextPageMessages,
  loadPreviousPageMessages
} from "../../store/actions";
import {
  apiPayload,
  defaultRequestPayload,
  successLoadNextPageMessagesPayload,
  successLoadPreviousPageMessagesPayload
} from "../../__mocks__/messages";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { handleLoadPageMessages } from "../handleLoadPageMessages";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { getCommunicationClient } from "../commons";

jest.mock("../commons");

const mockGetMessages = jest.fn();

describe("handleLoadPageMessages", () => {
  const sessionToken = "mockSessionToken";

  describe("direction: next", () => {
    const action = loadNextPageMessages;
    const nextRequestPayload = {
      ...defaultRequestPayload,
      cursor: "nextCursor"
    };
    const getMessagesPayload = {
      enrich_result_data: true,
      page_size: nextRequestPayload.pageSize,
      maximum_id: nextRequestPayload.cursor,
      archived: nextRequestPayload.filter.getArchived
    };

    it("should return early without dispatching when sessionToken is undefined", () => {
      testSaga(handleLoadPageMessages, action.request(nextRequestPayload))
        .next()
        .select(sessionTokenSelector)
        .next(undefined)
        .isDone();
    });

    it(`should put ${getType(action.success)} with next pagination on success`, () => {
      testSaga(handleLoadPageMessages, action.request(nextRequestPayload))
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .call(getCommunicationClient, sessionToken)
        .next({ getUserMessages: mockGetMessages })
        .call(
          withRefreshApiCall,
          mockGetMessages(getMessagesPayload),
          action.request(nextRequestPayload)
        )
        .next(E.right({ status: 200, value: apiPayload }))
        .put(action.success(successLoadNextPageMessagesPayload))
        .next()
        .isDone();
    });

    it(`should put ${getType(action.failure)} on error response`, () => {
      testSaga(handleLoadPageMessages, action.request(nextRequestPayload))
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .call(getCommunicationClient, sessionToken)
        .next({ getUserMessages: mockGetMessages })
        .call(
          withRefreshApiCall,
          mockGetMessages(getMessagesPayload),
          action.request(nextRequestPayload)
        )
        .next(E.right({ status: 500, value: { title: "Backend error" } }))
        .put(
          action.failure({
            error: new Error("Response status code 500 Backend error"),
            filter: nextRequestPayload.filter
          })
        )
        .next()
        .isDone();
    });

    it(`should put ${getType(action.failure)} on thrown error`, () => {
      testSaga(handleLoadPageMessages, action.request(nextRequestPayload))
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .call(getCommunicationClient, sessionToken)
        .next({ getUserMessages: mockGetMessages })
        .throw(new Error("I made a boo-boo, sir!"))
        .put(
          action.failure({
            error: new Error("I made a boo-boo, sir!"),
            filter: nextRequestPayload.filter
          })
        )
        .next()
        .isDone();
    });
  });

  describe("direction: previous", () => {
    const action = loadPreviousPageMessages;
    const prevRequestPayload = {
      ...defaultRequestPayload,
      cursor: "previousCursor"
    };
    const getMessagesPayload = {
      enrich_result_data: true,
      page_size: prevRequestPayload.pageSize,
      minimum_id: prevRequestPayload.cursor,
      archived: prevRequestPayload.filter.getArchived
    };

    it("should return early without dispatching when sessionToken is undefined", () => {
      testSaga(handleLoadPageMessages, action.request(prevRequestPayload))
        .next()
        .select(sessionTokenSelector)
        .next(undefined)
        .isDone();
    });

    it(`should put ${getType(action.success)} with previous pagination on success`, () => {
      testSaga(handleLoadPageMessages, action.request(prevRequestPayload))
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .call(getCommunicationClient, sessionToken)
        .next({ getUserMessages: mockGetMessages })
        .call(
          withRefreshApiCall,
          mockGetMessages(getMessagesPayload),
          action.request(prevRequestPayload)
        )
        .next(E.right({ status: 200, value: apiPayload }))
        .put(action.success(successLoadPreviousPageMessagesPayload))
        .next()
        .isDone();
    });

    it(`should put ${getType(action.failure)} on error response`, () => {
      testSaga(handleLoadPageMessages, action.request(prevRequestPayload))
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .call(getCommunicationClient, sessionToken)
        .next({ getUserMessages: mockGetMessages })
        .call(
          withRefreshApiCall,
          mockGetMessages(getMessagesPayload),
          action.request(prevRequestPayload)
        )
        .next(E.right({ status: 500, value: { title: "Backend error" } }))
        .put(
          action.failure({
            error: new Error("Response status code 500 Backend error"),
            filter: prevRequestPayload.filter
          })
        )
        .next()
        .isDone();
    });

    it(`should put ${getType(action.failure)} on thrown error`, () => {
      testSaga(handleLoadPageMessages, action.request(prevRequestPayload))
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .call(getCommunicationClient, sessionToken)
        .next({ getUserMessages: mockGetMessages })
        .throw(new Error("I made a boo-boo, sir!"))
        .put(
          action.failure({
            error: new Error("I made a boo-boo, sir!"),
            filter: prevRequestPayload.filter
          })
        )
        .next()
        .isDone();
    });
  });
});
