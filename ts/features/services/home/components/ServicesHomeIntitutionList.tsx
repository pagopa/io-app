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
import { constNull } from "fp-ts/lib/function";
import { Institution } from "../../../../../definitions/services/Institution";
import I18n from "../../../../i18n";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { useFirstRender } from "../../common/hooks/useFirstRender";
import { useInstitutionsFetcher } from "../hooks/useInstitutionsFetcher";
import { logoForInstitution } from "../utils";
import { InstitutionListItemSkeleton } from "./InstitutionListItemSkeleton";

export const ServicesHomeIntitutionList = () => {
  const isFirstRender = useFirstRender();

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

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Institution>) => (
      <ListItemNav
        value={item.name}
        onPress={constNull}
        accessibilityLabel={item.name}
        avatarProps={{
          logoUri: logoForInstitution(item)
        }}
      />
    ),
    []
  );

  const renderListFooterComponent = useCallback(() => {
    if (isUpdating) {
      return (
        <>
          <InstitutionListItemSkeleton />
          <Divider />
          <InstitutionListItemSkeleton />
          <Divider />
          <InstitutionListItemSkeleton />
        </>
      );
    }
    return <VSpacer size={16} />;
  }, [isUpdating]);

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
        keyExtractor={(_, index) => `placeholder-${index}`}
        renderItem={() => <InstitutionListItemSkeleton />}
        onRefresh={refreshInstitutions}
        refreshing={isUpdating}
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
