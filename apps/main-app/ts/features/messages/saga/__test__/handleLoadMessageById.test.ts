import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";

import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { paymentValidInvalidAfterDueDate } from "../../__mocks__/message";
import {
  trackUndefinedBearerToken,
  UndefinedBearerTokenPhase
} from "../../analytics";
import { loadMessageById as action } from "../../store/actions";
import { toUIMessage } from "../../store/reducers/transformers";
import { getCommunicationClient } from "../commons";
import { handleLoadMessageById } from "../handleLoadMessageById";

jest.mock("../commons");

const mockGetUserMessage = jest.fn();

describe("handleLoadMessageById", () => {
  const id = paymentValidInvalidAfterDueDate.id;
  const sessionToken = "mockSessionToken";
  const requestAction = action.request({ id });
  const getMessagePayload = { id, public_message: true };

  describe("when sessionToken is undefined", () => {
    it("should call trackUndefinedBearerToken and return early without dispatching", () => {
      testSaga(handleLoadMessageById, requestAction)
        .next()
        .select(sessionTokenSelector)
        .next(undefined)
        .call(
          trackUndefinedBearerToken,
          UndefinedBearerTokenPhase.messageByIdLoading
        )
        .next()
        .isDone();
    });
  });

  describe("when the API returns 200", () => {
    it(`should put ${getType(action.success)} with the transformed message`, () => {
      testSaga(handleLoadMessageById, requestAction)
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .call(getCommunicationClient, sessionToken)
        .next({ getUserMessage: mockGetUserMessage })
        .call(
          withRefreshApiCall,
          mockGetUserMessage(getMessagePayload),
          requestAction
        )
        .next(E.right({ status: 200, value: paymentValidInvalidAfterDueDate }))
        .next(action.success(toUIMessage(paymentValidInvalidAfterDueDate)))
        .put(action.success(toUIMessage(paymentValidInvalidAfterDueDate)))
        .next()
        .isDone();
    });
  });

  describe("when the API returns 404", () => {
    it(`should put ${getType(
      action.failure
    )} with kind: "messageNotFound"`, () => {
      testSaga(handleLoadMessageById, requestAction)
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .call(getCommunicationClient, sessionToken)
        .next({ getUserMessage: mockGetUserMessage })
        .call(
          withRefreshApiCall,
          mockGetUserMessage(getMessagePayload),
          requestAction
        )
        .next(E.right({ status: 404, value: { title: "Not found" } }))
        .next(
          action.failure({
            id,
            error: new Error("Response status code 404 Not found"),
            kind: "messageNotFound"
          })
        )
        .put(
          action.failure({
            id,
            error: new Error("Response status code 404 Not found"),
            kind: "messageNotFound"
          })
        )
        .next()
        .isDone();
    });
  });

  describe("when the API returns a non-404 error status (e.g. 500)", () => {
    it(`should put ${getType(
      action.failure
    )} with kind: "generic" and track the failure`, () => {
      testSaga(handleLoadMessageById, requestAction)
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .call(getCommunicationClient, sessionToken)
        .next({ getUserMessage: mockGetUserMessage })
        .call(
          withRefreshApiCall,
          mockGetUserMessage(getMessagePayload),
          requestAction
        )
        .next(E.right({ status: 500, value: { title: "Backend error" } }))
        .next(
          action.failure({
            id,
            error: new Error("Response status code 500 Backend error"),
            kind: "generic"
          })
        )
        .put(
          action.failure({
            id,
            error: new Error("Response status code 500 Backend error"),
            kind: "generic"
          })
        )
        .next()
        .isDone();
    });
  });

  describe("when an exception is thrown", () => {
    it(`should catch it and put ${getType(
      action.failure
    )} with kind: "generic" and track the failure`, () => {
      testSaga(handleLoadMessageById, requestAction)
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .call(getCommunicationClient, sessionToken)
        .next({ getUserMessage: mockGetUserMessage })
        .throw(new Error("Network error"))
        .put(
          action.failure({
            id,
            error: new Error("Network error"),
            kind: "generic"
          })
        )
        .next()
        .isDone();
    });
  });
});
