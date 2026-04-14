import {
  ContentWrapper,
  Divider,
  IOSpacingScale,
  SearchInput,
  SearchInputRef,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Platform,
  View,
  ViewStyle
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import I18n from "i18next";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIOStore } from "../../../store/hooks";
import {
  trackMessageSearchClosing,
  trackMessageSearchPage
} from "../analytics";
import { WrappedListItemMessage } from "../components/Home/WrappedListItemMessage";
import { EmptyList } from "../components/Search/EmptyList";
import { UIMessage } from "../types";
import { getMessageSearchResult } from "./searchUtils";

const INPUT_PADDING: IOSpacingScale = 16;
const MIN_QUERY_LENGTH: number = 3;

export const MessagesSearchScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useIONavigation();
  const store = useIOStore();
  const searchInputRef = useRef<SearchInputRef>(null);
  const [query, setQuery] = useState<string>("");
  const [filteredMessages, setFilteredMessages] = useState<
    ReadonlyArray<UIMessage>
  >([]);

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
  const renderListEmptyComponent = () => {
    if (query.trim().length < MIN_QUERY_LENGTH) {
      return (
        <EmptyList
          pictogram="searchLens"
          title={I18n.t("messages.search.emptyState.title")}
        />
      );
    }

    return (
      <View
        accessible={true}
        accessibilityLabel={I18n.t("messages.search.emptyState.a11y.noneFound")}
        importantForAccessibility="yes"
        style={{
          minHeight: "50%"
        }}
      >
        {/* the spacer here is required to make the View accessible via external keyboard  */}
        <VSpacer size={16} />
      </View>
    );
  };

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
    const timeoutHandleId = setTimeout(() => {
      const state = store.getState();
      const searchResult = getMessageSearchResult(
        query,
        MIN_QUERY_LENGTH,
        state
      );
      setFilteredMessages(searchResult);
    }, 350);
    return () => clearTimeout(timeoutHandleId);
  }, [query, setFilteredMessages, store]);

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
          onChangeText={(inputText: string) => setQuery(inputText)}
          placeholder={I18n.t("messages.search.input.placeholderShort")}
          ref={searchInputRef}
          value={query}
        />
      </ContentWrapper>
      <FlatList
        ItemSeparatorComponent={() => <Divider />}
        data={filteredMessages}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom
        }}
        renderItem={renderItemCallback}
        ListEmptyComponent={renderListEmptyComponent}
        keyboardDismissMode={Platform.select({
          ios: "interactive",
          default: "on-drag"
        })}
        keyboardShouldPersistTaps="handled"
      />
    </>
  );
};
