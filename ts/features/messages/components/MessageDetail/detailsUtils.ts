import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { GlobalState } from "../../../../store/reducers/types";
import { trackAuthenticationStart } from "../../../fims/common/analytics";
import { serviceByIdSelector } from "../../../services/details/store/reducers";
import { trackCTAPressed, trackPaymentStart } from "../../analytics";
import { CTA } from "../../types/MessageCTA";
import { CTAActionType } from "../../utils/ctas";

export const computeAndTrackCTAPressAnalytics = (
  isFirstCTA: boolean,
  cta: CTA,
  serviceId: ServiceId,
  state: GlobalState
) => {
  const service = serviceByIdSelector(state, serviceId);
  trackCTAPressed(
    serviceId,
    service?.service_name,
    service?.organization_name,
    service?.organization_fiscal_code,
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
    service?.service_name,
    service?.organization_name,
    service?.organization_fiscal_code
  );
};

export const computeAndTrackFIMSAuthenticationStart = (
  type: CTAActionType,
  ctaLabel: string,
  serviceId: ServiceId,
  state: GlobalState
) => {
  if (type === "fims") {
    const service = serviceByIdSelector(state, serviceId);
    trackAuthenticationStart(
      serviceId,
      service?.service_name,
      service?.organization_name,
      service?.organization_fiscal_code,
      ctaLabel,
      "message_detail"
    );
  }
};
