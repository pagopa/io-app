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
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { FIMS_ROUTES } from "../navigation";
import { removeFIMSPrefixFromUrl } from "../../singleSignOn/utils";
import { isTestEnv } from "../../../../utils/environment";
import { fimsServiceConfiguration } from "../../../../store/reducers/backendStatus/remoteConfig";

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

export const useFIMSFromServiceId = (serviceId: ServiceId) => {
  const serviceData = useServiceDataFromServiceId(serviceId);
  const startFIMSAuthenticationFlow = useFIMSFromServiceData(serviceData);
  return useMemo(
    () => ({
      serviceData,
      startFIMSAuthenticationFlow
    }),
    [serviceData, startFIMSAuthenticationFlow]
  );
};

export const useFIMSRemoteServiceConfiguration = (configurationId: string) => {
  const serviceData = useServiceDataFromConfigurationId(configurationId);
  const startFIMSAuthenticationFlow = useFIMSFromServiceData(serviceData);
  return useMemo(
    () => ({
      serviceData,
      startFIMSAuthenticationFlow
    }),
    [serviceData, startFIMSAuthenticationFlow]
  );
};

type FIMSServiceData = {
  organizationFiscalCode?: string;
  organizationName?: string;
  serviceId: ServiceId;
  serviceName?: string;
};

const useFIMSFromServiceData = (serviceData: FIMSServiceData | undefined) => {
  const navigation = useIONavigation();

  const source = navigation.getState().key;

  return useCallback(
    (label: string, url: string) => {
      if (serviceData == null) {
        return;
      }
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
    },
    [navigation, serviceData, source]
  );
};

const useServiceDataFromServiceId = (
  serviceId: ServiceId
): FIMSServiceData | undefined => {
  const store = useIOStore();
  return useMemo(() => {
    const service = serviceByIdSelector(store.getState(), serviceId);
    return service != null
      ? {
          organizationFiscalCode: service.organization_fiscal_code,
          organizationName: service.organization_name,
          serviceId: service.service_id,
          serviceName: service.service_name
        }
      : undefined;
  }, [serviceId, store]);
};

const useServiceDataFromConfigurationId = (
  configurationId: string
): FIMSServiceData | undefined => {
  const store = useIOStore();
  return useMemo(() => {
    const serviceConfiguration = fimsServiceConfiguration(
      store.getState(),
      configurationId
    );
    return serviceConfiguration != null
      ? {
          organizationFiscalCode: serviceConfiguration.organization_fiscal_code,
          organizationName: serviceConfiguration.organization_name,
          serviceId: serviceConfiguration.service_id as ServiceId,
          serviceName: serviceConfiguration.service_name
        }
      : undefined;
  }, [configurationId, store]);
};

export const testable = isTestEnv
  ? {
      useFIMSFromServiceData,
      useServiceDataFromConfigurationId,
      useServiceDataFromServiceId
    }
  : undefined;
