import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";

import {
  loadNextPageMessages,
  loadPreviousPageMessages,
  reloadAllMessages,
  upsertMessageStatusAttributes as action,
  UpsertMessageStatusAttributesPayload
} from "../../../store/actions/messages";
import { isLoadingOrUpdatingInbox } from "../../../store/reducers/entities/messages/allPaginated";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import { successReloadMessagesPayload } from "../../../__mocks__/messages";
import {
  testTryUpsertMessageStatusAttributes,
  testWaitForInboxLoadingOrUpdating
} from "../watchUpsertMessageStatusAttribues";

const tryUpsertMessageStatusAttributes = testTryUpsertMessageStatusAttributes!;
const waitForInboxLoadingOrUpdating = testWaitForInboxLoadingOrUpdating!;

describe("tryUpsertMessageStatusAttributes", () => {
  const actionPayload: UpsertMessageStatusAttributesPayload = {
    message: {
      ...successReloadMessagesPayload.messages[0],
      id: "A" as UIMessageId
    },
    update: { tag: "bulk", isArchived: true }
  };

  const callPayload = {
    id: "A",
    body: {
      change_type: "bulk",
      is_archived: true,
      is_read: true
    }
  };

  describe("when the response is successful", () => {
    it(`should put ${getType(
      action.success
    )} with the original payload`, () => {
      const putMessage = jest.fn();
      testSaga(
        tryUpsertMessageStatusAttributes(putMessage),
        action.request(actionPayload)
      )
        .next()
        .call(waitForInboxLoadingOrUpdating)
        .next()
        .call(putMessage, callPayload)
        .next(E.right({ status: 200, value: {} }))
        .put(action.success(actionPayload))
        .next()
        .isDone();
    });
  });

  describe("when the response is an Error", () => {
    it(`should put ${getType(action.failure)} with the error message`, () => {
      const putMessage = jest.fn();
      testSaga(
        tryUpsertMessageStatusAttributes(putMessage),
        action.request(actionPayload)
      )
        .next()
        .call(waitForInboxLoadingOrUpdating)
        .next()
        .call(putMessage, callPayload)
        .next(
          E.right({
            status: 500,
            value: { title: "462e5dffdb46435995d545999bed6b11" }
          })
        )
        .put(
          action.failure({
            error: new Error("462e5dffdb46435995d545999bed6b11"),
            payload: actionPayload
          })
        )
        .next()
        .isDone();
    });
  });

  describe("when the handler throws", () => {
    it(`should catch it and put ${getType(action.failure)}`, () => {
      const putMessage = () => {
        throw new Error("462e5dffdb46435995d545999bed6b11");
      };
      testSaga(
        tryUpsertMessageStatusAttributes(putMessage),
        action.request(actionPayload)
      )
        .next()
        .call(waitForInboxLoadingOrUpdating)
        .next()
        .call(putMessage, callPayload)
        .next()
        .put(
          action.failure({
            error: new Error("Response is undefined"),
            payload: actionPayload
          })
        )
        .next()
        .isDone();
    });
  });

  describe("waitForInboxLoadingOrUpdating", () => {
    it("is done if inbox is not loading nor updating", () => {
      testSaga(waitForInboxLoadingOrUpdating)
        .next()
        .select(isLoadingOrUpdatingInbox)
        .next(false)
        .isDone();
    });
  });

  describe("waitForInboxLoadingOrUpdating", () => {
    it("listens for inbox actions if inbox is loading or updating", () => {
      testSaga(waitForInboxLoadingOrUpdating)
        .next()
        .select(isLoadingOrUpdatingInbox)
        .next(true)
        .take([
          loadPreviousPageMessages.failure,
          loadPreviousPageMessages.success,
          loadNextPageMessages.failure,
          loadNextPageMessages.success,
          reloadAllMessages.failure,
          reloadAllMessages.success
        ])
        .next()
        .select(isLoadingOrUpdatingInbox)
        .next(true);
    });
  });

  describe("waitForInboxLoadingOrUpdating", () => {
    it("is done if inbox is not loading nor updating, after listening for inbox actions", () => {
      testSaga(waitForInboxLoadingOrUpdating)
        .next()
        .select(isLoadingOrUpdatingInbox)
        .next(true)
        .take([
          loadPreviousPageMessages.failure,
          loadPreviousPageMessages.success,
          loadNextPageMessages.failure,
          loadNextPageMessages.success,
          reloadAllMessages.failure,
          reloadAllMessages.success
        ])
        .next()
        .select(isLoadingOrUpdatingInbox)
        .next(false)
        .isDone();
    });
  });
});
