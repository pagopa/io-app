import { StatusEnum as InitiativeOnboardingStatus } from "@io-app/api-types/generated/definitions/idpay/UserOnboardingStatusDTO";

import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";

type DefaultEventProperties = {
  initiativeId?: string;
  status: InitiativeOnboardingStatus;
};

const toMixpanelStatus = (status: InitiativeOnboardingStatus) => {
  switch (status) {
    case InitiativeOnboardingStatus.ON_EVALUATION:
      return "on_evaluation";
    case InitiativeOnboardingStatus.ON_WAITING_LIST:
      return "waiting_list";
  }
};

export const trackIDPayOnWaitingListInfoButtonTap = ({
  status,
  ...props
}: DefaultEventProperties) => {
  mixpanelTrack(
    "IDPAY_BONUS_STATUS_TAP",
    buildEventProperties("UX", "action", {
      ...props,
      status: toMixpanelStatus(status)
    })
  );
};
