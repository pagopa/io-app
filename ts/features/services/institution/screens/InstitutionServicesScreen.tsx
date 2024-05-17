import React, { useCallback, useEffect, useLayoutEffect } from "react";
import { ListRenderItemInfo, RefreshControl, StyleSheet } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import {
  Divider,
  IOStyles,
  IOToast,
  IOVisualCostants,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useHeaderHeight } from "@react-navigation/elements";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { ServiceMinified } from "../../../../../definitions/services/ServiceMinified";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { ServicesHeaderSection } from "../../common/components/ServicesHeaderSection";
import { useFirstRender } from "../../common/hooks/useFirstRender";
import { ServicesParamsList } from "../../common/navigation/params";
import { SERVICES_ROUTES } from "../../common/navigation/routes";
import { getLogoForInstitution } from "../../common/utils";
import { InstitutionServicesFailure } from "../components/InstitutionServicesFailure";
import { ServiceListSkeleton } from "../components/ServiceListSkeleton";
import { useServicesFetcher } from "../hooks/useServicesFetcher";
import { paginatedServicesGet } from "../store/actions";

export type InstitutionServicesScreenRouteParams = {
  institutionId: string;
  institutionName: string;
};

type InstitutionServicesScreen = IOStackNavigationRouteProps<
  ServicesParamsList,
  "INSTITUTION_SERVICES"
>;

const scrollTriggerOffsetValue: number = 88;

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1
  },
  refreshControlContainer: {
    zIndex: 1
  }
});

export const InstitutionServicesScreen = ({
  navigation,
  route
}: InstitutionServicesScreen) => {
  const { institutionId, institutionName } = route.params;

  const dispatch = useIODispatch();
  const isFirstRender = useFirstRender();

  const headerHeight = useHeaderHeight();
  const scrollTranslationY = useSharedValue(0);

  const {
    currentPage,
    data,
    fetchServices,
    isError,
    isLoading,
    isUpdating,
    isRefreshing,
    refreshServices
  } = useServicesFetcher(institutionId);

  useOnFirstRender(() => fetchServices(0));

  useEffect(() => {
    if (!!data && isError) {
      IOToast.error(I18n.t("global.genericError"));
    }
  }, [data, isError]);

  const goBack = useCallback(() => {
    dispatch(paginatedServicesGet.cancel());
    navigation.goBack();
  }, [dispatch, navigation]);

  useHeaderSecondLevel({
    goBack,
    title: institutionName,
    supportRequest: true,
    transparent: true,
    scrollValues: {
      triggerOffset: scrollTriggerOffsetValue,
      contentOffsetY: scrollTranslationY
    }
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true
    });
  }, [navigation]);

  const scrollHandler = useAnimatedScrollHandler(event => {
    // eslint-disable-next-line functional/immutable-data
    scrollTranslationY.value = event.contentOffset.y;
  });

  const navigateToServiceDetails = useCallback(
    (service: ServiceMinified) =>
      navigation.navigate(SERVICES_ROUTES.SERVICES_NAVIGATOR, {
        screen: SERVICES_ROUTES.SERVICE_DETAIL,
        params: {
          serviceId: service.id as ServiceId
        }
      }),
    [navigation]
  );

  const handleEndReached = useCallback(
    () => fetchServices(currentPage + 1),
    [currentPage, fetchServices]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ServiceMinified>) => (
      <ListItemNav
        value={item.name}
        onPress={() => navigateToServiceDetails(item)}
        accessibilityLabel={item.name}
      />
    ),
    [navigateToServiceDetails]
  );

  const renderListEmptyComponent = useCallback(() => {
    if (isFirstRender || isLoading) {
      return (
        <>
          <ServiceListSkeleton size={5} />
          <VSpacer size={16} />
        </>
      );
    }
    return <></>;
  }, [isFirstRender, isLoading]);

  const renderListHeaderComponent = useCallback(() => {
    if (isFirstRender || isLoading) {
      return (
        <>
          <ServicesHeaderSection isLoading={true} />
          <VSpacer size={16} />
        </>
      );
    }

    return (
      <>
        <ServicesHeaderSection
          logoUri={getLogoForInstitution(institutionId)}
          title={institutionName}
          subTitle={I18n.t("services.institution.header.subtitle", {
            count: data?.count ?? 0
          })}
        />
        <VSpacer size={16} />
      </>
    );
  }, [data?.count, isFirstRender, isLoading, institutionId, institutionName]);

  const renderListFooterComponent = useCallback(() => {
    if (isUpdating && !isRefreshing) {
      return (
        <>
          <ServiceListSkeleton />
          <VSpacer size={16} />
        </>
      );
    }
    return <VSpacer size={16} />;
  }, [isUpdating, isRefreshing]);

  if (!data && isError) {
    return <InstitutionServicesFailure onRetry={() => fetchServices(0)} />;
  }

  const refreshControl = (
    <RefreshControl
      onRefresh={refreshServices}
      progressViewOffset={headerHeight}
      refreshing={isRefreshing}
      style={styles.refreshControlContainer}
    />
  );

  return (
    <Animated.FlatList
      onScroll={scrollHandler}
      ItemSeparatorComponent={() => <Divider />}
      ListEmptyComponent={renderListEmptyComponent}
      ListHeaderComponent={renderListHeaderComponent}
      ListHeaderComponentStyle={{
        marginHorizontal: -IOVisualCostants.appMarginDefault
      }}
      ListFooterComponent={renderListFooterComponent}
      contentContainerStyle={[
        styles.contentContainer,
        IOStyles.horizontalContentPadding
      ]}
      data={data?.services || []}
      keyExtractor={(item, index) => `service-${item.id}-${index}`}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.001}
      renderItem={renderItem}
      refreshControl={refreshControl}
      testID="intitution-services-list"
    />
  );
};
