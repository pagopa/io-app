import React, { useCallback, useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect } from "@react-navigation/native";
import {
  ContentWrapper,
  IOColors,
  VSpacer
} from "@pagopa/io-app-design-system";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { loadServiceDetail } from "../../../store/actions/services";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { logosForService } from "../../../utils/services";
import { CardWithMarkdownContent } from "../components/CardWithMarkdownContent";
import { ServiceDetailsFailure } from "../components/ServiceDetailsFailure";
import { ServiceDetailsHeader } from "../components/ServiceDetailsHeader";
import { ServiceDetailsMetadata } from "../components/ServiceDetailsMetadata";
import { ServiceDetailsPreferences } from "../components/ServiceDetailsPreferences";
import { ServiceDetailsScreenComponent } from "../components/ServiceDetailsScreenComponent";
import { ServiceDetailsTosAndPrivacy } from "../components/ServiceDetailsTosAndPrivacy";
import { ServicesParamsList } from "../navigation/params";
import {
  isErrorServiceByIdSelector,
  isLoadingServiceByIdSelector,
  serviceByIdSelector
} from "../store/reducers/servicesById";
import { loadServicePreference } from "../store/actions";

export type ServiceDetailsScreenNavigationParams = Readonly<{
  serviceId: ServiceId;
  // if true the service should be activated automatically
  // as soon as the screen is shown (used for custom activation
  // flows like PN)
  activate?: boolean;
}>;

type ServiceDetailsScreenProps = IOStackNavigationRouteProps<
  ServicesParamsList,
  "SERVICE_DETAIL"
>;

export const headerPaddingBottom = 138;

const windowHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: IOColors["grey-50"],
    paddingBottom: headerPaddingBottom
  },
  cardContainer: {
    marginTop: -headerPaddingBottom,
    minHeight: headerPaddingBottom
  }
});

export const ServiceDetailsScreen = ({ route }: ServiceDetailsScreenProps) => {
  const { serviceId, activate } = route.params;

  const dispatch = useIODispatch();

  const headerHeight = useHeaderHeight();

  const service = useIOSelector(state => serviceByIdSelector(state, serviceId));

  const isLoadingService = useIOSelector(state =>
    isLoadingServiceByIdSelector(state, serviceId)
  );

  const isErrorService = useIOSelector(state =>
    isErrorServiceByIdSelector(state, serviceId)
  );

  useEffect(() => {
    dispatch(loadServiceDetail.request(serviceId));
  }, [dispatch, serviceId]);

  useFocusEffect(
    useCallback(() => {
      dispatch(loadServicePreference.request(serviceId));
    }, [serviceId, dispatch])
  );

  if (!service) {
    return null;
  }

  if (isErrorService) {
    return <ServiceDetailsFailure serviceId={serviceId} />;
  }

  if (isLoadingService) {
    // TODO: add a loading screen
  }

  const {
    organization_name,
    organization_fiscal_code,
    service_id,
    service_name,
    available_notification_channels,
    service_metadata
  } = service;

  return (
    <ServiceDetailsScreenComponent
      activate={activate}
      title={service_name}
      serviceId={service_id}
    >
      <View
        style={[
          styles.headerContainer,
          {
            paddingTop: windowHeight + headerHeight,
            marginTop: -windowHeight
          }
        ]}
      >
        <ContentWrapper>
          <ServiceDetailsHeader
            logoUri={logosForService(service)}
            organizationName={organization_name}
            serviceName={service_name}
          />
          <VSpacer size={16} />
        </ContentWrapper>
      </View>

      <ContentWrapper>
        {service_metadata?.description && (
          <View style={styles.cardContainer}>
            <CardWithMarkdownContent content={service_metadata.description} />
          </View>
        )}

        <ServiceDetailsTosAndPrivacy serviceId={service_id} />

        <VSpacer size={40} />
        <ServiceDetailsPreferences
          serviceId={service_id}
          availableChannels={available_notification_channels}
        />

        <VSpacer size={40} />
        <ServiceDetailsMetadata
          organizationFiscalCode={organization_fiscal_code}
          serviceId={service_id}
        />
      </ContentWrapper>
    </ServiceDetailsScreenComponent>
  );
};
