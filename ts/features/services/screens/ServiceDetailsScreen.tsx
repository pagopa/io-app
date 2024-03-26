import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import {
  ContentWrapper,
  IOColors,
  VSpacer
} from "@pagopa/io-app-design-system";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { ServicesParamsList } from "../navigation/params";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { serviceByIdSelector } from "../../../store/reducers/entities/services/servicesById";
import { loadServiceDetail } from "../../../store/actions/services";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { ServiceDetailsHeader } from "../components/ServiceDetailsHeader";
import { logosForService } from "../../../utils/services";

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

const styles = StyleSheet.create({
  scrollContentContainer: {
    flexGrow: 1
  },
  contentHeader: {
    backgroundColor: IOColors["grey-50"],
    paddingBottom: 138
  }
});

export const ServiceDetailsScreen = ({ route }: ServiceDetailsScreenProps) => {
  const { serviceId } = route.params;

  const dispatch = useIODispatch();

  const servicePot = useIOSelector(state =>
    serviceByIdSelector(state, serviceId)
  );

  useEffect(() => {
    dispatch(loadServiceDetail.request(serviceId));
  }, [dispatch, serviceId]);

  if (pot.isLoading(servicePot)) {
    // TODO: add a loading screen
  }

  return pipe(
    servicePot,
    pot.toOption,
    O.fold(
      () => (
        // TODO: add error screen
        <></>
      ),
      service => <ServiceDetailsContent service={service} />
    )
  );
};

const scrollTriggerOffsetValue: number = 88;
const windowHeight = Dimensions.get("window").height;

type ServiceDetailsContentProps = {
  service: ServicePublic;
};

const ServiceDetailsContent = ({ service }: ServiceDetailsContentProps) => {
  const headerHeight = useHeaderHeight();
  const scrollTranslationY = useSharedValue(0);

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

  return (
    <Animated.ScrollView
      contentContainerStyle={styles.scrollContentContainer}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      snapToOffsets={[0, scrollTriggerOffsetValue]}
      snapToEnd={false}
      decelerationRate="normal"
    >
      <View
        style={[
          styles.contentHeader,
          {
            paddingTop: windowHeight + headerHeight,
            marginTop: -windowHeight
          }
        ]}
      >
        <ContentWrapper>
          <ServiceDetailsHeader
            logoUri={logosForService(service)}
            organizationName={service.organization_name}
            serviceName={service.service_name}
          />
          <VSpacer size={16} />
        </ContentWrapper>
      </View>
    </Animated.ScrollView>
  );
};
