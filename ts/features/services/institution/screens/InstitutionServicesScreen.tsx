import {
  Divider,
  IOStyles,
  IOToast,
  IOVisualCostants,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect } from "react";
import { ListRenderItemInfo, RefreshControl, StyleSheet } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
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
import * as analytics from "../../common/analytics";

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
    fetchNextPage,
    fetchPage,
    isError,
    isLoading,
    isUpdating,
    isRefreshing,
    refresh
  } = useServicesFetcher(institutionId);

  useOnFirstRender(() => fetchPage(0));

  useFocusEffect(
    useCallback(() => {
      if (data) {
        analytics.trackInstitutionDetails({
          organization_fiscal_code: institutionId,
          organization_name: institutionName,
          services_count: data?.count
        });
      }
    }, [data, institutionId, institutionName])
  );

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
    },
    headerShown: !!data || !isError
  });

  const scrollHandler = useAnimatedScrollHandler(event => {
    // eslint-disable-next-line functional/immutable-data
    scrollTranslationY.value = event.contentOffset.y;
  });

  const navigateToServiceDetails = useCallback(
    ({ id, name }: ServiceMinified) => {
      analytics.trackServiceSelected({
        organization_name: institutionName,
        service_id: id,
        service_name: name,
        source: "organization_detail"
      });

      navigation.navigate(SERVICES_ROUTES.SERVICES_NAVIGATOR, {
        screen: SERVICES_ROUTES.SERVICE_DETAIL,
        params: {
          serviceId: id as ServiceId
        }
      });
    },
    [institutionName, navigation]
  );

  const handleEndReached = useCallback(
    ({ distanceFromEnd }: { distanceFromEnd: number }) => {
      // guard needed to avoid endless loop
      if (distanceFromEnd === 0) {
        return;
      }

      fetchNextPage(currentPage + 1);
    },
    [currentPage, fetchNextPage]
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
          subTitle={I18n.t(
            data?.count && data?.count > 1
              ? "services.institution.header.subtitlePlural"
              : "services.institution.header.subtitleSingular",
            {
              count: data?.count ?? 0
            }
          )}
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
    return <InstitutionServicesFailure onRetry={() => fetchPage(0)} />;
  }

  const refreshControl = (
    <RefreshControl
      onRefresh={refresh}
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
      onEndReachedThreshold={0.1}
      renderItem={renderItem}
      refreshControl={refreshControl}
      testID="intitution-services-list"
    />
  );
};
