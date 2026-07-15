import {
  Divider,
  IOColors,
  IOToast,
  IOVisualCostants,
  ListItemNav,
  useIOTheme,
  VSpacer
} from "@io-app/design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useEffect, useMemo } from "react";
import { ListRenderItemInfo, RefreshControl } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { ServiceMinified } from "../../../../../definitions/services/ServiceMinified";
import {
  HeaderSecondLevelHookProps,
  useHeaderSecondLevel
} from "../../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { getListItemAccessibilityLabelCount } from "../../../../utils/accessibility";
import * as analytics from "../../common/analytics";
import { ServiceListSkeleton } from "../../common/components/ServiceListSkeleton";
import { ServicesHeaderSection } from "../../common/components/ServicesHeaderSection";
import { useFirstRender } from "../../common/hooks/useFirstRender";
import { ServicesParamsList } from "../../common/navigation/params";
import { SERVICES_ROUTES } from "../../common/navigation/routes";
import { getLogoForInstitution } from "../../common/utils";
import { InstitutionServicesFailure } from "../components/InstitutionServicesFailure";
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

export const InstitutionServicesScreen = ({
  navigation,
  route
}: InstitutionServicesScreen) => {
  const { institutionId, institutionName } = route.params;

  const insets = useSafeAreaInsets();
  const theme = useIOTheme();
  const dispatch = useIODispatch();
  const animatedFlatListRef =
    useAnimatedRef<Animated.FlatList<ServiceMinified>>();
  const isFirstRender = useFirstRender();

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

  const headerConfig = useMemo<HeaderSecondLevelHookProps>(
    () => ({
      backgroundColor: IOColors[theme["appBackground-secondary"]],
      goBack,
      headerShown: !!data || !isError,
      enableDiscreteTransition: true,
      animatedRef: animatedFlatListRef,
      supportRequest: true,
      title: institutionName
    }),
    [animatedFlatListRef, data, goBack, isError, institutionName, theme]
  );

  useHeaderSecondLevel(headerConfig);

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

  const ListEmptyComponent = useCallback(() => {
    if (isFirstRender || isLoading) {
      return (
        <>
          <ServiceListSkeleton avatarShown={false} size={5} />
          <VSpacer size={16} />
        </>
      );
    }
    return null;
  }, [isFirstRender, isLoading]);

  const ListHeaderComponent = useMemo(() => {
    if (isFirstRender || isLoading) {
      return <ServicesHeaderSection isLoading={true} />;
    }

    return (
      <ServicesHeaderSection
        logoUri={getLogoForInstitution(institutionId)}
        subTitle={I18n.t("services.institution.header.subtitle", {
          count: data?.count ?? 0
        })}
        title={institutionName}
      />
    );
  }, [data?.count, isFirstRender, isLoading, institutionId, institutionName]);

  const ListFooterComponent = useMemo(() => {
    if (isUpdating && !isRefreshing) {
      return <ServiceListSkeleton avatarShown={false} />;
    }
    return <></>;
  }, [isUpdating, isRefreshing]);

  if (!data && isError) {
    return <InstitutionServicesFailure onRetry={refresh} />;
  }

  const refreshControlComponent = (
    <RefreshControl
      onRefresh={refresh}
      refreshing={isRefreshing}
      style={{ zIndex: 1 }}
    />
  );

  return (
    <Animated.FlatList
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: insets.bottom,
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      data={data?.services}
      ItemSeparatorComponent={Divider}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListHeaderComponentStyle={{
        marginBottom: 16,
        marginHorizontal: -IOVisualCostants.appMarginDefault
      }}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.1}
      ref={animatedFlatListRef}
      refreshControl={refreshControlComponent}
      renderItem={renderItem}
      testID="intitution-services-list"
    />
  );
};
