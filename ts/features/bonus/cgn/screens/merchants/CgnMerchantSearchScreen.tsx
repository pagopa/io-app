import {
  Body,
  ContentWrapper,
  Divider,
  H6,
  IOSpacingScale,
  IOVisualCostants,
  Pictogram,
  SearchInput,
  SearchInputRef,
  VSpacer
} from "@pagopa/io-app-design-system";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Platform,
  StyleSheet,
  View,
  ViewStyle
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SearchItem } from "../../../../../../definitions/cgn/merchants/SearchItem";
import { getValue } from "../../../../../common/model/RemoteValue";
import { useDebouncedValue } from "../../../../../hooks/useDebouncedValue";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { MerchantSearchResultListItem } from "../../components/merchants/MerchantSearchResultListItem";
import {
  cgnMerchantsCount,
  cgnSearchMerchants
} from "../../store/actions/merchants";
import {
  cgnMerchantsCountSelector,
  cgnSearchMerchantsSelector
} from "../../store/reducers/merchants";

const INPUT_PADDING: IOSpacingScale = 16;
const MIN_SEARCH_TEXT_LENGTH: number = 3;
const SEARCH_DELAY: number = 300;

export function CgnMerchantSearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const searchInputRef = useRef<SearchInputRef>(null);
  const [searchText, setSearchText] = useState<string>("");
  const searchTextDebouncedTrimmed = useDebouncedValue({
    initial: "",
    value: searchText,
    delay: SEARCH_DELAY
  }).trim();

  const containerStyle: ViewStyle = useMemo(
    () => ({
      marginTop: insets.top,
      paddingVertical: INPUT_PADDING
    }),
    [insets.top]
  );

  const merchantsRemoteValue = useIOSelector(cgnSearchMerchantsSelector);
  const isSearchActive =
    searchTextDebouncedTrimmed.length >= MIN_SEARCH_TEXT_LENGTH;
  const merchants = isSearchActive ? getValue(merchantsRemoteValue) : undefined;
  useEffect(() => {
    if (isSearchActive) {
      dispatch(
        cgnSearchMerchants.request({
          token: searchTextDebouncedTrimmed as NonEmptyString
        })
      );
    }
  }, [dispatch, isSearchActive, searchTextDebouncedTrimmed]);

  const renderItemCallback = useCallback(
    (itemInfo: ListRenderItemInfo<SearchItem>) => (
      <MerchantSearchResultListItem
        item={itemInfo.item}
        searchText={searchTextDebouncedTrimmed}
      />
    ),
    [searchTextDebouncedTrimmed]
  );

  const merchantsCountRemoteValue = useIOSelector(cgnMerchantsCountSelector);
  useEffect(() => {
    dispatch(cgnMerchantsCount.request());
  }, [dispatch]);
  const merchantsCount = getValue(merchantsCountRemoteValue);

  const renderListEmptyComponent = useCallback(() => {
    if (searchText.trim().length < MIN_SEARCH_TEXT_LENGTH) {
      return <EmptyListShortQuery merchantCount={merchantsCount} />;
    }
    if (merchants?.length === 0) {
      return <EmptyListNoResults />;
    }
    return null;
  }, [merchants?.length, merchantsCount, searchText]);

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      searchInputRef.current?.focus();
    }, [])
  );

  return (
    <>
      <ContentWrapper style={containerStyle}>
        <SearchInput
          accessibilityLabel={I18n.t(
            "bonus.cgn.merchantSearch.input.placeholder"
          )}
          autoFocus={true}
          cancelButtonLabel={I18n.t("bonus.cgn.merchantSearch.input.cancel")}
          clearAccessibilityLabel={I18n.t(
            "bonus.cgn.merchantSearch.input.clear"
          )}
          keepCancelVisible={true}
          onCancel={handleCancel}
          onChangeText={setSearchText}
          placeholder={I18n.t("bonus.cgn.merchantSearch.input.placeholder")}
          ref={searchInputRef}
          testID="cgnMerchantSearchInput"
          value={searchText}
        />
      </ContentWrapper>
      <FlatList
        data={merchants?.length !== 0 ? merchants : undefined}
        ItemSeparatorComponent={() => <Divider />}
        keyboardDismissMode={Platform.select({
          ios: "interactive",
          default: "on-drag"
        })}
        keyboardShouldPersistTaps="handled"
        keyExtractor={item => item.id}
        ListEmptyComponent={renderListEmptyComponent}
        renderItem={renderItemCallback}
      />
    </>
  );
}

const styles = StyleSheet.create({
  emptyListContainer: {
    marginHorizontal: IOVisualCostants.appMarginDefault
  }
});

function EmptyListNoResults() {
  return (
    <View style={styles.emptyListContainer}>
      <View style={{ alignItems: "center" }}>
        <Pictogram name="umbrella" size={120} />
        <VSpacer size={24} />
      </View>
      <H6 style={{ textAlign: "center" }}>
        {I18n.t("bonus.cgn.merchantSearch.emptyList.noResults.title")}
      </H6>
      <VSpacer size={8} />
      <Body style={{ textAlign: "center" }}>
        {I18n.t("bonus.cgn.merchantSearch.emptyList.noResults.subtitle")}
      </Body>
    </View>
  );
}

function EmptyListShortQuery({
  merchantCount
}: {
  merchantCount: number | undefined;
}) {
  return (
    <View style={styles.emptyListContainer}>
      <View style={{ alignItems: "center" }}>
        <Pictogram name="searchLens" size={120} />
        <VSpacer size={24} />
      </View>
      <H6 style={{ textAlign: "center" }}>
        {merchantCount === undefined
          ? I18n.t(
              "bonus.cgn.merchantSearch.emptyList.shortQuery.titleWithoutCount"
            )
          : I18n.t(
              "bonus.cgn.merchantSearch.emptyList.shortQuery.titleWithCount",
              {
                merchantCount
              }
            )}
      </H6>
    </View>
  );
}
