import * as E from "fp-ts/Either";
import { testSaga } from "redux-saga-test-plan";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { FimsHistoryClient } from "../../api/client";
import { fimsHistoryExport } from "../../store/actions";
import { handleExportFimsHistorySaga } from "../handleExportFimsHistorySaga";

type ResponseType = Awaited<ReturnType<FimsHistoryClient["requestExport"]>>;

const mockBearerToken = "mockBearerToken";
const mockAction = fimsHistoryExport.request();
const decodedSuccessResponse = {
  status: 200
};

const successResponse = E.right(decodedSuccessResponse) as ResponseType;
const resultPromiseSuccess = Promise.resolve(successResponse);
const mockSuccessClient = jest.fn(() => resultPromiseSuccess);

describe("handleExportFimsHistorySaga", () => {
  it("should dispatch success when status is 202", () => {
    testSaga(
      handleExportFimsHistorySaga,
      mockSuccessClient,
      mockBearerToken,
      mockAction
    )
      .next()
      .call(withRefreshApiCall, resultPromiseSuccess, mockAction)
      .next(E.right({ status: 202 }))
      .put(fimsHistoryExport.success("SUCCESS"))
      .next()
      .isDone();
  });
});
