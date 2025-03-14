import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, View, ViewStyle } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import {
  Divider,
  IOSpacingScale,
  IOStyles,
  IOToast,
  SearchInput,
  SearchInputRef,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useInstitutionsFetcher } from "../hooks/useInstitutionsFetcher";
import { Institution } from "../../../../../definitions/services/Institution";
import { searchPaginatedInstitutionsGet } from "../store/actions";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { getLogoForInstitution } from "../../common/utils";
import { SERVICES_ROUTES } from "../../common/navigation/routes";
import { EmptyState } from "../../common/components/EmptyState";
import { InstitutionListSkeleton } from "../../common/components/InstitutionListSkeleton";
import { ListItemSearchInstitution } from "../../common/components/ListItemSearchInstitution";
import * as analytics from "../../common/analytics";

const INPUT_PADDING: IOSpacingScale = 16;
const LIST_ITEM_HEIGHT: number = 70;
const MIN_QUERY_LENGTH: number = 3;

export const SearchScreen = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const searchInputRef = useRef<SearchInputRef>(null);
  const [query, setQuery] = useState<string>("");

  const containerStyle: ViewStyle = useMemo(
    () => ({
      ...IOStyles.horizontalContentPadding,
      marginTop: insets.top,
      paddingVertical: INPUT_PADDING
    }),
    [insets.top]
  );

  const {
    currentPage,
    data,
    fetchNextPage,
    fetchPage,
    isError,
    isLoading,
    isUpdating
  } = useInstitutionsFetcher();

  useFocusEffect(
    useCallback(() => {
      analytics.trackSearchPage();
      searchInputRef.current?.focus();
    }, [])
  );

  useEffect(() => {
    if (isError) {
      IOToast.error(I18n.t("global.genericError"));
    }
  }, [isError]);

  useEffect(
    () =>
      navigation.addListener("beforeRemove", _ =>
        dispatch(searchPaginatedInstitutionsGet.cancel())
      ),
    [dispatch, navigation]
  );

  const handleCancel = useCallback(() => navigation.goBack(), [navigation]);

  const handleChangeText = (text: string) => {
    setQuery(text);

    if (text.length >= MIN_QUERY_LENGTH) {
      analytics.trackSearchInput();
      fetchPage(0, text);
    } else {
      dispatch(searchPaginatedInstitutionsGet.cancel());
    }
  };

  const handleEndReached = useCallback(() => {
    if (!!data && query.length >= MIN_QUERY_LENGTH) {
      fetchNextPage(currentPage + 1, query);
      analytics.trackSearchResultScroll();
    }
  }, [currentPage, data, fetchNextPage, query]);

  const navigateToInstitution = useCallback(
    ({ fiscal_code, id, name }: Institution) => {
      analytics.trackInstitutionSelected({
        organization_fiscal_code: fiscal_code,
        organization_name: name,
        source: "search_list"
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
    ({ item }: ListRenderItemInfo<Institution>) => (
      <ListItemSearchInstitution
        value={item.name}
        numberOfLines={2}
        onPress={() => navigateToInstitution(item)}
        accessibilityLabel={item.name}
        avatarProps={{
          source: getLogoForInstitution(item.fiscal_code)
        }}
      />
    ),
    [navigateToInstitution]
  );

  const ListFooterComponent = useMemo(() => {
    if (isUpdating) {
      return <InstitutionListSkeleton />;
    }

    return <VSpacer size={16} />;
  }, [isUpdating]);

  const ListEmptyComponent = useMemo(() => {
    if (query.length < MIN_QUERY_LENGTH) {
      return (
        <EmptyState
          pictogram="searchLens"
          title={I18n.t("services.search.emptyState.invalidQuery.title")}
        />
      );
    }

    if (data?.institutions.length === 0) {
      return (
        <EmptyState
          pictogram="umbrella"
          title={I18n.t("services.search.emptyState.noResults.title")}
          subtitle={I18n.t("services.search.emptyState.noResults.subtitle")}
        />
      );
    }

    if (isLoading) {
      return <InstitutionListSkeleton />;
    }

    return null;
  }, [isLoading, query, data?.institutions]);

  return (
    <>
      <View style={containerStyle}>
        <SearchInput
          accessibilityLabel={I18n.t("services.search.input.placeholderShort")}
          autoFocus={true}
          cancelButtonLabel={I18n.t("services.search.input.cancel")}
          clearAccessibilityLabel={I18n.t("services.search.input.clear")}
          keepCancelVisible={true}
          onCancel={handleCancel}
          onChangeText={handleChangeText}
          placeholder={I18n.t("services.search.input.placeholderShort")}
          ref={searchInputRef}
          value={query}
        />
      </View>
      <FlashList
        ItemSeparatorComponent={Divider}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        contentContainerStyle={IOStyles.horizontalContentPadding}
        data={data?.institutions}
        estimatedItemSize={LIST_ITEM_HEIGHT}
        keyboardDismissMode={Platform.select({
          ios: "interactive",
          default: "on-drag"
        })}
        keyboardShouldPersistTaps="handled"
        keyExtractor={item => item.id}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        renderItem={renderItem}
      />
    </>
  );
};
