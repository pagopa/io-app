import {
  Divider,
  HeaderActionProps,
  IOButton,
  IOToast,
  IOVisualCostants,
  ListItemHeader,
  ListItemNav,
  SearchInput,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo } from "react";
import { ListRenderItemInfo, View } from "react-native";
import Animated, {
  LinearTransition,
  useAnimatedRef
} from "react-native-reanimated";
import I18n from "i18next";
import { Institution } from "../../../../../definitions/services/Institution";
import SectionStatusComponent from "../../../../components/SectionStatus";
import { useHeaderFirstLevel } from "../../../../hooks/useHeaderFirstLevel";
import { useTabItemPressWhenScreenActive } from "../../../../hooks/useTabItemPressWhenScreenActive";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { ServiceListSkeleton } from "../../common/components/ServiceListSkeleton";
import { useFirstRender } from "../../common/hooks/useFirstRender";
import { SERVICES_ROUTES } from "../../common/navigation/routes";
import { getLogoForInstitution } from "../../common/utils";
import { FeaturedInstitutionList } from "../components/FeaturedInstitutionList";
import { FeaturedServiceList } from "../components/FeaturedServiceList";
import { useInstitutionsFetcher } from "../hooks/useInstitutionsFetcher";
import { useServicesHomeBottomSheet } from "../hooks/useServicesHomeBottomSheet";
import { featuredInstitutionsGet, featuredServicesGet } from "../store/actions";
import { EmailNotificationBanner } from "../components/EmailNotificationBanner";
import { getListItemAccessibilityLabelCount } from "../../../../utils/accessibility";
import * as analytics from "../../common/analytics";

export const ServicesHomeScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const isFirstRender = useFirstRender();

  const {
    currentPage,
    data,
    fetchNextPage,
    fetchPage,
    isError,
    isLastPage,
    isLoading,
    isRefreshing,
    isUpdating,
    refresh
  } = useInstitutionsFetcher();

  useOnFirstRender(() => fetchPage(0));

  useFocusEffect(
    useCallback(() => {
      analytics.trackServicesHome();
    }, [])
  );

  useEffect(() => {
    if (!isFirstRender && isError) {
      IOToast.error(I18n.t("global.genericError"));
    }
  }, [isFirstRender, isError]);

  const renderListEmptyComponent = useCallback(() => {
    if (isFirstRender || isLoading) {
      return (
        <>
          <ServiceListSkeleton size={5} />
          <VSpacer size={16} />
        </>
      );
    }
    return null;
  }, [isFirstRender, isLoading]);

  const navigateToSearch = useCallback(
    () => navigation.navigate(SERVICES_ROUTES.SEARCH),
    [navigation]
  );

  const renderListHeaderComponent = useCallback(
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

  const renderListFooterComponent = useCallback(() => {
    if (isUpdating && !isRefreshing) {
      return <ServiceListSkeleton />;
    }

    if (isLastPage) {
      return (
        <>
          <VSpacer size={16} />
          <View style={{ alignItems: "center", alignSelf: "center" }}>
            <IOButton
              variant="link"
              label={I18n.t("services.home.searchLink")}
              onPress={() => {
                analytics.trackSearchStart({ source: "bottom_link" });
                navigateToSearch();
              }}
            />
          </View>
          <VSpacer size={24} />
        </>
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
    fetchNextPage(currentPage + 1);
  }, [currentPage, fetchNextPage]);

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

  const renderInstitutionItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Institution>) => {
      const accessibilityLabel = `${
        item.name
      }${getListItemAccessibilityLabelCount(data?.count ?? 0, index)}`;

      return (
        <ListItemNav
          accessibilityLabel={accessibilityLabel}
          avatarProps={{
            logoUri: getLogoForInstitution(item.fiscal_code)
          }}
          numberOfLines={2}
          onPress={() => navigateToInstitution(item)}
          value={item.name}
        />
      );
    },
    [data?.count, navigateToInstitution]
  );

  /* CODE RELATED TO THE HEADER -- START */

  const scrollViewContentRef = useAnimatedRef<Animated.FlatList<Institution>>();

  const { bottomSheet, present } = useServicesHomeBottomSheet();

  const handleSearch = useCallback(() => {
    analytics.trackSearchStart({ source: "header_icon" });
    navigation.navigate(SERVICES_ROUTES.SEARCH);
  }, [navigation]);

  const actionSettings: HeaderActionProps = useMemo(
    () => ({
      icon: "coggle",
      accessibilityLabel: I18n.t("global.buttons.settings"),
      onPress: () => {
        analytics.trackServicesPreferences();
        present();
      }
    }),
    [present]
  );

  const actionSearch: HeaderActionProps = useMemo(
    () => ({
      icon: "search",
      accessibilityLabel: I18n.t("global.accessibility.search"),
      onPress: handleSearch
    }),
    [handleSearch]
  );

  useHeaderFirstLevel({
    currentRoute: SERVICES_ROUTES.SERVICES_HOME,
    headerProps: {
      title: I18n.t("services.title"),
      animatedFlatListRef: scrollViewContentRef,
      actions: [actionSearch, actionSettings]
    }
  });

  /* CODE RELATED TO THE HEADER -- END */

  /* Scroll to top when the active tab is tapped */
  useTabItemPressWhenScreenActive(
    useCallback(
      () =>
        scrollViewContentRef.current?.scrollToOffset({
          offset: 0,
          animated: true
        }),
      [scrollViewContentRef]
    ),
    false
  );

  return (
    <>
      <Animated.FlatList
        ItemSeparatorComponent={Divider}
        ListEmptyComponent={renderListEmptyComponent}
        ListFooterComponent={renderListFooterComponent}
        ListHeaderComponent={renderListHeaderComponent}
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
        renderItem={renderInstitutionItem}
      />
      <SectionStatusComponent sectionKey={"services"} />
      {bottomSheet}
    </>
  );
};
