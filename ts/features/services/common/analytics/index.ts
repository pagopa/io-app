import { getType } from "typesafe-actions";
import { mixpanelTrack } from "../../../../mixpanel";
import { Action } from "../../../../store/actions/types";
import { buildEventProperties } from "../../../../utils/analytics";
import { getNetworkErrorMessage } from "../../../../utils/errors";
import { loadServicePreference } from "../../details/store/actions/preference";
import {
  featuredInstitutionsGet,
  featuredServicesGet,
  paginatedInstitutionsGet
} from "../../home/store/actions";
import { paginatedServicesGet } from "../../institution/store/actions";
import { searchPaginatedInstitutionsGet } from "../../search/store/actions";

type ServiceBaseType = {
  service_id: string;
  service_name: string;
} & InstitutionBaseType;

type InstitutionBaseType = {
  organization_name: string;
};

type ServiceDetailsType = {
  bottom_cta_available: boolean;
  organization_fiscal_code: string;
  service_category: "special" | "standard";
} & ServiceBaseType;

type ServiceDetailsConsentType = {
  is_special_service: boolean;
  main_consent_status: boolean;
  push_consent_status: boolean;
  read_confirmation_consent_status: boolean;
  service_id: string;
};

const ConsentTypeLabels = {
  inbox: "main",
  email: "email",
  push: "push",
  can_access_message_read_status: "read_confirmation"
} as const;

type ServiceConsentChangedType = {
  consent_type: keyof typeof ConsentTypeLabels;
  consent_status: boolean;
  service_id: string;
};

type ServiceDetailsUserExitType = {
  link: string;
  service_id: string;
};

type SpecialServiceStatusChangedType = {
  is_active: boolean;
  service_id: string;
};

type InstitutionDetailsType = {
  organization_fiscal_code: string;
  services_count: number;
} & InstitutionBaseType;

type ServiceSelectedType = {
  source: "featured_services" | "organization_detail";
} & ServiceBaseType;

type InstitutionSelectedType = {
  organization_fiscal_code: string;
  source:
    | "featured_organizations"
    | "main_list"
    | "search_list"
    | "recent_list";
} & InstitutionBaseType;

type SearchStartType = {
  source: "bottom_link" | "header_icon" | "search_bar";
};

export type CtaCategoryType = "custom_1" | "custom_2";

type ServiceDetailsCtaTappedType = {
  cta_category: CtaCategoryType;
  service_id: string;
};

export const trackServicesHome = () =>
  void mixpanelTrack("SERVICES", buildEventProperties("UX", "screen_view"));

export const trackServicesHomeError = (
  reason: string,
  source: "featured_services" | "featured_organizations" | "main_list"
) =>
  void mixpanelTrack(
    "SERVICES_ERROR",
    buildEventProperties("KO", undefined, { reason, source })
  );

export const trackInstitutionsScroll = () =>
  void mixpanelTrack("SERVICES_SCROLL", buildEventProperties("UX", "action"));

export const trackSearchStart = (props: SearchStartType) =>
  void mixpanelTrack(
    "SERVICES_SEARCH_START",
    buildEventProperties("UX", "action", props)
  );

export const trackServiceSelected = ({
  organization_name,
  service_id,
  service_name,
  source
}: ServiceSelectedType) =>
  void mixpanelTrack(
    "SERVICES_SELECTED",
    buildEventProperties("UX", "action", {
      organization_name,
      service_id,
      service_name,
      source
    })
  );

export const trackInstitutionSelected = ({
  organization_fiscal_code,
  organization_name,
  source
}: InstitutionSelectedType) =>
  void mixpanelTrack(
    "SERVICES_ORGANIZATION_SELECTED",
    buildEventProperties("UX", "action", {
      organization_fiscal_code,
      organization_name,
      source
    })
  );

