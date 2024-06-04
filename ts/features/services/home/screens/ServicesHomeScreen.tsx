import React, { useCallback, useEffect } from "react";
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native";
import {
  Divider,
  IOStyles,
  IOToast,
  ListItemHeader,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { Institution } from "../../../../../definitions/services/Institution";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { InstitutionListSkeleton } from "../../common/components/InstitutionListSkeleton";
import { useFirstRender } from "../../common/hooks/useFirstRender";
import { SERVICES_ROUTES } from "../../common/navigation/routes";
import { getLogoForInstitution } from "../../common/utils";
import { useInstitutionsFetcher } from "../hooks/useInstitutionsFetcher";
import { featuredInstitutionsGet, featuredServicesGet } from "../store/actions";
import { FeaturedInstitutionList } from "../components/FeaturedInstitutionList";
import { FeaturedServiceList } from "../components/FeaturedServiceList";

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
    fetchInstitutions,
    isError,
    isLoading,
    isUpdating,
    isRefreshing,
    refreshInstitutions
  } = useInstitutionsFetcher();

  useOnFirstRender(() => fetchInstitutions(0));

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
    return <></>;
  }, [isFirstRender, isLoading]);

  const renderListHeaderComponent = useCallback(
    () => (
      <>
        <FeaturedServiceList />
        <FeaturedInstitutionList />
        <ListItemHeader label={I18n.t("services.home.institutions.title")} />
      </>
    ),
    []
  );

  const renderListFooterComponent = useCallback(() => {
    if (isUpdating && !isRefreshing) {
      return <InstitutionListSkeleton />;
    }
    return <VSpacer size={16} />;
  }, [isUpdating, isRefreshing]);

  const handleRefresh = useCallback(() => {
    dispatch(featuredServicesGet.request());
    dispatch(featuredInstitutionsGet.request());
    refreshInstitutions();
  }, [dispatch, refreshInstitutions]);

  const handleEndReached = useCallback(
    () => fetchInstitutions(currentPage + 1),
    [currentPage, fetchInstitutions]
  );

  const navigateToInstitution = useCallback(
    (institution: Institution) =>
      navigation.navigate(SERVICES_ROUTES.SERVICES_NAVIGATOR, {
        screen: SERVICES_ROUTES.INSTITUTION_SERVICES,
        params: {
          institutionId: institution.id,
          institutionName: institution.name
        }
      }),
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

  return (
    <FlatList
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
      onEndReachedThreshold={0.001}
      onRefresh={handleRefresh}
      refreshing={isRefreshing}
      renderItem={renderInstitutionItem}
    />
  );
};
