jest.mock("../../../common/analytics");
import * as E from "fp-ts/Either";
import { expectSaga, testSaga } from "redux-saga-test-plan";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { trackExportSucceeded } from "../../../common/analytics";
import { FimsHistoryClient } from "../../api/client";
import { fimsHistoryExport } from "../../store/actions";
import { handleExportFimsHistorySaga } from "../handleExportFimsHistorySaga";

describe("handleExportFimsHistorySaga", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });
  type ResponseType = Awaited<ReturnType<FimsHistoryClient["requestExport"]>>;
  const mockBearerToken = "mockBearerToken";
  const mockAction = fimsHistoryExport.request();

  it("should correctly pass the bearerToken to the client, dispatch success with payload 'SUCCESS' and track the export success when status is 202", () => {
    const response = E.right({ status: 202 }) as ResponseType;

    const resultPromise = Promise.resolve(response);
    const mockClient = jest.fn(() => resultPromise);
    testSaga(
      handleExportFimsHistorySaga,
      mockClient,
      mockBearerToken,
      mockAction
    )
      .next()
      .call(withRefreshApiCall, resultPromise, mockAction)
      .next(response)
      .put(fimsHistoryExport.success("SUCCESS"))
      .next()
      .isDone();

    expect(mockClient).toHaveBeenCalledWith({
      Bearer: `Bearer ${mockBearerToken}`
    });
    expect(trackExportSucceeded).toHaveBeenCalledTimes(1);
  });
  it('should dispatch success with payload "ALREADY_EXPORTING", but not track an export success when status is 409 ', () => {
    const response = E.right({ status: 409 }) as ResponseType;

    const resultPromise = Promise.resolve(response);
    const mockClient = jest.fn(() => resultPromise);
    testSaga(
      handleExportFimsHistorySaga,
      mockClient,
      mockBearerToken,
      mockAction
    )
      .next()
      .call(withRefreshApiCall, resultPromise, mockAction)
      .next(response)
      .put(fimsHistoryExport.success("ALREADY_EXPORTING"))
      .next()
      .isDone();
    expect(trackExportSucceeded).toHaveBeenCalledTimes(0);
  });
  it("should dispatch failure when status is anything else ", () => {
    const response = E.right({ status: 418 }) as ResponseType;

    const resultPromise = Promise.resolve(response);
    const mockClient = jest.fn(() => resultPromise);
    testSaga(
      handleExportFimsHistorySaga,
      mockClient,
      mockBearerToken,
      mockAction
    )
      .next()
      .call(withRefreshApiCall, resultPromise, mockAction)
      .next(response)
      .put(fimsHistoryExport.failure())
      .next()
      .isDone();
  });
  it("should dispatch failure when decoding fails", () => {
    const response = E.left({ status: 202 }) as ResponseType;

    const resultPromise = Promise.resolve(response);
    const mockClient = jest.fn(() => resultPromise);
    testSaga(
      handleExportFimsHistorySaga,
      mockClient,
      mockBearerToken,
      mockAction
    )
      .next()
      .call(withRefreshApiCall, resultPromise, mockAction)
      .next(response)
      .put(fimsHistoryExport.failure())
      .next()
      .isDone();
  });
  it("should dispatch failure when  promise is rejected", async () => {
    const response = E.right({ status: 202 }) as ResponseType;

    const resultPromise = Promise.reject(response);
    const mockClient = jest.fn(() => resultPromise);

    return expectSaga(
      handleExportFimsHistorySaga,
      mockClient,
      mockBearerToken,
      mockAction
    )
      .put(fimsHistoryExport.failure())
      .run();
  });
});
