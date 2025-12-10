import { ContentWrapper, VStack } from "@pagopa/io-app-design-system";
import { useFocusEffect, useLinkTo } from "@react-navigation/native";
import { useCallback, useEffect, useMemo } from "react";
import { ImageSourcePropType, StyleSheet, View } from "react-native";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { logosForService } from "../../common/utils";
import { getServiceCTAs, handleCtaAction } from "../../../messages/utils/ctas";
import { useFIMSFromServiceId } from "../../../fims/common/hooks";
import { ServiceDetailsScreenComponent } from "../components/ServiceDetailsScreenComponent";
import { CTA } from "../../../../types/LocalizedCTAs";
import { ServiceDetails } from "../../../../../definitions/services/ServiceDetails";
import * as analytics from "../../common/analytics";
import { CtaCategoryType } from "../../common/analytics";
import { ServicesHeaderSection } from "../../common/components/ServicesHeaderSection";
import { useFirstRender } from "../../common/hooks/useFirstRender";
import { ServicesParamsList } from "../../common/navigation/params";
import {
  CardWithMarkdownContent,
  CardWithMarkdownContentSkeleton
} from "../components/CardWithMarkdownContent";
import { FavouriteServiceButton } from "../components/FavouriteServiceButton";
import { ServiceDetailsFailure } from "../components/ServiceDetailsFailure";
import { ServiceDetailsMetadata } from "../components/ServiceDetailsMetadata";
import { ServiceDetailsPreferences } from "../components/ServiceDetailsPreferences";
import { ServiceDetailsTosAndPrivacy } from "../components/ServiceDetailsTosAndPrivacy";
import { loadServiceDetail } from "../store/actions/details";
import { loadServicePreference } from "../store/actions/preference";
import {
  isErrorServiceDetailsByIdSelector,
  isLoadingServiceDetailsByIdSelector,
  serviceDetailsByIdSelector,
  serviceMetadataInfoSelector
} from "../store/selectors";

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

  const dispatch = useIODispatch();
  const isFirstRender = useFirstRender();

  const service = useIOSelector(state =>
    serviceDetailsByIdSelector(state, serviceId)
  );

  const isLoading = useIOSelector(state =>
    isLoadingServiceDetailsByIdSelector(state, serviceId)
  );

  const isError = useIOSelector(state =>
    isErrorServiceDetailsByIdSelector(state, serviceId)
  );

  useEffect(() => {
    dispatch(loadServiceDetail.request(serviceId));
  }, [dispatch, serviceId]);

  useFocusEffect(
    useCallback(() => {
      dispatch(loadServicePreference.request(serviceId));
    }, [serviceId, dispatch])
  );

  if (isError) {
    return <ServiceDetailsFailure serviceId={serviceId} />;
  }

  if (isFirstRender || isLoading) {
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

  return <ServiceDetailsContent activate={activate} service={service} />;
};

type ServiceDetailsContentProps = {
  activate: boolean;
  service: ServiceDetails;
};

const ServiceDetailsContent = ({
  activate,
  service
}: ServiceDetailsContentProps) => {
  const { description, id, metadata, name, organization } = service;

  const linkTo = useLinkTo();

  const { startFIMSAuthenticationFlow } = useFIMSFromServiceId(id);

  const serviceMetadataInfo = useIOSelector(state =>
    serviceMetadataInfoSelector(state, id)
  );

  useOnFirstRender(() => {
    analytics.trackServiceDetails({
      bottom_cta_available: !!metadata.cta,
      organization_fiscal_code: organization.fiscal_code,
      organization_name: organization.name,
      service_category: serviceMetadataInfo.isSpecialService
        ? "special"
        : "standard",
      service_id: id,
      service_name: name
    });
  });

  const ctas = useMemo(() => getServiceCTAs(id, metadata), [id, metadata]);

  const handlePressCta = (cta: CTA, ctaType: CtaCategoryType) => {
    analytics.trackServiceDetailsCtaTapped({
      cta_category: ctaType,
      service_id: id
    });
    handleCtaAction(cta, linkTo, (label, url) =>
      startFIMSAuthenticationFlow(label, url)
    );
  };

  return (
    <ServiceDetailsScreenComponent
      activate={activate}
      ctas={ctas}
      kind={serviceMetadataInfo.serviceKind}
      onPressCta={handlePressCta}
      serviceId={id}
      title={service.name}
    >
      <ServicesHeaderSection
        extraBottomPadding={headerPaddingBottom}
        logoUri={logosForService(service) as ImageSourcePropType}
        title={name}
        subTitle={organization.name}
      />
      <VStack space={40}>
        <VStack
          space={16}
          style={{
            marginTop: -headerPaddingBottom,
            minHeight: headerPaddingBottom
          }}
        >
          <ContentWrapper>
            <FavouriteServiceButton service={service} />
          </ContentWrapper>
          <CardWithMarkdownContent content={description} />
        </VStack>
        <ServiceDetailsTosAndPrivacy serviceId={id} />
        <ServiceDetailsPreferences serviceId={id} />
        <ServiceDetailsMetadata
          organizationFiscalCode={organization.fiscal_code}
          serviceId={id}
        />
      </VStack>
    </ServiceDetailsScreenComponent>
  );
};
