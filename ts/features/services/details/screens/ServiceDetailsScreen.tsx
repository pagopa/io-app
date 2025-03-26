import { VStack } from "@pagopa/io-app-design-system";
import { useFocusEffect, useLinkTo } from "@react-navigation/native";
import { useCallback, useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { logosForService } from "../../common/utils";
import { getServiceCTAs, handleCtaAction } from "../../../messages/utils/ctas";
import { useFIMSFromServiceId } from "../../../fims/common/hooks";
import { ServiceDetailsScreenComponent } from "../components/ServiceDetailsScreenComponent";
import { CTA } from "../../../../types/LocalizedCTAs";
import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import * as analytics from "../../common/analytics";
import { CtaCategoryType } from "../../common/analytics";
import { ServicesHeaderSection } from "../../common/components/ServicesHeaderSection";
import { useFirstRender } from "../../common/hooks/useFirstRender";
import { ServicesParamsList } from "../../common/navigation/params";
import {
  CardWithMarkdownContent,
  CardWithMarkdownContentSkeleton
} from "../components/CardWithMarkdownContent";
import { ServiceDetailsFailure } from "../components/ServiceDetailsFailure";
import { ServiceDetailsMetadata } from "../components/ServiceDetailsMetadata";
import { ServiceDetailsPreferences } from "../components/ServiceDetailsPreferences";
import { ServiceDetailsTosAndPrivacy } from "../components/ServiceDetailsTosAndPrivacy";
import { loadServiceDetail } from "../store/actions/details";
import { loadServicePreference } from "../store/actions/preference";
import {
  isErrorServiceByIdSelector,
  isLoadingServiceByIdSelector,
  serviceByIdSelector,
  serviceMetadataByIdSelector,
  serviceMetadataInfoSelector
} from "../store/reducers";

export type ServiceDetailsScreenRouteParams = {
  serviceId: ServiceId;
  // if true the service should be activated automatically
  // as soon as the screen is shown (used for custom activation
  // flows like PN)
  activate?: boolean;
};

type ServiceDetailsScreenProps = IOStackNavigationRouteProps<
  ServicesParamsList,
  "SERVICE_DETAIL"
>;

const headerPaddingBottom: number = 138;

const styles = StyleSheet.create({
  cardContainer: {
    marginTop: -headerPaddingBottom,
    minHeight: headerPaddingBottom
  }
});

export const ServiceDetailsScreen = ({ route }: ServiceDetailsScreenProps) => {
  const { serviceId, activate = false } = route.params;

  const linkTo = useLinkTo();
  const dispatch = useIODispatch();
  const isFirstRender = useFirstRender();

  const service = useIOSelector(state => serviceByIdSelector(state, serviceId));

  const isLoadingService = useIOSelector(state =>
    isLoadingServiceByIdSelector(state, serviceId)
  );

  const isErrorService = useIOSelector(state =>
    isErrorServiceByIdSelector(state, serviceId)
  );

  const serviceMetadata = useIOSelector(state =>
    serviceMetadataByIdSelector(state, serviceId)
  );

  const serviceMetadataInfo = useIOSelector(state =>
    serviceMetadataInfoSelector(state, serviceId)
  );

  const serviceCtas = useMemo(
    () => getServiceCTAs(serviceId, serviceMetadata),
    [serviceId, serviceMetadata]
  );

  const { startFIMSAuthenticationFlow } = useFIMSFromServiceId(serviceId);

  useOnFirstRender(
    () => {
      analytics.trackServiceDetails({
        bottom_cta_available: !!serviceMetadata?.cta,
        organization_fiscal_code: service?.organization_fiscal_code ?? "",
        organization_name: service?.organization_name ?? "",
        service_category: serviceMetadataInfo.isSpecialService
          ? "special"
          : "standard",
        service_id: serviceId,
        service_name: service?.service_name ?? ""
      });
    },
    () => !!service
  );

  useEffect(() => {
    dispatch(loadServiceDetail.request(serviceId));
  }, [dispatch, serviceId]);

  useFocusEffect(
    useCallback(() => {
      dispatch(loadServicePreference.request(serviceId));
    }, [serviceId, dispatch])
  );

  if (isErrorService) {
    return <ServiceDetailsFailure serviceId={serviceId} />;
  }

  if (isFirstRender || isLoadingService) {
    return (
      <ServiceDetailsScreenComponent>
        <ServicesHeaderSection
          extraBottomPadding={headerPaddingBottom}
          isLoading={true}
        />
        <VStack space={40}>
          <View style={styles.cardContainer}>
            <CardWithMarkdownContentSkeleton />
          </View>
        </VStack>
      </ServiceDetailsScreenComponent>
    );
  }

  if (!service) {
    return null;
  }

  const handlePressCta = (cta: CTA, ctaType: CtaCategoryType) => {
    analytics.trackServiceDetailsCtaTapped({
      cta_category: ctaType,
      service_id: serviceId
    });
    handleCtaAction(cta, linkTo, (label, url) =>
      startFIMSAuthenticationFlow(label, url)
    );
  };

  return (
    <ServiceDetailsScreenComponent
      activate={activate}
      ctas={serviceCtas}
      kind={serviceMetadataInfo.serviceKind}
      onPressCta={handlePressCta}
      serviceId={serviceId}
      title={service.service_name}
    >
      <ServiceDetailsContent service={service} />
    </ServiceDetailsScreenComponent>
  );
};

type ServiceDetailsContentProps = {
  service: ServicePublic;
};

const ServiceDetailsContent = ({ service }: ServiceDetailsContentProps) => {
  const {
    organization_name,
    organization_fiscal_code,
    service_id,
    service_name,
    available_notification_channels,
    service_metadata
  } = service;

  return (
    <>
      <ServicesHeaderSection
        extraBottomPadding={headerPaddingBottom}
        logoUri={logosForService(service)}
        title={service_name}
        subTitle={organization_name}
      />
      <VStack space={40}>
        {service_metadata?.description && (
          <View style={styles.cardContainer}>
            <CardWithMarkdownContent content={service_metadata.description} />
          </View>
        )}
        <ServiceDetailsTosAndPrivacy serviceId={service_id} />
        <ServiceDetailsPreferences
          serviceId={service_id}
          availableChannels={available_notification_channels}
        />
        <ServiceDetailsMetadata
          organizationFiscalCode={organization_fiscal_code}
          serviceId={service_id}
        />
      </VStack>
    </>
  );
};
