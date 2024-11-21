import {
  fimsHistoryExport,
  fimsHistoryGet,
  resetFimsHistoryExportState,
  resetFimsHistoryState
} from "..";
import { Access } from "../../../../../../../definitions/fims_history/Access";
import { FimsExportSuccessStates } from "../../reducer";

describe("fimsHistoryGet.request", () => {
  [undefined, "01JBVCKDNW4Y2YMACBP56H9E2Z"].forEach(continuationToken =>
    [undefined, false, true].forEach(shouldReloadFromScratch => {
      it("Should have a type of 'FIMS_GET_HISTORY_REQUEST' and match expected 'continuationToken' and 'shouldReloadFromScratch' payload", () => {
        const fimsHistoryGetRequest = fimsHistoryGet.request({
          continuationToken,
          shouldReloadFromScratch
        });
        expect(fimsHistoryGetRequest.type).toBe("FIMS_GET_HISTORY_REQUEST");
        expect(fimsHistoryGetRequest.payload).toEqual({
          continuationToken,
          shouldReloadFromScratch
        });
      });
    })
  );
});

describe("fimsHistoryGet.success", () => {
  (
    [[], [{}, {}, {}]] as unknown as ReadonlyArray<ReadonlyArray<Access>>
  ).forEach(data =>
    [undefined, "01JBVCKDNW4Y2YMACBP56H9E2Z"].forEach(next => {
      it("Should have a type of 'FIMS_GET_HISTORY_SUCCESS' and match expected 'items' and 'continuationToken' payload", () => {
        const fimsHistoryGetSuccess = fimsHistoryGet.success({
          data,
          next
        });
        expect(fimsHistoryGetSuccess.type).toBe("FIMS_GET_HISTORY_SUCCESS");
        expect(fimsHistoryGetSuccess.payload).toEqual({
          data,
          next
        });
      });
    })
  );
});

describe("fimsHistoryGet.failure", () => {
  it("Should have a type of 'FIMS_GET_HISTORY_FAILURE' and match expected string input payload", () => {
    const failureReason = "A random reason";
    const fimsHistoryGetFailure = fimsHistoryGet.failure(failureReason);
    expect(fimsHistoryGetFailure.type).toBe("FIMS_GET_HISTORY_FAILURE");
    expect(fimsHistoryGetFailure.payload).toBe(failureReason);
  });
});

describe("fimsHistoryExport.request", () => {
  it("Should have a type of 'FIMS_HISTORY_EXPORT_REQUEST' and no payload", () => {
    const fimsHistoryExportRequest = fimsHistoryExport.request();
    expect(fimsHistoryExportRequest.type).toBe("FIMS_HISTORY_EXPORT_REQUEST");
    expect(fimsHistoryExportRequest.payload).toBeUndefined();
  });
});

describe("fimsHistoryExport.success", () =>
  (
    [
      "SUCCESS",
      "ALREADY_EXPORTING"
    ] as unknown as ReadonlyArray<FimsExportSuccessStates>
  ).forEach(successState => {
    it("Should have a type of 'FIMS_HISTORY_EXPORT_SUCCESS' and expected value for input 'FimsExportSuccessStates' payload", () => {
      const fimsHistoryExportSuccess = fimsHistoryExport.success(successState);
      expect(fimsHistoryExportSuccess.type).toBe("FIMS_HISTORY_EXPORT_SUCCESS");
      expect(fimsHistoryExportSuccess.payload).toBe(successState);
    });
  }));

describe("fimsHistoryExport.failure", () => {
  it("Should have a type of 'FIMS_HISTORY_EXPORT_FAILURE' and no payload", () => {
    const fimsHistoryExportFailure = fimsHistoryExport.failure();
    expect(fimsHistoryExportFailure.type).toBe("FIMS_HISTORY_EXPORT_FAILURE");
    expect(fimsHistoryExportFailure.payload).toBeUndefined();
  });
});

describe("resetFimsHistoryState", () => {
  it("Should have a type of 'RESET_FIMS_HISTORY_STATE'", () => {
    const resetFimsHistory = resetFimsHistoryState();
    expect(resetFimsHistory.type).toBe("RESET_FIMS_HISTORY_STATE");
    expect(resetFimsHistory.payload).toBeUndefined();
  });
});

describe("resetFimsHistoryExportState", () => {
  it("Should have a type of 'RESET_FIMS_HISTORY'", () => {
    const resetFimsHistoryExport = resetFimsHistoryExportState();
    expect(resetFimsHistoryExport.type).toBe("RESET_FIMS_HISTORY");
    expect(resetFimsHistoryExport.payload).toBeUndefined();
  });
});
