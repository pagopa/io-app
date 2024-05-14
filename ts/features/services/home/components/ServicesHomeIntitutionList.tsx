import React, { useCallback, useEffect } from "react";
import { FlatList, ListRenderItemInfo } from "react-native";
import {
  Divider,
  IOStyles,
  IOToast,
  ListItemHeader,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Institution } from "../../../../../definitions/services/Institution";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { useFirstRender } from "../../common/hooks/useFirstRender";
import { SERVICES_ROUTES } from "../../common/navigation/routes";
import { useInstitutionsFetcher } from "../hooks/useInstitutionsFetcher";
import { logoForInstitution } from "../utils";
import { InstitutionListItemSkeleton } from "../../common/components/InstitutionListSkeleton";

export const ServicesHomeIntitutionList = () => {
  const isFirstRender = useFirstRender();
  const navigation = useIONavigation();

  const {
    currentPage,
    data,
    fetchInstitutions,
    isError,
    isLoading,
    isUpdating,
    refreshInstitutions
  } = useInstitutionsFetcher();

  useOnFirstRender(() => fetchInstitutions(0));

  useEffect(() => {
    if (!isFirstRender && isError) {
      IOToast.error(I18n.t("global.genericError"));
    }
  }, [isFirstRender, isError]);

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

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Institution>) => (
      <ListItemNav
        value={item.name}
        onPress={() => navigateToInstitution(item)}
        accessibilityLabel={item.name}
        avatarProps={{
          logoUri: logoForInstitution(item)
        }}
      />
    ),
    [navigateToInstitution]
  );

  const renderListFooterComponent = useCallback(() => {
    if (isUpdating && currentPage > 0) {
      return <InstitutionListItemSkeleton />;
    }
    return <VSpacer size={16} />;
  }, [currentPage, isUpdating]);

  const ListHeaderComponent = (
    <ListItemHeader label={I18n.t("services.home.institutions.title")} />
  );

  if (isFirstRender || isLoading) {
    return (
      <FlatList
        ListHeaderComponent={ListHeaderComponent}
        ItemSeparatorComponent={() => <Divider />}
        contentContainerStyle={IOStyles.horizontalContentPadding}
        data={Array.from({ length: 5 })}
        keyExtractor={(_, index) => `institution-placeholder-${index}`}
        renderItem={() => <InstitutionListItemSkeleton />}
      />
    );
  }

  return (
    <FlatList
      ListHeaderComponent={ListHeaderComponent}
      ItemSeparatorComponent={() => <Divider />}
      contentContainerStyle={IOStyles.horizontalContentPadding}
      data={data?.institutions || []}
      keyExtractor={(item, index) => `institution-${item.id}-${index}`}
      renderItem={renderItem}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.001}
      onRefresh={refreshInstitutions}
      refreshing={isUpdating}
      ListFooterComponent={renderListFooterComponent}
    />
  );
};
