import {
  ButtonLink,
  Divider,
  HeaderActionProps,
  IOStyles,
  IOToast,
  ListItemHeader,
  ListItemNav,
  SearchInput,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo } from "react";
import { ListRenderItemInfo, StyleSheet, View } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { Institution } from "../../../../../definitions/services/Institution";
import SectionStatusComponent from "../../../../components/SectionStatus";
import { useHeaderFirstLevel } from "../../../../hooks/useHeaderFirstLevel";
import { useTabItemPressWhenScreenActive } from "../../../../hooks/useTabItemPressWhenScreenActive";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import * as analytics from "../../common/analytics";
import { InstitutionListSkeleton } from "../../common/components/InstitutionListSkeleton";
import { useFirstRender } from "../../common/hooks/useFirstRender";
import { SERVICES_ROUTES } from "../../common/navigation/routes";
import { getLogoForInstitution } from "../../common/utils";
import { FeaturedInstitutionList } from "../components/FeaturedInstitutionList";
import { FeaturedServiceList } from "../components/FeaturedServiceList";
import { useInstitutionsFetcher } from "../hooks/useInstitutionsFetcher";
import { useServicesHomeBottomSheet } from "../hooks/useServicesHomeBottomSheet";
import { featuredInstitutionsGet, featuredServicesGet } from "../store/actions";

const styles = StyleSheet.create({
  scrollContentContainer: {
    flexGrow: 1
  }
});

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
          <InstitutionListSkeleton size={5} />
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
        <FeaturedServiceList />
        <FeaturedInstitutionList />
        <ListItemHeader label={I18n.t("services.home.institutions.title")} />
      </>
    ),
    [navigateToSearch]
  );

  const renderListFooterComponent = useCallback(() => {
    if (isUpdating && !isRefreshing) {
      return <InstitutionListSkeleton />;
    }

    if (isLastPage) {
      return (
        <>
          <VSpacer size={16} />
          <View style={[IOStyles.alignCenter, IOStyles.selfCenter]}>
            <ButtonLink
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
    ({ item }: ListRenderItemInfo<Institution>) => (
      <ListItemNav
        value={item.name}
        onPress={() => navigateToInstitution(item)}
        accessibilityLabel={item.name}
        avatarProps={{
          logoUri: getLogoForInstitution(item.fiscal_code)
        }}
      />
    ),
    [navigateToInstitution]
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
      onPress: present
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
      secondAction: actionSettings,
      thirdAction: actionSearch
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
        ItemSeparatorComponent={() => <Divider />}
        ListEmptyComponent={renderListEmptyComponent}
        ListFooterComponent={renderListFooterComponent}
        ListHeaderComponent={renderListHeaderComponent}
        contentContainerStyle={[
          styles.scrollContentContainer,
          IOStyles.horizontalContentPadding
        ]}
        data={data?.institutions || []}
        keyExtractor={(item, index) => `institution-${item.id}-${index}`}
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
