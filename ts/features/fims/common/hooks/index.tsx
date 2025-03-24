import { useCallback, useEffect, useMemo } from "react";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import {
  serviceByIdPotSelector,
  serviceByIdSelector
} from "../../../services/details/store/reducers";
import { loadServiceDetail } from "../../../services/details/store/actions/details";
import { isStrictNone } from "../../../../utils/pot";
import {
  AppParamsList,
  IOStackNavigationProp,
  useIONavigation
} from "../../../../navigation/params/AppParamsList";
import { FIMS_ROUTES } from "../navigation";
import { removeFIMSPrefixFromUrl } from "../../singleSignOn/utils";
import { isTestEnv } from "../../../../utils/environment";
import { fimsServiceConfiguration } from "../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../store/reducers/types";

export type FIMSServiceData = {
  organizationFiscalCode?: string;
  organizationName?: string;
  serviceId: ServiceId;
  serviceName?: string;
};

export const useAutoFetchingServiceByIdPot = (serviceId: ServiceId) => {
  const dispatch = useIODispatch();
  const serviceData = useIOSelector(state =>
    serviceByIdPotSelector(state, serviceId)
  );

  useEffect(() => {
    const shouldFetchServiceData =
      isStrictNone(serviceData) || serviceData.kind === "PotNoneError";

    if (shouldFetchServiceData) {
      dispatch(loadServiceDetail.request(serviceId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, serviceId]);

  return serviceData;
};

/**
 * Use this hook to retrieve a function that starts the FIMS authentication flow.
 * Choose this hook when the service data is already loaded into redux
 * (e.g., when coming from a message details or service details).
 */
export const useFIMSFromServiceId = (serviceId: ServiceId) => {
  const store = useIOStore();
  const serviceData = useMemo(
    () => serviceDataFromServiceId(serviceId, store.getState()),
    [serviceId, store]
  );
  const startFIMSAuthenticationFlow = useFIMSFromServiceData(serviceData);
  return useMemo(
    () => ({
      serviceData,
      startFIMSAuthenticationFlow
    }),
    [serviceData, startFIMSAuthenticationFlow]
  );
};

/**
 * Use this hook to retrieve a function that starts the FIMS authentication flow.
 * Choose this hook when the service id is not available upon hook invocation
 * but it will be later, when the returned function is called.
 */
export const useFIMSAuthenticationFlow = () => {
  const navigation = useIONavigation();
  const store = useIOStore();
  return useCallback(
    (label: string, serviceId: ServiceId, url: string) => {
      const serviceData = serviceDataFromServiceId(serviceId, store.getState());
      if (serviceData == null) {
        return;
      }
      navigateToFIMSAuthorizationFlow(label, navigation, serviceData, url);
    },
    [navigation, store]
  );
};

/**
 * Use this hook to retrieve a function that starts the FIMS authentication flow.
 * Choose this hook when the service data are stored into the remote CDN and you
 * know the configuration id that identifies and retrieves such data.
 */
export const useFIMSRemoteServiceConfiguration = (configurationId: string) => {
  const store = useIOStore();
  const serviceData = useMemo(
    () => serviceDataFromConfigurationId(configurationId, store.getState()),
    [configurationId, store]
  );
  const startFIMSAuthenticationFlow = useFIMSFromServiceData(serviceData);
  return useMemo(
    () => ({
      serviceData,
      startFIMSAuthenticationFlow
    }),
    [serviceData, startFIMSAuthenticationFlow]
  );
};

const serviceDataFromServiceId = (
  serviceId: ServiceId,
  state: GlobalState
): FIMSServiceData => {
  const service = serviceByIdSelector(state, serviceId);
  return service != null
    ? {
        organizationFiscalCode: service.organization_fiscal_code,
        organizationName: service.organization_name,
        serviceId: service.service_id,
        serviceName: service.service_name
      }
    : { serviceId };
};

const serviceDataFromConfigurationId = (
  configurationId: string,
  state: GlobalState
): FIMSServiceData | undefined => {
  const serviceConfiguration = fimsServiceConfiguration(state, configurationId);
  return serviceConfiguration != null
    ? {
        organizationFiscalCode: serviceConfiguration.organization_fiscal_code,
        organizationName: serviceConfiguration.organization_name,
        serviceId: serviceConfiguration.service_id as ServiceId,
        serviceName: serviceConfiguration.service_name
      }
    : undefined;
};

const useFIMSFromServiceData = (
  serviceData: FIMSServiceData | undefined
): ((label: string, url: string) => void) => {
  const navigation = useIONavigation();
  return useCallback(
    (label: string, url: string) => {
      if (serviceData == null) {
        return;
      }
      navigateToFIMSAuthorizationFlow(label, navigation, serviceData, url);
    },
    [navigation, serviceData]
  );
};

const navigateToFIMSAuthorizationFlow = (
  label: string,
  navigation: IOStackNavigationProp<AppParamsList, keyof AppParamsList>,
  serviceData: FIMSServiceData,
  url: string
): void => {
  const navigationState = navigation.getState();
  const source = navigationState.routes[navigationState.index].name;

  const sanitizedUrl = removeFIMSPrefixFromUrl(url);
  navigation.navigate(FIMS_ROUTES.MAIN, {
    screen: FIMS_ROUTES.CONSENTS,
    params: {
      ctaUrl: sanitizedUrl,
      ctaText: label,
      organizationFiscalCode: serviceData.organizationFiscalCode,
      organizationName: serviceData.organizationName,
      serviceId: serviceData.serviceId,
      serviceName: serviceData.serviceName,
      source
    }
  });
};

export const testable = isTestEnv
  ? {
      navigateToFIMSAuthorizationFlow,
      serviceDataFromConfigurationId,
      serviceDataFromServiceId,
      useFIMSFromServiceData
    }
  : undefined;
