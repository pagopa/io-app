import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";

type WalletPaymentRemoveAnalyticsProps = {
  payment_method_selected: string;
  payment_method_status: "valid" | "invalid";
};

export const trackWalletPaymentRemoveMethodStart = (
  props: Partial<WalletPaymentRemoveAnalyticsProps>
) =>
  mixpanelTrack(
    "WALLET_PAYMENT_METHOD_REMOVE",
    buildEventProperties("UX", "action", props)
  );

export const trackWalletPaymentRemoveMethodConfirm = (
  props: Partial<WalletPaymentRemoveAnalyticsProps>
) =>
  mixpanelTrack(
    "WALLET_PAYMENT_METHOD_REMOVE_CONFIRM",
    buildEventProperties("UX", "confirm", props)
  );

export const trackWalletPaymentRemoveMethodSuccess = (
  props: Partial<WalletPaymentRemoveAnalyticsProps>
) =>
  mixpanelTrack(
    "WALLET_PAYMENT_METHOD_REMOVE_SUCCESS",
    buildEventProperties("UX", "screen_view", props)
  );

export const trackWalletPaymentRemoveMethodFailure = (
  props: Partial<WalletPaymentRemoveAnalyticsProps>
) =>
  mixpanelTrack(
    "WALLET_PAYMENT_METHOD_REMOVE_FAILURE",
    buildEventProperties("KO", undefined, props)
  );
