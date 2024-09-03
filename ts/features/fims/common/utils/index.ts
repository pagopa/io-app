import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { GlobalState } from "../../../../store/reducers/types";
import { serviceByIdSelector } from "../../../services/details/store/reducers";
import { fimsCtaTextSelector } from "../../singleSignOn/store/selectors";
import { trackDataShare, trackDataShareAccepted } from "../analytics";

export const computeAndTrackDataShare = (
  service: ServicePublic,
  state: GlobalState
) => {
  const ctaText = fimsCtaTextSelector(state);
  trackDataShare(
    service.service_id,
    service.service_name,
    service.organization_name,
    service.organization_fiscal_code,
    ctaText
  );
};

export const computeAndTrackDataShareAccepted = (
  serviceId: ServiceId,
  state: GlobalState
) => {
  const service = serviceByIdSelector(state, serviceId);
  const ctaText = fimsCtaTextSelector(state);
  trackDataShareAccepted(
    serviceId,
    service?.service_name,
    service?.organization_name,
    service?.organization_fiscal_code,
    ctaText
  );
};
