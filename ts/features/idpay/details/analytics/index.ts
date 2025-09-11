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
