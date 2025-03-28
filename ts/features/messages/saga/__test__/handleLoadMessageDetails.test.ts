import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";

import { loadMessageDetails as action } from "../../store/actions";
import { UIMessageId } from "../../types";
import {
  apiPayload,
  paymentValidInvalidAfterDueDate,
  successLoadMessageDetails
} from "../../__mocks__/message";
import { withRefreshApiCall } from "../../../identification/fastLogin/saga/utils";
import { handleLoadMessageDetails } from "../handleLoadMessageDetails";
import { BackendClient } from "../../../../api/__mocks__/backend";

const id = paymentValidInvalidAfterDueDate.id as UIMessageId;

describe("handleLoadMessageDetails", () => {
  const getMessagesPayload = { id };

  describe("when the response is successful", () => {
    it(`should put ${getType(
      action.success
    )} with the parsed messages and pagination data`, () => {
      testSaga(
        handleLoadMessageDetails,
        BackendClient.getMessage,
        action.request({ id })
      )
        .next()
        .call(
          withRefreshApiCall,
          BackendClient.getMessages(getMessagesPayload),
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
      testSaga(
        handleLoadMessageDetails,
        BackendClient.getMessage,
        action.request({ id })
      )
        .next()
        .call(
          withRefreshApiCall,
          BackendClient.getMessages(getMessagesPayload),
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
      testSaga(
        handleLoadMessageDetails,
        BackendClient.getMessage,
        action.request({ id })
      )
        .next()
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
