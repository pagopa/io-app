import { People } from "mixpanel-react-native";
import { PaymentAnalyticsProps, trackPaymentOutcomeSuccess } from "..";
import * as MIXPANEL from "../../../../../mixpanel";

describe("index", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  describe("trackPaymentOutcomeSuccess", () => {
    it("should call 'increment' on 'getPeople' and 'mixpanelTrack' with proper parameters", () => {
      const mockIncrement = jest.fn();
      const mockPeople = {
        increment: mockIncrement
      } as unknown as People;
      jest.spyOn(MIXPANEL, "getPeople").mockImplementation(() => mockPeople);
      const spyOnMixpanelTrack = jest
        .spyOn(MIXPANEL, "mixpanelTrack")
        .mockImplementation();

      const paymentProps: PaymentAnalyticsProps = {
        data_entry: "1",
        first_time_opening: "2",
        organization_name: "3",
        organization_fiscal_code: "4",
        service_name: "5",
        saved_payment_method: 6,
        amount: "7",
        expiration_date: "8",
        payment_phase: "verifica",
        attempt: 9,
        saved_payment_method_unavailable: 10,
        last_used_payment_method: "11",
        payment_method_selected: "12",
        payment_method_selected_flag: "saved",
        preselected_psp_flag: "customer",
        selected_psp_flag: "unique",
        psp_selected: "13",
        editing: "payment_method",
        browser_type: "webview"
      };

      trackPaymentOutcomeSuccess(paymentProps);

      expect(mockIncrement.mock.calls.length).toBe(1);
      expect(mockIncrement.mock.calls[0].length).toBe(2);
      expect(mockIncrement.mock.calls[0][0]).toBe("PAYMENT_COMPLETED");
      expect(mockIncrement.mock.calls[0][1]).toBe(1);

      expect(spyOnMixpanelTrack.mock.calls.length).toBe(1);
      expect(spyOnMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(spyOnMixpanelTrack.mock.calls[0][0]).toBe("PAYMENT_UX_SUCCESS");
      expect(spyOnMixpanelTrack.mock.calls[0][1]).toEqual({
        ...paymentProps,
        event_category: "UX",
        event_type: "screen_view"
      });
    });
    it("should only call 'mixpanelTrack' with proper parameters if 'getPeople' returns undefined", () => {
      const spyOnMockedGetPeople = jest
        .spyOn(MIXPANEL, "getPeople")
        .mockImplementation(() => undefined);
      const spyOnMixpanelTrack = jest
        .spyOn(MIXPANEL, "mixpanelTrack")
        .mockImplementation();

      const paymentProps: PaymentAnalyticsProps = {
        data_entry: "1",
        first_time_opening: "2",
        organization_name: "3",
        organization_fiscal_code: "4",
        service_name: "5",
        saved_payment_method: 6,
        amount: "7",
        expiration_date: "8",
        payment_phase: "verifica",
        attempt: 9,
        saved_payment_method_unavailable: 10,
        last_used_payment_method: "11",
        payment_method_selected: "12",
        payment_method_selected_flag: "saved",
        preselected_psp_flag: "customer",
        selected_psp_flag: "unique",
        psp_selected: "13",
        editing: "payment_method",
        browser_type: "webview"
      };

      trackPaymentOutcomeSuccess(paymentProps);

      expect(spyOnMockedGetPeople.mock.calls.length).toBe(1);
      expect(spyOnMockedGetPeople.mock.calls[0].length).toBe(0);

      expect(spyOnMixpanelTrack.mock.calls.length).toBe(1);
      expect(spyOnMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(spyOnMixpanelTrack.mock.calls[0][0]).toBe("PAYMENT_UX_SUCCESS");
      expect(spyOnMixpanelTrack.mock.calls[0][1]).toEqual({
        ...paymentProps,
        event_category: "UX",
        event_type: "screen_view"
      });
    });
  });
});
