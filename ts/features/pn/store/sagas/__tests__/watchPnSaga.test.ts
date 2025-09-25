import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import { expectSaga, testSaga } from "redux-saga-test-plan";
import { call, select } from "redux-saga/effects";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { pnMessagingServiceIdSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isPnTestEnabledSelector } from "../../../../../store/reducers/persistedPreferences";
import { SessionToken } from "../../../../../types/SessionToken";
import { loadServicePreference } from "../../../../services/details/store/actions/preference";
import { servicePreferencePotByIdSelector } from "../../../../services/details/store/selectors";
import {
  trackPNServiceStatusChangeError,
  trackPNServiceStatusChangeSuccess
} from "../../../analytics";
import * as CLIENT from "../../../api/client";
import {
  pnActivationUpsert,
  startPNPaymentStatusTracking
} from "../../actions";
import { watchPaymentStatusForMixpanelTracking } from "../watchPaymentStatusSaga";
import * as SAGAS from "../watchPnSaga";

// Mock constants
const mockBearerToken = "mock-token" as SessionToken;
const mockServiceId = "service-id" as ServiceId;
const mockUpsertPNActivation = jest.fn();
const mockPnClient: Partial<CLIENT.PnClient> = {
  upsertPNActivation: mockUpsertPNActivation
};

// Extract functions from testable export
const { testable, watchPnSaga, tryLoadSENDPreferences } = SAGAS;
const { handlePnActivation, reportPNServiceStatusOnFailure } = testable ?? {
  // this coalescence is purely to avoid TS errors
  handlePnActivation: jest.fn(),
  reportPNServiceStatusOnFailure: jest.fn()
};

// Mock analytics functions
jest.mock("../../../analytics", () => ({
  trackPNServiceStatusChangeSuccess: jest.fn(),
  trackPNServiceStatusChangeError: jest.fn()
}));

describe("watchPnSaga", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("tryLoadSENDPreferences", () => {
    it("should dispatch loadServicePreference.request when serviceId is valid", () => {
      testSaga(tryLoadSENDPreferences)
        .next()
        .select(pnMessagingServiceIdSelector)
        .next(mockServiceId)
        .put(loadServicePreference.request(mockServiceId))
        .next()
        .isDone();
    });

    it("should not dispatch loadServicePreference.request when serviceId is undefined", () => {
      testSaga(tryLoadSENDPreferences)
        .next()
        .select(pnMessagingServiceIdSelector)
        .next(undefined)
        .isDone();
    });
  });

  describe("handlePnActivation", () => {
    const onSuccess = jest.fn();
    const onFailure = jest.fn();
    const requestAction = pnActivationUpsert.request({
      value: true,
      onSuccess,
      onFailure
    });

    it("should handle successful activation (204 response)", () => {
      mockUpsertPNActivation.mockResolvedValueOnce(E.right({ status: 204 }));

      return expectSaga(
        handlePnActivation,
        mockUpsertPNActivation,
        requestAction
      )
        .provide([
          [select(isPnTestEnabledSelector), false],
          [select(pnMessagingServiceIdSelector), mockServiceId]
        ])
        .put(pnActivationUpsert.success())
        .call(tryLoadSENDPreferences)
        .run()
        .then(() => {
          expect(trackPNServiceStatusChangeSuccess).toHaveBeenCalledWith(true);
          expect(onSuccess).toHaveBeenCalled();
          expect(onFailure).not.toHaveBeenCalled();
        });
    });

    for (const resolvedValue of [
      E.left(["API error"]),
      E.right({ status: 500 })
    ]) {
      it("should handle a right(status:500) and a left response", () => {
        mockUpsertPNActivation.mockResolvedValueOnce(resolvedValue);

        return expectSaga(
          handlePnActivation,
          mockUpsertPNActivation,
          requestAction
        )
          .provide([
            [select(isPnTestEnabledSelector), false],
            [select(pnMessagingServiceIdSelector), mockServiceId],
            [select(servicePreferencePotByIdSelector, mockServiceId), pot.none],
            [call(reportPNServiceStatusOnFailure, false, "A reason"), undefined]
          ])
          .put(pnActivationUpsert.failure())
          .call(tryLoadSENDPreferences)
          .run()
          .then(() => {
            expect(onFailure).toHaveBeenCalled();
            expect(onSuccess).not.toHaveBeenCalled();
          });
      });
    }

    it("should handle thrown exceptions", () => {
      const errorMock = new Error("Network error");
      mockUpsertPNActivation.mockRejectedValueOnce(errorMock);

      return expectSaga(
        handlePnActivation,
        mockUpsertPNActivation,
        requestAction
      )
        .provide([
          [select(isPnTestEnabledSelector), false],
          [select(pnMessagingServiceIdSelector), mockServiceId],
          [select(servicePreferencePotByIdSelector, mockServiceId), pot.none],
          [call(reportPNServiceStatusOnFailure, false, "A reason"), undefined]
        ])
        .put(pnActivationUpsert.failure())
        .call(tryLoadSENDPreferences)
        .run()
        .then(() => {
          expect(onFailure).toHaveBeenCalled();
          expect(onSuccess).not.toHaveBeenCalled();
        });
    });
  });

  describe("reportPNServiceStatusOnFailure", () => {
    it("should use predictedValue when service preferences are not available", () => {
      testSaga(reportPNServiceStatusOnFailure, true, "A reason")
        .next()
        .select(pnMessagingServiceIdSelector)
        .next(mockServiceId)
        .select(servicePreferencePotByIdSelector, mockServiceId)
        .next(pot.none)
        .isDone();
      expect(trackPNServiceStatusChangeError).toHaveBeenCalledWith(
        true,
        "A reason"
      );
    });

    it("should use inbox value from service preferences when available", () => {
      const servicePreferences = {
        kind: "success",
        value: { inbox: true }
      };

      testSaga(reportPNServiceStatusOnFailure, false, "A reason")
        .next()
        .select(pnMessagingServiceIdSelector)
        .next(mockServiceId)
        .select(servicePreferencePotByIdSelector, mockServiceId)
        .next(pot.some(servicePreferences))
        .isDone();

      expect(trackPNServiceStatusChangeError).toHaveBeenCalledWith(
        true,
        "A reason"
      );
    });
  });

  describe("watchPnSaga", () => {
    it("should register takeLatest for pnActivationUpsert.request and startPNPaymentStatusTracking actions", () => {
      jest
        .spyOn(CLIENT, "createPnClient")
        .mockReturnValue(
          mockPnClient as ReturnType<typeof CLIENT.createPnClient>
        );
      testSaga(watchPnSaga, mockBearerToken)
        .next()
        .takeLatest(
          pnActivationUpsert.request,
          handlePnActivation,
          mockPnClient.upsertPNActivation
        )
        .next()
        .takeLatest(
          startPNPaymentStatusTracking,
          watchPaymentStatusForMixpanelTracking
        )
        .next()
        .isDone();
    });
  });
});
