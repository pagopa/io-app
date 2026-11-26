import { CieManager, CieUtils } from "@io-app/expo-cie";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";

import { convertUnknownToError } from "../../../../../../utils/errors";
import { startTimer } from "../../../../../../utils/timer";
import { cieIsSupported, nfcIsEnabled } from "../../store/actions";
import {
  checkCieAvailabilitySaga,
  checkNfcEnablementSaga,
  stopCieManager,
  watchCieAuthenticationSaga
} from "../cie";

jest.mock("@io-app/expo-cie", () => ({
  CieManager: { stopReading: jest.fn() },
  CieUtils: {
    isCieAuthenticationSupported: jest.fn(),
    isNfcEnabled: jest.fn()
  }
}));

jest.mock("../../../../../../utils/timer", () => ({
  startTimer: jest.fn(() => Promise.resolve())
}));

describe("CIE saga", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkCieAvailabilitySaga", () => {
    it("should dispatch success", () => {
      (
        CieUtils.isCieAuthenticationSupported as jest.Mock
      ).mockResolvedValueOnce(true);

      return expectSaga(
        checkCieAvailabilitySaga,
        CieUtils.isCieAuthenticationSupported
      )
        .put(cieIsSupported.success(true))
        .run();
    });

    it("should dispatch failure on error", () => {
      const error = new Error("CIE availability check failed");
      const mockCheck = jest.fn().mockRejectedValueOnce(error);

      return expectSaga(checkCieAvailabilitySaga, mockCheck)
        .put(cieIsSupported.failure(convertUnknownToError(error)))
        .run();
    });
  });

  describe("checkNfcEnablementSaga", () => {
    it("should dispatch success after retries", () => {
      // eslint-disable-next-line functional/no-let
      let attempt = 0;
      jest.spyOn(CieUtils, "isNfcEnabled").mockImplementation(() => {
        attempt++;
        return Promise.resolve(attempt >= 3);
      });

      (CieUtils.isNfcEnabled as jest.Mock)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      return expectSaga(checkNfcEnablementSaga)
        .put(nfcIsEnabled.success(false))
        .call(startTimer, 1500)
        .put(nfcIsEnabled.success(true))
        .run();
    });

    it("should dispatch failure on error", () => {
      const error = new Error("nfc check failed");
      (CieUtils.isNfcEnabled as jest.Mock).mockRejectedValueOnce(error);

      return expectSaga(checkNfcEnablementSaga)
        .put(nfcIsEnabled.failure(convertUnknownToError(error)))
        .run();
    });

    it("should dispatch failure with provide fallback", () => {
      const error = new Error("mock failure");

      return expectSaga(checkNfcEnablementSaga)
        .provide([
          [matchers.call.fn(CieUtils.isNfcEnabled), Promise.reject(error)],
          [matchers.call.fn(startTimer), undefined],
          [matchers.call.fn(convertUnknownToError), error]
        ])
        .put(nfcIsEnabled.failure(error))
        .run();
    });
  });

  describe("watchCieAuthenticationSaga", () => {
    it("should call all checks and dispatch successes", () =>
      expectSaga(watchCieAuthenticationSaga)
        .provide([
          [matchers.call.fn(CieUtils.isCieAuthenticationSupported), true]
        ])
        .put(cieIsSupported.success(true))
        .run());
  });

  describe("stopCieManager", () => {
    it("should call CieManager.stopReading", () => {
      const stopReadingMock = CieManager.stopReading as jest.Mock;
      stopReadingMock.mockResolvedValueOnce(undefined);

      return expectSaga(stopCieManager).call(CieManager.stopReading).run();
    });
  });
});
