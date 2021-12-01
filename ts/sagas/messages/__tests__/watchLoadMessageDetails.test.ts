import { right } from "fp-ts/lib/Either";
import { getType } from "typesafe-actions";
import { testSaga } from "redux-saga-test-plan";

import { loadMessageDetails as action } from "../../../store/actions/messages";
import { testTryLoadMessageDetails } from "../watchLoadMessageDetails";
import {
  apiPayload,
  paymentValidInvalidAfterDueDate,
  successLoadMessageDetails
} from "../../../__mocks__/message";

const tryLoadMessageDetails = testTryLoadMessageDetails!;

const id = paymentValidInvalidAfterDueDate.id;

describe("tryReloadAllMessages", () => {
  const getMessagesPayload = { id };

  describe("when the response is successful", () => {
    it(`should put ${getType(
      action.success
    )} with the parsed messages and pagination data`, () => {
      const getMessage = jest.fn();
      testSaga(tryLoadMessageDetails(getMessage), action.request({ id }))
        .next()
        .call(getMessage, getMessagesPayload)
        .next(right({ status: 200, value: apiPayload }))
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
        .call(getMessage, getMessagesPayload)
        .next(right({ status: 500, value: { title: "Backend error" } }))
        .put(action.failure({ id, error: Error("Backend error") }))
        .next()
        .isDone();
    });
  });

  describe("when the handler throws", () => {
    it(`should catch it and put ${getType(action.failure)}`, () => {
      const getMessage = () => {
        throw new Error("I made a boo-boo, sir!");
      };
      testSaga(tryLoadMessageDetails(getMessage), action.request({ id }))
        .next()
        .call(getMessage, getMessagesPayload)
        .next()
        .put(
          action.failure({
            id,
            error: TypeError("Cannot read property 'fold' of undefined")
          })
        )
        .next()
        .isDone();
    });
  });
});
