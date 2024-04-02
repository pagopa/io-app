import React, { useEffect, useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import {
  ContentWrapper,
  IOColors,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { ServicesParamsList } from "../navigation/params";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import {
  isErrorServiceByIdSelector,
  isLoadingServiceByIdSelector,
  serviceByIdSelector
} from "../store/reducers/servicesById";
import { loadServiceDetail } from "../../../store/actions/services";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { ServiceDetailsHeader } from "../components/ServiceDetailsHeader";
import { logosForService } from "../../../utils/services";
import { CardWithMarkdownContent } from "../components/CardWithMarkdownContent";
import { ServiceDetailsFailure } from "../components/ServiceDetailsFailure";
import { ServiceDetailsPreferences } from "../components/ServiceDetailsPreferences";
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

const headerPaddingBottom = 138;

const styles = StyleSheet.create({
  scrollContentContainer: {
    flexGrow: 1
  },
  headerContainer: {
    backgroundColor: IOColors["grey-50"],
    paddingBottom: headerPaddingBottom
  },
  cardContainer: {
    marginHorizontal: IOVisualCostants.appMarginDefault,
    marginTop: -headerPaddingBottom,
    minHeight: headerPaddingBottom
  }
});

export const ServiceDetailsScreen = ({ route }: ServiceDetailsScreenProps) => {
  const { serviceId } = route.params;

  const dispatch = useIODispatch();

  useEffect(() => {
    dispatch(loadServiceDetail.request(serviceId));
    dispatch(loadServicePreference.request(serviceId));
  }, [dispatch, serviceId]);

  const serviceById = useIOSelector(state =>
    serviceByIdSelector(state, serviceId)
  );

  const isLoadingServiceById = useIOSelector(state =>
    isLoadingServiceByIdSelector(state, serviceId)
  );

  const isErrorServiceById = useIOSelector(state =>
    isErrorServiceByIdSelector(state, serviceId)
  );

  if (!serviceById) {
    return null;
  }

  if (isErrorServiceById) {
    return <ServiceDetailsFailure serviceId={serviceId} />;
  }

  if (isLoadingServiceById) {
    // TODO: add a loading screen
  }

  return <ServiceDetailsContent service={serviceById} />;
};

const scrollTriggerOffsetValue: number = 88;
const windowHeight = Dimensions.get("window").height;

type ServiceDetailsContentProps = {
  service: ServicePublic;
};

const ServiceDetailsContent = ({ service }: ServiceDetailsContentProps) => {
  const safeAreaInsets = useSafeAreaInsets();

  const headerHeight = useHeaderHeight();
  const scrollTranslationY = useSharedValue(0);

  const safeBottomAreaHeight: number = useMemo(
    () =>
      safeAreaInsets.bottom === 0
        ? IOVisualCostants.appMarginDefault
        : safeAreaInsets.bottom,
    [safeAreaInsets]
  );

  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    transparent: true,
    scrollValues: {
      triggerOffset: scrollTriggerOffsetValue,
      contentOffsetY: scrollTranslationY
    }
  });

  const scrollHandler = useAnimatedScrollHandler(({ contentOffset }) => {
    // eslint-disable-next-line functional/immutable-data
    scrollTranslationY.value = contentOffset.y;
  });

  const {
    organization_name,
    service_id,
    service_name,
    available_notification_channels,
    service_metadata
  } = service;

  return (
    <Animated.ScrollView
      contentContainerStyle={[
        styles.scrollContentContainer,
        {
          paddingBottom: safeBottomAreaHeight
        }
      ]}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      snapToOffsets={[0, scrollTriggerOffsetValue]}
      snapToEnd={false}
      decelerationRate="normal"
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
      {service_metadata?.description ? (
        <View style={styles.cardContainer}>
          <CardWithMarkdownContent content={service_metadata.description} />
        </View>
      ) : null}

      <ContentWrapper>
        <VSpacer size={40} />
        <ServiceDetailsPreferences
          serviceId={service_id}
          availableChannels={available_notification_channels}
        />
      </ContentWrapper>
    </Animated.ScrollView>
  );
};
