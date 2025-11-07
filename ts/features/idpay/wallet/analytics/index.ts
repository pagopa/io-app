import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";

type DefaultEventProperties = {
  initiativeName?: string;
  initiativeId?: string;
};

export const trackIDPayOnWaitingListInfoButtonTap = (
  props: DefaultEventProperties
) => {
  mixpanelTrack(
    "IDPAY_BONUS_STATUS_TAP",
    buildEventProperties("UX", "action", props)
  );
};
