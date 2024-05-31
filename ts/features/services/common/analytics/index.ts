import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";

type ServiceBaseType = {
  service_name: string;
} & InstitutionBaseType;

type InstitutionBaseType = {
  organization_name: string;
};

type ServiceDetailsType = {
  service_category: "special" | "standard";
  main_consent_status: boolean;
  push_consent_status: boolean;
  read_confirmation_consent_status: boolean;
  bottom_cta_available: boolean;
  special_service_status: "active" | "not_active" | "nd";
} & ServiceBaseType;

type ServiceConsentChangedType = {
  consent_type: "main" | "push" | "read_confirmation";
  consent_status: boolean;
} & ServiceBaseType;

type ServiceDetailsUserExitType = {
  link: "website" | "email" | "assistance" | "bottom_cta";
} & ServiceBaseType;

type SpecialServiceStatusChangedType = {
  special_service_status: "activated" | "deactivated";
} & ServiceBaseType;

type InstitutionDetailsType = {
  sevices_count: number;
} & InstitutionBaseType;

type ServiceSelectedType = {
  source: "featured_organization" | "featured_services";
} & ServiceBaseType;

type InstitutionSelectedType = {
  source: "featured_organization" | "main_list" | "search_list" | "recent_list";
} & InstitutionBaseType;

type ServicesSearchStartType = {
  source: "bottom_link" | "header_icon";
};

export const trackServicesHome = () =>
  void mixpanelTrack("SERVICES", buildEventProperties("UX", "screen_view"));

export const trackServicesHomeError = (reason: string) =>
  void mixpanelTrack(
    "SERVICES_ERROR",
    buildEventProperties("KO", undefined, { reason })
  );

export const trackOrganizationsScroll = () =>
  void mixpanelTrack(
    "ORGANIZATIONS_SCROLL",
    buildEventProperties("UX", "action")
  );

export const trackServicesSearchStart = ({ source }: ServicesSearchStartType) =>
  void mixpanelTrack(
    "SERVICES_SEARCH_START",
    buildEventProperties("UX", "action", {
      source
    })
  );

export const trackServiceSelected = ({
  organization_name,
  service_name,
  source
}: ServiceSelectedType) =>
  void mixpanelTrack(
    "SERVICES_SELECTED",
    buildEventProperties("UX", "action", {
      service_name,
      organization_name,
      source
    })
  );

export const trackInstitutionSelected = ({
  organization_name,
  source
}: InstitutionSelectedType) =>
  void mixpanelTrack(
    "SERVICES_ORGANIZATION_SELECTED",
    buildEventProperties("UX", "action", {
      organization_name,
      source
    })
  );

export const trackInstitutionDetails = ({
  organization_name,
  sevices_count = 0
}: InstitutionDetailsType) =>
  void mixpanelTrack(
    "SERVICES_ORGANIZATION_DETAIL",
    buildEventProperties("UX", "screen_view", {
      organization_name,
      sevices_count
    })
  );

export const trackInstitutionDetailsError = (reason: string) =>
  void mixpanelTrack(
    "SERVICES_ORGANIZATION_DETAIL_ERROR",
    buildEventProperties("KO", undefined, { reason })
  );

export const trackSearchPage = () =>
  void mixpanelTrack(
    "SERVICES_SEARCH_PAGE",
    buildEventProperties("UX", "screen_view")
  );

export const trackSearchInput = () =>
  void mixpanelTrack(
    "SERVICES_SEARCH_INPUT",
    buildEventProperties("UX", "action")
  );

export const trackSearchResult = (results_count: number = 0) =>
  void mixpanelTrack(
    "SERVICES_SEARCH_RESULT_PAGE",
    buildEventProperties("UX", "screen_view", { results_count })
  );

export const trackSearchResultScroll = () =>
  void mixpanelTrack(
    "SERVICES_SEARCH_RESULT_SCROLL",
    buildEventProperties("UX", "action")
  );

export const trackSearchError = (reason: string) =>
  void mixpanelTrack(
    "SERVICES_SEARCH_ERROR",
    buildEventProperties("KO", undefined, { reason })
  );

export const trackServiceDetails = (props: ServiceDetailsType) =>
  void mixpanelTrack(
    "SERVICES_DETAIL",
    buildEventProperties("UX", "screen_view", props)
  );

export const trackServiceConsentChanged = (props: ServiceConsentChangedType) =>
  void mixpanelTrack(
    "SERVICES_CONSENT_CHANGED",
    buildEventProperties("UX", "action", props)
  );

export const trackServiceDetailsUserExit = (
  props: ServiceDetailsUserExitType
) =>
  void mixpanelTrack(
    "SERVICES_DETAIL_USER_EXIT",
    buildEventProperties("UX", "exit", props)
  );

export const trackSpecialServiceStatusChanged = (
  props: SpecialServiceStatusChangedType
) =>
  void mixpanelTrack(
    "SERVICES_SPECIAL_SERVICE_STATUS_CHANGED",
    buildEventProperties("UX", "action", props)
  );

export const trackServiceDetailsError = (reason: string) =>
  void mixpanelTrack(
    "SERVICES_DETAIL_ERROR",
    buildEventProperties("KO", undefined, { reason })
  );
