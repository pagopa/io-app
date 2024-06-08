import { getType } from "typesafe-actions";
import { mixpanel, mixpanelTrack } from "../../../../mixpanel";
import { Action } from "../../../../store/actions/types";
import { buildEventProperties } from "../../../../utils/analytics";
import { searchPaginatedInstitutionsGet } from "../../search/store/actions";
import { getNetworkErrorMessage } from "../../../../utils/errors";
import { paginatedServicesGet } from "../../institution/store/actions";
import {
  featuredInstitutionsGet,
  featuredServicesGet,
  paginatedInstitutionsGet
} from "../../home/store/actions";
import { loadServicePreference } from "../../details/store/actions/preference";

type ServiceBaseType = {
  service_name: string;
} & InstitutionBaseType;

type InstitutionBaseType = {
  organization_name: string;
};

type ServiceDetailsType = {
  bottom_cta_available: boolean;
  organization_fiscal_code: string;
  service_category: "special" | "standard";
  service_id: string;
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
  sevices_count: number;
} & InstitutionBaseType;

type ServiceSelectedType = {
  source: "featured_services" | "organization_detail";
} & ServiceBaseType;

type InstitutionSelectedType = {
  source:
    | "featured_organizations"
    | "main_list"
    | "search_list"
    | "recent_list";
} & InstitutionBaseType;

export type SearchStartType = {
  source: "bottom_link" | "header_icon" | "search_bar";
};

export const trackServicesHome = () =>
  void mixpanelTrack("SERVICES", buildEventProperties("UX", "screen_view"));

export const trackServicesHomeError = (
  reason: string,
  source: "featured_services" | "main_list" | "organization_detail"
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
  organization_fiscal_code,
  organization_name,
  sevices_count = 0
}: InstitutionDetailsType) =>
  void mixpanelTrack(
    "SERVICES_ORGANIZATION_DETAIL",
    buildEventProperties("UX", "screen_view", {
      organization_fiscal_code,
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

/**
 * Isolated tracker for services actions
 */
export const trackServicesAction =
  (_: NonNullable<typeof mixpanel>) =>
  (action: Action): void => {
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
          "organization_detail"
        );
      // Search results
      case getType(searchPaginatedInstitutionsGet.success):
        return trackSearchResult(action.payload.count);
      case getType(searchPaginatedInstitutionsGet.failure):
        return trackSearchError(getNetworkErrorMessage(action.payload));
      // Institution details
      case getType(paginatedServicesGet.failure):
        return trackInstitutionDetailsError(
          getNetworkErrorMessage(action.payload)
        );
      // Service details
      case getType(loadServicePreference.failure):
        return trackServiceDetailsError(getNetworkErrorMessage(action.payload));
    }
  };
