import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { GlobalState } from "../../../../store/reducers/types";
import { serviceByIdSelector } from "../../../services/details/store/reducers";
import { trackCTAPressed } from "../../analytics";
import { CTA } from "../../types/MessageCTA";

export const computeAndTrackCTAPressAnalytics = (
  isFirstCTA: boolean,
  cta: CTA,
  serviceId: ServiceId,
  state: GlobalState
) => {
  const service = serviceByIdSelector(state, serviceId);
  const serviceName = service?.service_name;
  const organizationName = service?.organization_name;
  const organizationFiscalCode = service?.organization_fiscal_code;
  const ctaText = cta.text;
  trackCTAPressed(
    serviceId,
    serviceName,
    organizationName,
    organizationFiscalCode,
    isFirstCTA,
    ctaText
  );
};
