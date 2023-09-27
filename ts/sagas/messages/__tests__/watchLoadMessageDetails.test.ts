import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";

import { loadMessageDetails as action } from "../../../store/actions/messages";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import {
  apiPayload,
  paymentValidInvalidAfterDueDate,
  successLoadMessageDetails
} from "../../../__mocks__/message";
import { testTryLoadMessageDetails } from "../watchLoadMessageDetails";
import { withRefreshApiCall } from "../../../features/fastLogin/saga/utils";

const tryLoadMessageDetails = testTryLoadMessageDetails!;

const id = paymentValidInvalidAfterDueDate.id as UIMessageId;

describe("tryReloadAllMessages", () => {
  const getMessagesPayload = { id };

  describe("when the response is successful", () => {
    it(`should put ${getType(
      action.success
    )} with the parsed messages and pagination data`, () => {
      const getMessage = jest.fn();
      testSaga(tryLoadMessageDetails(getMessage), action.request({ id }))
        .next()
        .call(
          withRefreshApiCall,
          getMessage(getMessagesPayload),
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
      const getMessage = jest.fn();
      testSaga(tryLoadMessageDetails(getMessage), action.request({ id }))
        .next()
        .call(
          withRefreshApiCall,
          getMessage(getMessagesPayload),
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
      const getMessage = jest.fn().mockImplementation(() => {
        throw new Error("I made a boo-boo, sir!");
      });

      testSaga(tryLoadMessageDetails(getMessage), action.request({ id }))
        .next()
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
