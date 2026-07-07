import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { testSaga } from "redux-saga-test-plan";
import { OfflineMerchants } from "../../../../../../../../definitions/cgn/merchants/OfflineMerchants";
import { getGenericError } from "../../../../../../../utils/errors";
import { cgnOfflineMerchants } from "../../../../store/actions/merchants";
import { cgnOfflineMerchantsSaga } from "../cgnOfflineMerchantsSaga";

const items: OfflineMerchants["items"] = [
  {
    id: "merchant-id" as NonEmptyString,
    name: "merchant-name" as NonEmptyString,
    productCategories: [],
    address: {
      full_address: "aaa" as NonEmptyString
    },
    newDiscounts: false
  }
];

describe("cgnOfflineMerchantsSaga", () => {
  const requestAction = cgnOfflineMerchants.request(
    "merchant-id" as NonEmptyString
  );
  const getOfflineMerchants = jest.fn();

  it("should dispatch success action on successful API call", () => {
    testSaga(cgnOfflineMerchantsSaga, getOfflineMerchants, requestAction)
      .next()
      .next({ _tag: "Right", right: { status: 200, value: { items } } })
      .put(cgnOfflineMerchants.success(items))
      .next()
      .isDone();
  });

  it("should dispatch failure action on API error", () => {
    const leftResponse = { _tag: "Left", left: [] };
    const expectedError = new Error(readableReport([]));

    testSaga(cgnOfflineMerchantsSaga, getOfflineMerchants, requestAction)
      .next()
      .next(leftResponse)
      .put(cgnOfflineMerchants.failure(getGenericError(expectedError)))
      .next()
      .isDone();
  });

  it("should not dispatch success or failure on 401 response", () => {
    testSaga(cgnOfflineMerchantsSaga, getOfflineMerchants, requestAction)
      .next()
      .next({ _tag: "Right", right: { status: 401 } })
      .next()
      .isDone();
  });

  it("should throw an error on network failure", () => {
    const networkError = new Error("Network error");

    testSaga(cgnOfflineMerchantsSaga, getOfflineMerchants, requestAction)
      .next()
      .throw(networkError)
      .put(cgnOfflineMerchants.failure(getGenericError(networkError)))
      .next()
      .isDone();
  });

  it("should throw an error if API returns unexpected status", () => {
    const unexpectedStatus = 500;
    testSaga(cgnOfflineMerchantsSaga, getOfflineMerchants, requestAction)
      .next()
      .next({ _tag: "Right", right: { status: unexpectedStatus } })
      .put(
        cgnOfflineMerchants.failure(
          getGenericError(new Error(`Response in status ${unexpectedStatus}`))
        )
      )
      .next()
      .isDone();
  });
});
