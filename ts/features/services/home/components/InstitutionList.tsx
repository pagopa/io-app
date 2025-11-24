import {
  BannerErrorState,
  Divider,
  IOButton,
  IOToast,
  IOVisualCostants,
  ListItemHeader,
  SearchInput,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import { useCallback, useEffect, useMemo } from "react";
import { ListRenderItemInfo, View } from "react-native";
import Animated, {
  AnimatedRef,
  LinearTransition
} from "react-native-reanimated";
import I18n from "i18next";
import { Institution } from "../../../../../definitions/services/Institution";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { ServiceListSkeleton } from "../../common/components/ServiceListSkeleton";
import { SERVICES_ROUTES } from "../../common/navigation/routes";
import { useInstitutionsFetcher } from "../hooks/useInstitutionsFetcher";
import { featuredInstitutionsGet, featuredServicesGet } from "../store/actions";
import * as analytics from "../../common/analytics";
import { IdPayInitiativeWaitingList } from "../../../idpay/wallet/components/IdPayInitiativeWaitingList";
import { FeaturedInstitutionList } from "./FeaturedInstitutionList";
import { FeaturedServiceList } from "./FeaturedServiceList";
import { EmailNotificationBanner } from "./EmailNotificationBanner";
import { InstitutionListItem } from "./InstitutionListItem";

export type InstitutionListProps = {
  scrollViewContentRef: AnimatedRef<Animated.FlatList<Institution>>;
};

export const InstitutionList = ({
  scrollViewContentRef
}: InstitutionListProps) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const {
    data,
    fetchNextPage,
    isError,
    isLastPage,
    isLoading,
    isRefreshing,
    isUpdating,
    refresh,
    retry
  } = useInstitutionsFetcher();

  useEffect(() => {
    // Show an error toast for subsequent page loads
    if (isError && data?.institutions) {
      IOToast.error(I18n.t("global.genericError"));
    }
  }, [data?.institutions, isError]);

  const ListEmptyComponent = useCallback(() => {
    if (isLoading) {
      return (
        <>
          <ServiceListSkeleton />
          <VSpacer size={16} />
        </>
      );
    }

    if (isError) {
      return (
        <BannerErrorState
          label={I18n.t("services.home.institutions.error.banner.label")}
          actionText={I18n.t("services.home.institutions.error.banner.cta")}
          onPress={retry}
        />
      );
    }
    return null;
  }, [isError, isLoading, retry]);

  const navigateToSearch = useCallback(
    () => navigation.navigate(SERVICES_ROUTES.SEARCH),
    [navigation]
  );

  const ListHeaderComponent = useMemo(
    () => (
      <>
        <SearchInput
          accessibilityLabel={I18n.t("services.search.input.placeholder")}
          cancelButtonLabel={I18n.t("services.search.input.cancel")}
          clearAccessibilityLabel={I18n.t("services.search.input.clear")}
          placeholder={I18n.t("services.search.input.placeholder")}
          pressable={{
            onPress: () => {
              analytics.trackSearchStart({ source: "search_bar" });
              navigateToSearch();
            }
          }}
        />
        <EmailNotificationBanner />
        <Animated.View layout={LinearTransition.duration(300)}>
          <VStack space={16}>
            <IdPayInitiativeWaitingList />
            <FeaturedServiceList />
            <FeaturedInstitutionList />
            <ListItemHeader
              label={I18n.t("services.home.institutions.title")}
            />
          </VStack>
        </Animated.View>
      </>
    ),
    [navigateToSearch]
  );

  const ListFooterComponent = useMemo(() => {
    if (isUpdating && !isRefreshing) {
      return <ServiceListSkeleton />;
    }

    if (isLastPage) {
      return (
        <View
          style={{
            alignItems: "center",
            alignSelf: "center",
            marginVertical: 24
          }}
        >
          <IOButton
            variant="link"
            label={I18n.t("services.home.searchLink")}
            onPress={() => {
              analytics.trackSearchStart({ source: "bottom_link" });
              navigateToSearch();
            }}
          />
        </View>
      );
    }
    return null;
  }, [isLastPage, isUpdating, isRefreshing, navigateToSearch]);

  const handleRefresh = useCallback(() => {
    dispatch(featuredServicesGet.request());
    dispatch(featuredInstitutionsGet.request());
    refresh();
  }, [dispatch, refresh]);

  const handleEndReached = useCallback(() => {
    analytics.trackInstitutionsScroll();
    fetchNextPage();
  }, [fetchNextPage]);

  const navigateToInstitution = useCallback(
    ({ fiscal_code, id, name }: Institution) => {
      analytics.trackInstitutionSelected({
        organization_fiscal_code: fiscal_code,
        organization_name: name,
        source: "main_list"
      });

      navigation.navigate(SERVICES_ROUTES.SERVICES_NAVIGATOR, {
        screen: SERVICES_ROUTES.INSTITUTION_SERVICES,
        params: {
          institutionId: id,
          institutionName: name
        }
      });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Institution>) => (
      <InstitutionListItem
        count={data?.count ?? 0}
        index={index}
        institution={item}
        onPress={navigateToInstitution}
      />
    ),
    [data?.count, navigateToInstitution]
  );

  return (
    <Animated.FlatList
      ItemSeparatorComponent={Divider}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      data={data?.institutions}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.1}
      onRefresh={handleRefresh}
      ref={scrollViewContentRef}
      refreshing={isRefreshing}
      renderItem={renderItem}
    />
  );
};
