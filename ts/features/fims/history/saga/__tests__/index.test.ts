import { testSaga } from "redux-saga-test-plan";
import { watchFimsHistorySaga } from "..";
import * as HANDLE_GET from "../handleGetFimsHistorySaga";
import { createFimsClient } from "../../api/client";
import { fimsHistoryExport, fimsHistoryGet } from "../../store/actions";
import { handleExportFimsHistorySaga } from "../handleExportFimsHistorySaga";

const apiUrlPrefix = "mock-api-url-prefix";
jest.mock("../../../../../config", () => ({
  apiUrlPrefix
}));

describe("watchFimsHistorySaga", () => {
  it("should handle fimsHistoryGet and fimsHistoryExport actions", () => {
    const mockClient = {
      getAccessHistory: jest.fn(),
      requestExport: jest.fn()
    };
    const mockBearerToken = "mockBearerToken";

    testSaga(watchFimsHistorySaga, mockBearerToken)
      .next()
      .call(createFimsClient, apiUrlPrefix)
      .next(mockClient)
      .takeLatest(
        fimsHistoryGet.request,
        HANDLE_GET.handleGetFimsHistorySaga,
        mockClient.getAccessHistory,
        mockBearerToken
      )
      .next()
      .takeLatest(
        fimsHistoryExport.request,
        handleExportFimsHistorySaga,
        mockClient.requestExport,
        mockBearerToken
      )
      .next()
      .isDone();
  });
});
