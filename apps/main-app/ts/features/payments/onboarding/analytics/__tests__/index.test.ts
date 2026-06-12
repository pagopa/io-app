import { mixpanelTrack } from "../../../../../mixpanel";
import {
  getOnboardingPaymentMethodOutcomeEvent,
  trackAddOnboardingPaymentMethod,
  trackPaymentOnboardingErrorHelp
} from "../../analytics";
import { WalletOnboardingOutcomeEnum } from "../../types/OnboardingOutcomeEnum";

jest.mock("../../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));

jest.mock("../../../../../utils/analytics", () => ({
  buildEventProperties: jest.fn().mockImplementation((source, type, props) => ({
    source,
    type,
    ...props
  }))
}));

describe("Onboarding Analytics", () => {
  describe("getOnboardingPaymentMethodOutcomeEvent", () => {
    it.each([
      [WalletOnboardingOutcomeEnum.SUCCESS, "ADD_PAYMENT_METHOD_UX_SUCCESS"],
      [
        WalletOnboardingOutcomeEnum.AUTH_ERROR,
        "PAYMENT_ADD_METHOD_AUTHORIZATION_DENIED"
      ],
      [
        WalletOnboardingOutcomeEnum.CANCELED_BY_USER,
        "PAYMENT_ADD_METHOD_CANCELED_BY_USER"
      ],
      [
        WalletOnboardingOutcomeEnum.ALREADY_ONBOARDED,
        "PAYMENT_ADD_METHOD_DUPLICATE_ERROR"
      ],
      [WalletOnboardingOutcomeEnum.BE_KO, "PAYMENT_99_ERROR"],
      [
        WalletOnboardingOutcomeEnum.BPAY_NOT_FOUND,
        "PAYMENT_ADD_METHOD_BPAY_NOT_FOUND"
      ],
      [WalletOnboardingOutcomeEnum.PSP_ERROR_ONBOARDING, "PAYMENT_PSP_ERROR"],
      [WalletOnboardingOutcomeEnum.INVALID_SESSION, "PAYMENT_SESSION_TIMEOUT"],
      [WalletOnboardingOutcomeEnum.TIMEOUT, "PAYMENT_SESSION_TIMEOUT"],
      [WalletOnboardingOutcomeEnum.GENERIC_ERROR, "PAYMENT_GENERIC_ERROR"],
      ["UNKNOWN_OUTCOME", "PAYMENT_GENERIC_ERROR"]
    ])(
      "returns correct event name for outcome %s",
      (outcome, expectedEventName) => {
        const eventName = getOnboardingPaymentMethodOutcomeEvent(
          outcome as WalletOnboardingOutcomeEnum
        );
        expect(eventName).toBe(expectedEventName);
      }
    );
  });

  describe("trackAddOnboardingPaymentMethod", () => {
    it("tracks the correct event with provided outcome and payment method", () => {
      trackAddOnboardingPaymentMethod(
        WalletOnboardingOutcomeEnum.SUCCESS,
        "CreditCard"
      );

      expect(mixpanelTrack).toHaveBeenCalledWith(
        "ADD_PAYMENT_METHOD_UX_SUCCESS",
        expect.objectContaining({
          source: "UX",
          type: "screen_view",
          payment_method_selected: "CreditCard",
          payment_phase: "onboarding"
        })
      );
    });

    it("handles undefined payment method gracefully", () => {
      trackAddOnboardingPaymentMethod(
        WalletOnboardingOutcomeEnum.AUTH_ERROR,
        undefined
      );

      expect(mixpanelTrack).toHaveBeenCalledWith(
        "PAYMENT_ADD_METHOD_AUTHORIZATION_DENIED",
        expect.objectContaining({
          source: "UX",
          type: "screen_view",
          payment_method_selected: undefined,
          payment_phase: "onboarding"
        })
      );
    });
  });

  describe("trackPaymentOnboardingErrorHelp", () => {
    it("tracks the correct event with error and additional props", () => {
      trackPaymentOnboardingErrorHelp({
        error: "PAYMENT_ERROR",
        payment_method_selected: "CreditCard"
      });

      expect(mixpanelTrack).toHaveBeenCalledWith(
        "PAYMENT_ERROR_HELP",
        expect.objectContaining({
          source: "UX",
          type: "action",
          payment_phase: "onboarding",
          error: "PAYMENT_ERROR",
          payment_method_selected: "CreditCard"
        })
      );
    });

    it("handles missing optional properties gracefully", () => {
      trackPaymentOnboardingErrorHelp({ error: "PAYMENT_ERROR" });

      expect(mixpanelTrack).toHaveBeenCalledWith(
        "PAYMENT_ERROR_HELP",
        expect.objectContaining({
          source: "UX",
          type: "action",
          payment_phase: "onboarding",
          error: "PAYMENT_ERROR"
        })
      );
    });
  });
});