export const trackInstitutionDetails = ({
  organization_fiscal_code,
  organization_name,
  services_count = 0
}: InstitutionDetailsType) =>
  void mixpanelTrack(
    "SERVICES_ORGANIZATION_DETAIL",
    buildEventProperties("UX", "screen_view", {
      organization_fiscal_code,
      organization_name,
      services_count
    })
  );

export const trackInstitutionDetailsError = (
  organization_fiscal_code: string,
  reason: string
) =>
  void mixpanelTrack(
    "SERVICES_ORGANIZATION_DETAIL_ERROR",
    buildEventProperties("KO", undefined, { organization_fiscal_code, reason })
  );

export const trackServicesPreferences = () =>
  void mixpanelTrack(
    "SERVICES_PREFERENCES",
    buildEventProperties("UX", "action")
  );

export const trackServicesPreferencesSelected = (
  landing_page: "preferences_services" | "profile_main"
) =>
  void mixpanelTrack(
    "SERVICES_PREFERENCES_SELECTED",
    buildEventProperties("UX", "action", {
      landing_page
    })
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

export const trackServiceDetailsConsent = (props: ServiceDetailsConsentType) =>
  void mixpanelTrack(
    "SERVICES_DETAIL_CONSENT",
    buildEventProperties("UX", "screen_view", props)
  );

export const trackServiceConsentChanged = ({
  consent_type,
  ...rest
}: ServiceConsentChangedType) =>
  void mixpanelTrack(
    "SERVICES_CONSENT_CHANGED",
    buildEventProperties("UX", "action", {
      ...rest,
      consent_type: ConsentTypeLabels[consent_type]
    })
  );

export const trackServiceDetailsUserExit = (
  props: ServiceDetailsUserExitType
) =>
  void mixpanelTrack(
    "SERVICES_DETAIL_USER_EXIT",
    buildEventProperties("UX", "exit", props)
  );

export const trackServicesCgnStartRequest = (service_id: string) =>
  void mixpanelTrack(
    "SERVICES_CGN_START_REQUEST",
    buildEventProperties("UX", "action", {
      service_id
    })
  );

export const trackSpecialServiceStatusChanged = (
  props: SpecialServiceStatusChangedType
) =>
  void mixpanelTrack(
    "SERVICES_SPECIAL_SERVICE_STATUS_CHANGED",
    buildEventProperties("UX", "action", props)
  );

export const trackServiceDetailsError = (service_id: string, reason: string) =>
  void mixpanelTrack(
    "SERVICES_DETAIL_ERROR",
    buildEventProperties("KO", undefined, { service_id, reason })
  );

export const trackServiceDetailsCtaTapped = (
  props: ServiceDetailsCtaTappedType
) =>
  void mixpanelTrack(
    "SERVICES_DETAIL_CTA_TAPPED",
    buildEventProperties("UX", "action", props)
  );

/**
 * Isolated tracker for services actions
 */
export const trackServicesAction = (action: Action): void => {
  switch (action.type) {
    // Services home
    case getType(paginatedInstitutionsGet.failure):
      return trackServicesHomeError(
        getNetworkErrorMessage(action.payload),
        "main_list"
      );
    case getType(featuredServicesGet.failure):
      return trackServicesHomeError(
        getNetworkErrorMessage(action.payload),
        "featured_services"
      );
    case getType(featuredInstitutionsGet.failure):
      return trackServicesHomeError(
        getNetworkErrorMessage(action.payload),
        "featured_organizations"
      );
    // Search results
    case getType(searchPaginatedInstitutionsGet.success):
      return trackSearchResult(action.payload.count);
    case getType(searchPaginatedInstitutionsGet.failure):
      return trackSearchError(getNetworkErrorMessage(action.payload));
    // Institution details
    case getType(paginatedServicesGet.failure):
      return trackInstitutionDetailsError(
        action.payload.id,
        getNetworkErrorMessage(action.payload)
      );
    // Service details
    case getType(loadServicePreference.failure):
      return trackServiceDetailsError(
        action.payload.id,
        getNetworkErrorMessage(action.payload)
      );
  }
};
