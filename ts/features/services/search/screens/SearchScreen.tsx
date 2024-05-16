import React, { useCallback, useEffect, useState } from "react";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import {
  ContentWrapper,
  Divider,
  IOStyles,
  IOToast,
  ListItemNav,
  TextInput,
  VSpacer
} from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import I18n from "../../../../i18n";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useInstitutionsFetcher } from "../hooks/useInstitutionsFetcher";
import { Institution } from "../../../../../definitions/services/Institution";
import { searchPaginatedInstitutionsGet } from "../store/actions";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { logoForInstitution } from "../../home/utils";
import { SERVICES_ROUTES } from "../../common/navigation/routes";
import { EmptyState } from "../../common/components/EmptyState";
import { InstitutionListSkeleton } from "../../common/components/InstitutionListSkeleton";

const MIN_QUERY_LENGTH: number = 3;
const LIST_ITEM_HEIGHT: number = 70;

export const SearchScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const [query, setQuery] = useState<string>("");

  const {
    currentPage,
    data,
    fetchNextPage,
    fetchPage,
    isError,
    isLoading,
    isUpdating
  } = useInstitutionsFetcher();

  useEffect(() => {
    if (isError) {
      IOToast.error(I18n.t("global.genericError"));
    }
  }, [isError]);

  const goBack = useCallback(() => {
    navigation.goBack();
    dispatch(searchPaginatedInstitutionsGet.cancel());
  }, [dispatch, navigation]);

  useHeaderSecondLevel({
    goBack,
    title: "",
    supportRequest: true
  });

  const handleChangeText = (text: string) => {
    setQuery(text);

    if (text.length >= MIN_QUERY_LENGTH) {
      fetchPage(0, text);
    } else {
      dispatch(searchPaginatedInstitutionsGet.cancel());
    }
  };

  const handleEndReached = useCallback(() => {
    if (!!data && query.length >= MIN_QUERY_LENGTH) {
      fetchNextPage(currentPage + 1, query);
    }
  }, [currentPage, data, fetchNextPage, query]);

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
        numberOfLines={2}
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
    if (isUpdating) {
      return <InstitutionListSkeleton />;
    }
    return <VSpacer size={16} />;
  }, [isUpdating]);

  const renderListEmptyComponent = useCallback(() => {
    if (query.length < MIN_QUERY_LENGTH) {
      return (
        <EmptyState
          pictogram="searchLens"
          title={I18n.t("services.search.emptyState.title")}
        />
      );
    }

    if (isLoading) {
      return <InstitutionListSkeleton />;
    }

    return <VSpacer size={16} />;
  }, [isLoading, query]);

  return (
    <SafeAreaView style={IOStyles.flex} edges={["bottom"]}>
      <ContentWrapper>
        <TextInput
          accessibilityLabel={I18n.t("services.search.input.placeholder")}
          icon="search"
          value={query}
          onChangeText={handleChangeText}
          placeholder={I18n.t("services.search.input.placeholder")}
          textInputProps={{
            autoCorrect: false,
            inputMode: "text",
            returnKeyType: "search"
          }}
          autoFocus={true}
        />
        <VSpacer />
      </ContentWrapper>
      <FlashList
        ItemSeparatorComponent={() => <Divider />}
        contentContainerStyle={IOStyles.horizontalContentPadding}
        data={data?.institutions || []}
        estimatedItemSize={LIST_ITEM_HEIGHT}
        keyExtractor={(item, index) => `institution-${item.id}-${index}`}
        renderItem={renderItem}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.001}
        ListEmptyComponent={renderListEmptyComponent}
        ListFooterComponent={renderListFooterComponent}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
};
