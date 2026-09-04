import {
  ContentWrapper,
  Divider,
  IOSpacingScale,
  SearchInput,
  SearchInputRef,
  VSpacer
} from "@io-app/design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Platform,
  View,
  ViewStyle
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIOStore } from "../../../store/hooks";
import {
  trackMessageSearchClosing,
  trackMessageSearchPage,
  trackMessageSearchResult
} from "../analytics";
import { WrappedListItemMessage } from "../components/Home/WrappedListItemMessage";
import { EmptyList } from "../components/Search/EmptyList";
import { searchMessagesUncachedSelector } from "../store/reducers/allPaginated";
import { UIMessage } from "../types";

const INPUT_PADDING: IOSpacingScale = 16;
const MIN_QUERY_LENGTH = 3;

export const MessagesSearchScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useIONavigation();
  const store = useIOStore();
  const searchInputRef = useRef<SearchInputRef>(null);
  const [query, setQuery] = useState<string>("");
  const [filteredMessages, setFilteredMessages] = useState<
    ReadonlyArray<UIMessage>
  >([]);
  const isQueryTooShort = query.trim().length < MIN_QUERY_LENGTH;

  const containerStyle: ViewStyle = useMemo(
    () => ({
      marginTop: insets.top,
      paddingVertical: INPUT_PADDING
    }),
    [insets.top]
  );

  const renderItemCallback = useCallback(
    (itemInfo: ListRenderItemInfo<UIMessage>) => (
      <WrappedListItemMessage
        index={itemInfo.index}
        message={itemInfo.item}
        source="SEARCH"
      />
    ),
    []
  );
  const renderListEmptyComponent = useCallback(() => {
    if (isQueryTooShort) {
      return (
        <EmptyList
          pictogram="searchLens"
          title={I18n.t("messages.search.emptyState.title")}
        />
      );
    }

    return (
      <View
        accessibilityLabel={I18n.t("messages.search.emptyState.a11y.noneFound")}
        accessible={true}
        importantForAccessibility="yes"
        style={{
          minHeight: "50%"
        }}
      >
        {/* the spacer here is required to make the View accessible via external keyboard  */}
        <VSpacer size={16} />
      </View>
    );
  }, [isQueryTooShort]);

  const handleCancel = useCallback(() => {
    trackMessageSearchClosing();
    navigation.goBack();
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      trackMessageSearchPage();
      searchInputRef.current?.focus();
    }, [])
  );

  useEffect(() => {
    if (isQueryTooShort) {
      setFilteredMessages(current => (current.length === 0 ? current : []));
      return;
    }

    const timeoutHandleId = setTimeout(() => {
      const searchResult = searchMessagesUncachedSelector(
        store.getState(),
        query,
        MIN_QUERY_LENGTH
      );
      const searchResultCount = searchResult.length;
      if (searchResultCount > 0) {
        trackMessageSearchResult(searchResultCount);
      }

      setFilteredMessages(searchResult);
    }, 350);
    return () => clearTimeout(timeoutHandleId);
  }, [isQueryTooShort, query, store]);

  return (
    <>
      <ContentWrapper style={containerStyle}>
        <SearchInput
          accessibilityLabel={I18n.t("messages.search.input.placeholderShort")}
          autoFocus={true}
          cancelButtonLabel={I18n.t("messages.search.input.cancel")}
          clearAccessibilityLabel={I18n.t("messages.search.input.clear")}
          keepCancelVisible={true}
          onCancel={handleCancel}
          onChangeText={setQuery}
          placeholder={I18n.t("messages.search.input.placeholderShort")}
          ref={searchInputRef}
          value={query}
        />
      </ContentWrapper>
      <FlatList
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom
        }}
        data={filteredMessages}
        ItemSeparatorComponent={() => <Divider />}
        keyboardDismissMode={Platform.select({
          ios: "interactive",
          default: "on-drag"
        })}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={renderListEmptyComponent}
        renderItem={renderItemCallback}
      />
    </>
  );
};
