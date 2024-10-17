import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { mixpanelTrack } from "../../../../mixpanel";
import { GlobalState } from "../../../../store/reducers/types";
import { buildEventProperties } from "../../../../utils/analytics";
import { serviceByIdSelector } from "../../../services/details/store/reducers";
import { fimsCtaTextSelector } from "../../singleSignOn/store/selectors";

export const trackAuthenticationStart = (
  serviceId: ServiceId,
  serviceName: string | undefined,
  organizationName: string | undefined,
  organizationFiscalCode: string | undefined,
  ctaLabel: string,
  source: "message_detail" | "service_detail"
) => {
  const eventName = `FIMS_START`;
  const props = buildEventProperties("UX", "action", {
    service_id: serviceId,
    service_name: serviceName,
    organization_name: organizationName,
    organization_fiscal_code: organizationFiscalCode,
    fims_label: ctaLabel,
    source
  });
  void mixpanelTrack(eventName, props);
};

export const trackDataShare = (
  serviceId: ServiceId,
  serviceName: string | undefined,
  organizationName: string | undefined,
  organizationFiscalCode: string | undefined,
  ctaLabel: string | undefined
) => {
  const eventName = `FIMS_DATA_SHARE`;
  const props = buildEventProperties("UX", "screen_view", {
    service_id: serviceId,
    service_name: serviceName,
    organization_name: organizationName,
    organization_fiscal_code: organizationFiscalCode,
    fims_label: ctaLabel
  });
  void mixpanelTrack(eventName, props);
};

export const trackDataShareAccepted = (
  serviceId: ServiceId,
  serviceName: string | undefined,
  organizationName: string | undefined,
  organizationFiscalCode: string | undefined,
  ctaLabel: string | undefined
) => {
  const eventName = `FIMS_DATA_SHARE_ACCEPTED`;
  const props = buildEventProperties("UX", "action", {
    service_id: serviceId,
    service_name: serviceName,
    organization_name: organizationName,
    organization_fiscal_code: organizationFiscalCode,
    fims_label: ctaLabel
  });
  void mixpanelTrack(eventName, props);
};

export const trackInAppBrowserOpening = (
  serviceId: ServiceId,
  serviceName: string | undefined,
  organizationName: string | undefined,
  organizationFiscalCode: string | undefined,
  ctaLabel: string | undefined
) => {
  const eventName = `FIMS_CALLBACK_RP`;
  const props = buildEventProperties("TECH", undefined, {
    service_id: serviceId,
    service_name: serviceName,
    organization_name: organizationName,
    organization_fiscal_code: organizationFiscalCode,
    fims_label: ctaLabel
  });
  void mixpanelTrack(eventName, props);
};

export const trackAuthenticationError = (
  serviceId: ServiceId | undefined,
  serviceName: string | undefined,
  organizationName: string | undefined,
  organizationFiscalCode: string | undefined,
  reason: string
) => {
  const eventName = `FIMS_ERROR`;
  const props = buildEventProperties("KO", "error", {
    service_id: serviceId,
    service_name: serviceName,
    organization_name: organizationName,
    organization_fiscal_code: organizationFiscalCode,
    reason
  });
  void mixpanelTrack(eventName, props);
};

export const trackHistoryScreen = () => {
  const eventName = `SETTINGS_3P_ACCESS_LOG`;
  const props = buildEventProperties("UX", "screen_view");
  void mixpanelTrack(eventName, props);
};

export const trackExportHistory = () => {
  const eventName = `SETTINGS_3P_ACCESS_LOG_REQUEST`;
  const props = buildEventProperties("UX", "action");
  void mixpanelTrack(eventName, props);
};

export const trackExportSucceeded = () => {
  const eventName = `SETTINGS_3P_ACCESS_LOG_REQUEST_SUCCESS`;
  const props = buildEventProperties("UX", "confirm");
  void mixpanelTrack(eventName, props);
};

export const trackHistoryFailure = (reason: string) => {
  const eventName = `SETTINGS_3P_ACCESS_LOG_ERROR`;
  const props = buildEventProperties("KO", "error", { reason });
  void mixpanelTrack(eventName, props);
};

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
