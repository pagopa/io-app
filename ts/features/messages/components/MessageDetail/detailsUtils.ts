import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { GlobalState } from "../../../../store/reducers/types";
import { serviceByIdSelector } from "../../../services/details/store/reducers";
import { trackCTAPressed, trackPaymentStart } from "../../analytics";
import { CTA } from "../../../../types/LocalizedCTAs";

export const computeAndTrackCTAPressAnalytics = (
  isFirstCTA: boolean,
  cta: CTA,
  serviceId: ServiceId,
  state: GlobalState
) => {
  const service = serviceByIdSelector(state, serviceId);
  trackCTAPressed(
    serviceId,
    service?.name,
    service?.organization.name,
    service?.organization.fiscal_code,
    isFirstCTA,
    cta.text
  );
};

export const computeAndTrackPaymentStart = (
  serviceId: ServiceId,
  state: GlobalState
) => {
  const service = serviceByIdSelector(state, serviceId);
  trackPaymentStart(
    serviceId,
    service?.name,
    service?.organization.name,
    service?.organization.fiscal_code
  );
};
