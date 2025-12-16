import * as mixpanelTrackModule from "../../../../mixpanel";
import {
  getZendeskConfig,
  getZendeskPaymentConfig,
  zendeskSelectedCategory,
  zendeskSupportCancel,
  zendeskSupportCompleted,
  zendeskSupportFailure,
  zendeskSupportStart
} from "../../store/actions";
import trackZendesk from "../index";
import { TimeoutError } from "../../../../utils/errors";

// Mock the mixpanelTrack function
jest.mock("../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));

const mockMixpanelTrack = mixpanelTrackModule.mixpanelTrack as jest.Mock;

jest.mock("../../../../config", () => ({
  zendeskEnabled: true
}));

describe("index", () => {
  describe("trackZendesk with zendeskEnabled enabled", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    // Test cases for simple actions (only tracking action type)
    it.each([
      ["zendeskSupportCompleted", zendeskSupportCompleted()],
      ["zendeskSupportCancel", zendeskSupportCancel()],
      ["getZendeskConfig.request", getZendeskConfig.request()],
      [
        "getZendeskConfig.success",
        getZendeskConfig.success({ panicMode: true })
      ],
      [
        "getZendeskPaymentConfig.success",
        getZendeskPaymentConfig.success({
          payments: {
            subcategoryId: "a",
            subcategories: {}
          },
          receipts: {
            subcategoryId: "b",
            subcategories: {}
          }
        })
      ],
      ["getZendeskPaymentConfig.request", getZendeskPaymentConfig.request()]
    ])("should track %s with action type only", (_, action) => {
      trackZendesk(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
    });

    it("should track zendeskSupportStart with assistance type details", () => {
      const assistanceType = {
        payment: true,
        card: false,
        fci: true,
        itWallet: false
      };
      const action = zendeskSupportStart({ startingRoute: "", assistanceType });

      trackZendesk(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
      expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
        isAssistanceForPayment: true,
        isAssistanceForCard: false,
        isAssistanceForFci: true,
        isAssistanceForItWallet: false
      });
    });

    it("should track zendeskSupportFailure with reason", () => {
      const reason = "Something went wrong";
      const action = zendeskSupportFailure(reason);

      trackZendesk(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
      expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
        reason
      });
    });

    it("should track zendeskSelectedCategory with category value", () => {
      const category = {
        value: "payment",
        description: {
          "it-IT": "",
          "en-EN": "",
          "de-DE": ""
        }
      };
      const action = zendeskSelectedCategory(category);

      trackZendesk(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
      expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
        category: "payment"
      });
    });

    it("should track getZendeskConfig.failure with error message", () => {
      const networkError: TimeoutError = { kind: "timeout" };
      const action = getZendeskConfig.failure(networkError);

      trackZendesk(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
      expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
        reason: "timeout"
      });
    });

    it("should track getZendeskPaymentConfig.failure with error message", () => {
      const networkError: TimeoutError = { kind: "timeout" };
      const action = getZendeskPaymentConfig.failure(networkError);

      trackZendesk(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
      expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
        reason: "timeout"
      });
    });

    it("should ignore unhandled actions", () => {
      const unhandledAction = { type: "UNKNOWN_ACTION" };

      trackZendesk(unhandledAction as any);

      expect(mockMixpanelTrack.mock.calls.length).toBe(0);
    });
  });
});
