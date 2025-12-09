import { expectSaga } from "redux-saga-test-plan";
import cieManager from "@pagopa/react-native-cie";
import * as matchers from "redux-saga-test-plan/matchers";
import { cieIsSupported, nfcIsEnabled } from "../../store/actions";
import {
  checkCieAvailabilitySaga,
  checkNfcEnablementSaga,
  stopCieManager,
  watchCieAuthenticationSaga
} from "../cie";
import { convertUnknownToError } from "../../../../../../utils/errors";
import { startTimer } from "../../../../../../utils/timer";

jest.mock("@pagopa/react-native-cie", () => ({
  stopListeningNFC: jest.fn(),
  isCIEAuthenticationSupported: jest.fn(),
  hasApiLevelSupport: jest.fn(),
  hasNFCFeature: jest.fn(),
  isNFCEnabled: jest.fn()
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
        cieManager.isCIEAuthenticationSupported as jest.Mock
      ).mockResolvedValueOnce(true);

      return expectSaga(
        checkCieAvailabilitySaga,
        cieManager.isCIEAuthenticationSupported
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
      jest.spyOn(cieManager, "isNFCEnabled").mockImplementation(() => {
        attempt++;
        return Promise.resolve(attempt >= 3);
      });

      (cieManager.isNFCEnabled as jest.Mock)
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
      (cieManager.isNFCEnabled as jest.Mock).mockRejectedValueOnce(error);

      return expectSaga(checkNfcEnablementSaga)
        .put(nfcIsEnabled.failure(convertUnknownToError(error)))
        .run();
    });

    it("should dispatch failure with provide fallback", () => {
      const error = new Error("mock failure");

      return expectSaga(checkNfcEnablementSaga)
        .provide([
          [matchers.call.fn(cieManager.isNFCEnabled), Promise.reject(error)],
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
          [matchers.call.fn(cieManager.isCIEAuthenticationSupported), true],
          [matchers.call.fn(cieManager.hasApiLevelSupport), true],
          [matchers.call.fn(cieManager.hasNFCFeature), true]
        ])
        .put(cieIsSupported.success(true))
        .run());
  });

  describe("stopCieManager", () => {
    it("should call cieManager.stopListeningNFC", () => {
      const stopListeningMock = cieManager.stopListeningNFC as jest.Mock;
      stopListeningMock.mockResolvedValueOnce(undefined);

      return expectSaga(stopCieManager).call(cieManager.stopListeningNFC).run();
    });
  });
});
