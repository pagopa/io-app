import { VoucherStatusEnum } from "../../../../../definitions/idpay/InitiativeDTO";
import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";

type DefaultOnboardingEventProperties = {
  initiativeName?: string;
  initiativeId?: string;
};

const mapIDPayDetailStatusToMixpanel = (
  status?: VoucherStatusEnum
): "valid" | "about_to_expire" | "expired" | "spent" | undefined => {
  switch (status) {
    case VoucherStatusEnum.ACTIVE:
      return "valid";
    case VoucherStatusEnum.EXPIRING:
      return "about_to_expire";
    case VoucherStatusEnum.EXPIRED:
      return "expired";
    case VoucherStatusEnum.USED:
      return "spent";
    default:
      return undefined;
  }
};

export const trackIDPayDetailLanding = (
  props: DefaultOnboardingEventProperties & {
    status?: VoucherStatusEnum;
  }
) => {
  mixpanelTrack(
    "IDPAY_DETAIL",
    buildEventProperties("UX", "screen_view", {
      ...props,
      status: mapIDPayDetailStatusToMixpanel(props.status)
    })
  );
};

export const trackIDPayDetailRetailersClick = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_DETAIL_SHOW_RETAILERS",
    buildEventProperties("UX", "action", props)
  );
};

export const trackIDPayDetailAuthorizationStart = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_AUTHORIZATION_START",
    buildEventProperties("UX", "action", props)
  );
};

export const trackIDPayDetailInfoAction = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_DETAIL_INFO",
    buildEventProperties("UX", "action", props)
  );
};

export const trackIDPayDetailBottomSheetLanding = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_AUTHORIZATION_BOTTOMSHEET",
    buildEventProperties("UX", "screen_view", props)
  );
};

export const trackIDPayDetailQRCodeScan = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_AUTHORIZATION_QRCODE_SCAN",
    buildEventProperties("UX", "action", props)
  );
};

export const trackIDPayDetailCodeGeneration = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_CODE_GENERATION",
    buildEventProperties("UX", "action", props)
  );
};

export const trackIDPayDetailManualEntryLanding = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_AUTHORIZATION_MANUAL_ENTRY",
    buildEventProperties("UX", "screen_view", props)
  );
};

export const trackIDPayDetailManualEntryConfirm = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_AUTHORIZATION_MANUAL_ENTRY_CONFIRM",
    buildEventProperties("UX", "action", props)
  );
};

export const trackIDPayDetailAuthorizationSummary = (
  props: DefaultOnboardingEventProperties & {
    data_entry: "qr_code" | "manual";
  }
) => {
  mixpanelTrack(
    "IDPAY_AUTHORIZATION_SUMMARY",
    buildEventProperties("UX", "screen_view", props)
  );
};

export const trackIDPayDetailAuthorizationConversion = (
  props: DefaultOnboardingEventProperties & {
    data_entry: "qr_code" | "manual";
  }
) => {
  mixpanelTrack(
    "IDPAY_AUTHORIZATION_CONVERSION",
    buildEventProperties("UX", "action", props)
  );
};

export const trackIDPayDetailAuthorizationCancel = (
  props: DefaultOnboardingEventProperties & {
    data_entry: "qr_code" | "manual";
  }
) => {
  mixpanelTrack(
    "IDPAY_AUTHORIZATION_CANCEL",
    buildEventProperties("UX", "action", props)
  );
};

export const trackIDPayDetailAuthorizationUXSuccess = (
  props: DefaultOnboardingEventProperties & {
    data_entry: "qr_code" | "manual";
  }
) => {
  mixpanelTrack(
    "IDPAY_AUTHORIZATION_UX_SUCCESS",
    buildEventProperties("UX", "confirm", props)
  );
};

export const trackIDPayDetailAuthorizationError = (
  props: DefaultOnboardingEventProperties & {
    data_entry: "qr_code" | "manual";
    reason?: string;
  }
) => {
  mixpanelTrack(
    "IDPAY_AUTHORIZATION_ERROR",
    buildEventProperties("UX", "confirm", props)
  );
};

export const trackIDPayDetailCodeGenerationError = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_CODE_GENERATION_GENERIC_ERROR",
    buildEventProperties("KO", "screen_view", props)
  );
};

export const trackIDPayDetailCodeGenerationCopy = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_CODE_GENERATION_COPY_SUCCESS",
    buildEventProperties("UX", "confirm", props)
  );
};

export const trackIDPayDetailCodeGenerationConversion = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_CODE_GENERATION_UX_CONVERSION",
    buildEventProperties("UX", "confirm", props)
  );
};
