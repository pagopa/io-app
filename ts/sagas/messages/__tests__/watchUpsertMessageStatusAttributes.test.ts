import { right } from "fp-ts/lib/Either";
import { getType } from "typesafe-actions";
import { testSaga } from "redux-saga-test-plan";

import {
  upsertMessageStatusAttributes as action,
  UpsertMessageStatusAttributesPayload
} from "../../../store/actions/messages";
import { testTryUpsertMessageStatusAttributes } from "../watchUpsertMessageStatusAttribues";

const tryUpsertMessageStatusAttributes = testTryUpsertMessageStatusAttributes!;

describe("tryUpsertMessageStatusAttributes", () => {
  const actionPayload: UpsertMessageStatusAttributesPayload = {
    id: "A",
    update: { tag: "bulk", isArchived: true },
    messageType: "unknown"
  };

  const callPayload = {
    id: "A",
    messageStatusChange: {
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
        .call(putMessage, callPayload)
        .next(right({ status: 200, value: {} }))
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
        .call(putMessage, callPayload)
        .next(
          right({
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
        .call(putMessage, callPayload)
        .next()
        .put(
          action.failure({
            error: new TypeError("Cannot read property 'fold' of undefined"),
            payload: actionPayload
          })
        )
        .next()
        .isDone();
    });
  });
});
