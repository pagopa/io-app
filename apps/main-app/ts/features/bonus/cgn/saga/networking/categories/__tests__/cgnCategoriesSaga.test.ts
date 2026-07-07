import { testSaga } from "redux-saga-test-plan";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { getGenericError } from "../../../../../../../utils/errors";
import { cgnCategories } from "../../../../store/actions/categories";
import { cgnCategoriesSaga } from "../cgnCategoriesSaga";

describe("cgnCategoriesSaga", () => {
  const request = cgnCategories.request();
  const cgnCategoriesRequest = jest.fn();

  it(`should dispatch success on 200 response`, () => {
    testSaga(cgnCategoriesSaga, cgnCategoriesRequest, request)
      .next()
      .next({ _tag: "Right", right: { status: 200, value: { items: [] } } })
      .put(cgnCategories.success([]))
      .next()
      .isDone();
  });

  it("should dispatch failure action on API error", () => {
    const leftResponse = { _tag: "Left", left: [] };
    const expectedError = new Error(readableReport([]));

    testSaga(cgnCategoriesSaga, cgnCategoriesRequest, request)
      .next()
      .next(leftResponse)
      .put(cgnCategories.failure(getGenericError(expectedError)))
      .next()
      .isDone();
  });

  it("should do nothing if status is 401", () => {
    testSaga(cgnCategoriesSaga, cgnCategoriesRequest, request)
      .next()
      .next({ _tag: "Right", right: { status: 401 } })
      .next()
      .isDone();
  });

  it("should throw an error on network failure", () => {
    const networkError = new Error("Network error");

    testSaga(cgnCategoriesSaga, cgnCategoriesRequest, request)
      .next()
      .throw(networkError)
      .put(cgnCategories.failure(getGenericError(networkError)))
      .next()
      .isDone();
  });

  it("should throw an error if API returns unexpected data", () => {
    const unexpectedData = {
      status: 200,
      value: { items: [{ id: "1", name: "Category 1" }] }
    };
    testSaga(cgnCategoriesSaga, cgnCategoriesRequest, request)
      .next()
      .next({ _tag: "Right", right: unexpectedData })
      .put(
        cgnCategories.failure(
          getGenericError(
            new Error(
              `Expected a ProductCategoryWithNewDiscountsCount but received PublishedProductCategories`
            )
          )
        )
      )
      .next()
      .isDone();
  });

  it("should throw an error if API returns unexpected status", () => {
    const unexpectedStatus = 500;
    testSaga(cgnCategoriesSaga, cgnCategoriesRequest, request)
      .next()
      .next({ _tag: "Right", right: { status: unexpectedStatus } })
      .put(
        cgnCategories.failure(
          getGenericError(new Error(`Response in status ${unexpectedStatus}`))
        )
      )
      .next()
      .isDone();
  });
});
