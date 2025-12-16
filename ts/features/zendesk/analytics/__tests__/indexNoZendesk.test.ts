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
  zendeskEnabled: false
}));

describe("index", () => {
  describe("trackZendesk with zendeskEnabled disabled", () => {
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
    ])("should not track %s with action type only", (_, action) => {
      trackZendesk(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(0);
    });

    it("should not track zendeskSupportStart with assistance type details", () => {
      const assistanceType = {
        payment: true,
        card: false,
        fci: true,
        itWallet: false
      };
      const action = zendeskSupportStart({ startingRoute: "", assistanceType });

      trackZendesk(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(0);
    });

    it("should not track zendeskSupportFailure with reason", () => {
      const reason = "Something went wrong";
      const action = zendeskSupportFailure(reason);

      trackZendesk(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(0);
    });

    it("should not track zendeskSelectedCategory with category value", () => {
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

      expect(mockMixpanelTrack.mock.calls.length).toBe(0);
    });

    it("should not track getZendeskConfig.failure with error message", () => {
      const networkError: TimeoutError = { kind: "timeout" };
      const action = getZendeskConfig.failure(networkError);

      trackZendesk(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(0);
    });

    it("should not track getZendeskPaymentConfig.failure with error message", () => {
      const networkError: TimeoutError = { kind: "timeout" };
      const action = getZendeskPaymentConfig.failure(networkError);

      trackZendesk(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(0);
    });

    it("should ignore unhandled actions", () => {
      const unhandledAction = { type: "UNKNOWN_ACTION" };

      trackZendesk(unhandledAction as any);

      expect(mockMixpanelTrack.mock.calls.length).toBe(0);
    });
  });
});
