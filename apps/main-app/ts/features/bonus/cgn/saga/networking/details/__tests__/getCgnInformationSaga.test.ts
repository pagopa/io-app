import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { testSaga } from "redux-saga-test-plan";

import { Card } from "../../../../../../../../definitions/cgn/Card";
import { getGenericError } from "../../../../../../../utils/errors";
import { walletAddCards } from "../../../../../../wallet/store/actions/cards";
import { cgnDetails } from "../../../../store/actions/details";
import { cgnGetInformationSaga } from "../getCgnInformationSaga";

const card = {
  activation_date: new Date("2024-01-01"),
  expiration_date: new Date("2024-12-31"),
  status: "ACTIVATED"
} as Card;

const expiredCard = {
  activation_date: new Date("2024-01-01"),
  expiration_date: new Date("2024-12-31"),
  status: "EXPIRED"
} as Card;

describe("cgnGetInformationSaga", () => {
  const request = cgnDetails.request();
  const getInfoRequest = jest.fn();

  it(`should dispatch success on 200 response`, () => {
    testSaga(cgnGetInformationSaga, getInfoRequest, request)
      .next()
      .next({
        _tag: "Right",
        right: {
          status: 200,
          value: card
        }
      })
      .put(
        walletAddCards([
          {
            type: "cgn",
            category: "cgn",
            key: "cgn_card",
            expireDate: new Date("2024-12-31")
          }
        ])
      )
      .next()
      .put(cgnDetails.success(card))
      .next()
      .isDone();
  });

  it(`should dispatch success on 200 response with non activated card`, () => {
    testSaga(cgnGetInformationSaga, getInfoRequest, request)
      .next()
      .next({
        _tag: "Right",
        right: {
          status: 200,
          value: expiredCard
        }
      })
      .put(
        walletAddCards([
          {
            type: "cgn",
            category: "cgn",
            key: "cgn_card",
            expireDate: undefined
          }
        ])
      )
      .next()
      .put(cgnDetails.success(expiredCard))
      .next()
      .isDone();
  });

  it("should dispatch failure action on API error", () => {
    const leftResponse = { _tag: "Left", left: [] };
    const expectedError = new Error(readableReport([]));

    testSaga(cgnGetInformationSaga, getInfoRequest, request)
      .next()
      .next(leftResponse)
      .put(cgnDetails.failure(getGenericError(expectedError)))
      .next()
      .isDone();
  });

  it("should cancel on 404 status", () => {
    testSaga(cgnGetInformationSaga, getInfoRequest, request)
      .next()
      .next({ _tag: "Right", right: { status: 404 } })
      .put(cgnDetails.cancel())
      .next()
      .isDone();
  });

  it("should throw an error on network failure", () => {
    const networkError = new Error("Network error");

    testSaga(cgnGetInformationSaga, getInfoRequest, request)
      .next()
      .throw(networkError)
      .put(cgnDetails.failure(getGenericError(networkError)))
      .next()
      .isDone();
  });

  it("should throw an error if API returns unexpected status", () => {
    const unexpectedStatus = 500;
    testSaga(cgnGetInformationSaga, getInfoRequest, request)
      .next()
      .next({ _tag: "Right", right: { status: unexpectedStatus } })
      .put(
        cgnDetails.failure(
          getGenericError(new Error(`response status ${unexpectedStatus}`))
        )
      )
      .next()
      .isDone();
  });
});
