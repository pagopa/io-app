import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import {
  upsertMessageStatusAttributes as action,
  UpsertMessageStatusAttributesPayload
} from "../../store/actions";
import { UIMessageId } from "../../types";
import { successReloadMessagesPayload } from "../../__mocks__/messages";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { handleUpsertMessageStatusAttributes } from "../handleUpsertMessageStatusAttributes";
import { BackendClient } from "../../../../api/__mocks__/backend";

describe("handleUpsertMessageStatusAttributes", () => {
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
      testSaga(
        handleUpsertMessageStatusAttributes,
        BackendClient.upsertMessageStatusAttributes,
        action.request(actionPayload)
      )
        .next()
        .call(
          withRefreshApiCall,
          BackendClient.upsertMessageStatusAttributes(callPayload),
          action.request(actionPayload)
        )
        .next(E.right({ status: 200, value: {} }))
        .put(action.success(actionPayload))
        .next()
        .cancelled()
        .next(false)
        .isDone();
    });
  });

  describe("when the response is an Error", () => {
    it(`should put ${getType(action.failure)} with the error message`, () => {
      testSaga(
        handleUpsertMessageStatusAttributes,
        BackendClient.upsertMessageStatusAttributes,
        action.request(actionPayload)
      )
        .next()
        .call(
          withRefreshApiCall,
          BackendClient.upsertMessageStatusAttributes(callPayload),
          action.request(actionPayload)
        )
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
        .cancelled()
        .next(false)
        .isDone();
    });
  });

  describe("when the handler throws", () => {
    it(`should catch it and put ${getType(action.failure)}`, () => {
      testSaga(
        handleUpsertMessageStatusAttributes,
        BackendClient.upsertMessageStatusAttributes,
        action.request(actionPayload)
      )
        .next()
        .throw(new Error("462e5dffdb46435995d545999bed6b11"))
        .put(
          action.failure({
            error: new Error("462e5dffdb46435995d545999bed6b11"),
            payload: actionPayload
          })
        )
        .next()
        .cancelled()
        .next(false)
        .isDone();
    });
  });
});
