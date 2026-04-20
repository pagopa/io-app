import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { cgnUnsubscriptionHandler } from "..";
import { getGenericError } from "../../../../../../../utils/errors";
import { cgnUnsubscribe } from "../../../../store/actions/unsubscribe";
import { walletRemoveCardsByType } from "../../../../../../wallet/store/actions/cards";

describe("cgnUnsubscriptionHandler", () => {
  const request = cgnUnsubscribe.request();
  const unsubscribeRequest = jest.fn();

  [201, 202].forEach(status => {
    it(`should dispatch success on ${status} response`, () => {
      testSaga(cgnUnsubscriptionHandler, unsubscribeRequest, request)
        .next()
        .next(E.right({ status }))
        .put(walletRemoveCardsByType("cgn"))
        .next()
        .put(cgnUnsubscribe.success())
        .next()
        .isDone();
    });
  });

  it("should dispatch failure action on API error", () => {
    const leftResponse = E.left([]);
    const expectedError = new Error(readableReport([]));

    testSaga(cgnUnsubscriptionHandler, unsubscribeRequest, request)
      .next()
      .next(leftResponse)
      .put(cgnUnsubscribe.failure(getGenericError(expectedError)))
      .next()
      .isDone();
  });

  it("should not dispatch success or failure on 401 response", () => {
    testSaga(cgnUnsubscriptionHandler, unsubscribeRequest, request)
      .next()
      .next(E.right({ status: 401 }))
      .next()
      .isDone();
  });

  it("should throw an error on network failure", () => {
    const networkError = new Error("Network error");

    testSaga(cgnUnsubscriptionHandler, unsubscribeRequest, request)
      .next()
      .throw(networkError)
      .put(cgnUnsubscribe.failure(getGenericError(networkError)))
      .next()
      .isDone();
  });
});
