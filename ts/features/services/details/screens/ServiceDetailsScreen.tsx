import React, { useCallback, useEffect, useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect, useLinkTo } from "@react-navigation/native";
import {
  ContentWrapper,
  IOColors,
  VSpacer
} from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { loadServiceDetail } from "../store/actions/details";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { logosForService } from "../../../../utils/services";
import {
  CardWithMarkdownContent,
  CardWithMarkdownContentSkeleton
} from "../components/CardWithMarkdownContent";
import { ServiceDetailsFailure } from "../components/ServiceDetailsFailure";
import {
  ServiceDetailsHeader,
  ServiceDetailsHeaderSkeleton
} from "../components/ServiceDetailsHeader";
import { ServiceDetailsMetadata } from "../components/ServiceDetailsMetadata";
import { ServiceDetailsPreferences } from "../components/ServiceDetailsPreferences";
import {
  ServiceActionsProps,
  ServiceDetailsScreenComponent
} from "../components/ServiceDetailsScreenComponent";
import { ServiceDetailsTosAndPrivacy } from "../components/ServiceDetailsTosAndPrivacy";
import { ServicesParamsList } from "../../common/navigation/params";
import {
  isErrorServiceByIdSelector,
  isLoadingServiceByIdSelector,
  serviceByIdSelector,
  serviceMetadataByIdSelector,
  serviceMetadataInfoSelector
} from "../store/reducers/servicesById";
import { loadServicePreference } from "../store/actions/preference";
import { CTA, CTAS } from "../../../messages/types/MessageCTA";
import {
  getServiceCTA,
  handleCtaAction
} from "../../../messages/utils/messages";
import { ServiceMetadataInfo } from "../types/ServiceMetadataInfo";
import { useFirstRender } from "../../common/hooks/useFirstRender";

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

  const linkTo = useLinkTo();
  const dispatch = useIODispatch();
  const headerHeight = useHeaderHeight();
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
    () => pipe(serviceMetadata, getServiceCTA, O.toUndefined),
    [serviceMetadata]
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

  if (isFirstRender || isLoadingService) {
    return (
      <ServiceDetailsScreenComponent>
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
            <ServiceDetailsHeaderSkeleton />
            <VSpacer size={16} />
          </ContentWrapper>
        </View>
        <ContentWrapper>
          <View style={styles.cardContainer}>
            <CardWithMarkdownContentSkeleton />
          </View>
        </ContentWrapper>
      </ServiceDetailsScreenComponent>
    );
  }

  const handlePressCta = (cta: CTA) => handleCtaAction(cta, linkTo);

  const getActionsProps = (
    ctas?: CTAS,
    serviceMetadataInfo?: ServiceMetadataInfo
  ): ServiceActionsProps | undefined => {
    const customSpecialFlow = serviceMetadataInfo?.customSpecialFlow;
    const isSpecialService = serviceMetadataInfo?.isSpecialService ?? false;

    if (isSpecialService && ctas?.cta_1 && ctas.cta_2) {
      const { cta_1, cta_2 } = ctas;

      return {
        type: "TwoCtasWithCustomFlow",
        primaryActionProps: {
          serviceId,
          activate,
          customSpecialFlowOpt: customSpecialFlow
        },
        secondaryActionProps: {
          label: cta_1.text,
          accessibilityLabel: cta_1.text,
          onPress: () => handlePressCta(cta_1)
        },
        tertiaryActionProps: {
          label: cta_2.text,
          accessibilityLabel: cta_2.text,
          onPress: () => handlePressCta(cta_2)
        }
      };
    }

    if (isSpecialService && ctas?.cta_1) {
      const { cta_1 } = ctas;

      return {
        type: "SingleCtaWithCustomFlow",
        primaryActionProps: {
          serviceId,
          activate,
          customSpecialFlowOpt: customSpecialFlow
        },
        secondaryActionProps: {
          label: cta_1.text,
          accessibilityLabel: cta_1.text,
          onPress: () => handlePressCta(cta_1)
        }
      };
    }

    if (ctas?.cta_1 && ctas?.cta_2) {
      const { cta_1, cta_2 } = ctas;

      return {
        type: "TwoCtas",
        primaryActionProps: {
          label: cta_1.text,
          accessibilityLabel: cta_1.text,
          onPress: () => handlePressCta(cta_1)
        },
        secondaryActionProps: {
          label: cta_2.text,
          accessibilityLabel: cta_2.text,
          onPress: () => handlePressCta(cta_2)
        }
      };
    }

    if (ctas?.cta_1) {
      return {
        type: "SingleCta",
        primaryActionProps: {
          label: ctas.cta_1.text,
          accessibilityLabel: ctas.cta_1.text,
          onPress: () => handlePressCta(ctas.cta_1)
        }
      };
    }

    if (isSpecialService) {
      return {
        type: "SingleCtaCustomFlow",
        primaryActionProps: {
          serviceId,
          activate,
          customSpecialFlowOpt: customSpecialFlow
        }
      };
    }

    return undefined;
  };

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
      actionsProps={getActionsProps(
        serviceCtas,
        serviceMetadataInfo as ServiceMetadataInfo
      )}
      title={service_name}
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
