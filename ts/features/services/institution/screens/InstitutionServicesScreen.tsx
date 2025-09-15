import {
  Divider,
  IOColors,
  IOToast,
  IOVisualCostants,
  ListItemNav,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect } from "react";
import { ListRenderItemInfo, RefreshControl, StyleSheet } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import I18n from "i18next";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { ServiceMinified } from "../../../../../definitions/services/ServiceMinified";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { ServicesHeaderSection } from "../../common/components/ServicesHeaderSection";
import { ServiceListSkeleton } from "../../common/components/ServiceListSkeleton";
import { useFirstRender } from "../../common/hooks/useFirstRender";
import { ServicesParamsList } from "../../common/navigation/params";
import { SERVICES_ROUTES } from "../../common/navigation/routes";
import { getLogoForInstitution } from "../../common/utils";
import { InstitutionServicesFailure } from "../components/InstitutionServicesFailure";
import { useServicesFetcher } from "../hooks/useServicesFetcher";
import { paginatedServicesGet } from "../store/actions";
import { getListItemAccessibilityLabelCount } from "../../../../utils/accessibility";
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
  refreshControlContainer: {
    zIndex: 1
  }
});

export const InstitutionServicesScreen = ({
  navigation,
  route
}: InstitutionServicesScreen) => {
  const { institutionId, institutionName } = route.params;

  const theme = useIOTheme();
  const dispatch = useIODispatch();
  const isFirstRender = useFirstRender();

  const scrollTranslationY = useSharedValue(0);

  const {
    data,
    fetchNextPage,
    isError,
    isLoading,
    isUpdating,
    isRefreshing,
    refresh
  } = useServicesFetcher(institutionId);

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
    backgroundColor: IOColors[theme["appBackground-secondary"]],
    goBack,
    headerShown: !!data || !isError,
    scrollValues: {
      triggerOffset: scrollTriggerOffsetValue,
      contentOffsetY: scrollTranslationY
    },
    supportRequest: true,
    title: institutionName
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

  const handleEndReached = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<ServiceMinified>) => {
      const accessibilityLabel = `${
        item.name
      }${getListItemAccessibilityLabelCount(data?.count ?? 0, index)}`;

      return (
        <ListItemNav
          accessibilityLabel={accessibilityLabel}
          onPress={() => navigateToServiceDetails(item)}
          value={item.name}
        />
      );
    },
    [data?.count, navigateToServiceDetails]
  );

  const renderListEmptyComponent = useCallback(() => {
    if (isFirstRender || isLoading) {
      return (
        <>
          <ServiceListSkeleton avatarShown={false} size={5} />
          <VSpacer size={16} />
        </>
      );
    }
    return <></>;
  }, [isFirstRender, isLoading]);

  const renderListHeaderComponent = useCallback(() => {
    if (isFirstRender || isLoading) {
      return <ServicesHeaderSection isLoading={true} />;
    }

    return (
      <ServicesHeaderSection
        logoUri={getLogoForInstitution(institutionId)}
        title={institutionName}
        subTitle={I18n.t("services.institution.header.subtitle", {
          count: data?.count ?? 0
        })}
      />
    );
  }, [data?.count, isFirstRender, isLoading, institutionId, institutionName]);

  const renderListFooterComponent = useCallback(() => {
    if (isUpdating && !isRefreshing) {
      return (
        <>
          <ServiceListSkeleton avatarShown={false} />
          <VSpacer size={16} />
        </>
      );
    }
    return <VSpacer size={16} />;
  }, [isUpdating, isRefreshing]);

  if (!data && isError) {
    return <InstitutionServicesFailure onRetry={refresh} />;
  }

  const refreshControlComponent = (
    <RefreshControl
      onRefresh={refresh}
      refreshing={isRefreshing}
      style={styles.refreshControlContainer}
    />
  );

  return (
    <Animated.FlatList
      ItemSeparatorComponent={Divider}
      ListEmptyComponent={renderListEmptyComponent}
      ListHeaderComponent={renderListHeaderComponent}
      ListHeaderComponentStyle={{
        marginBottom: 16,
        marginHorizontal: -IOVisualCostants.appMarginDefault
      }}
      ListFooterComponent={renderListFooterComponent}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      data={data?.services}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.1}
      onScroll={scrollHandler}
      refreshControl={refreshControlComponent}
      renderItem={renderItem}
      testID="intitution-services-list"
    />
  );
};
