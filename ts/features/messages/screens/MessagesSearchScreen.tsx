import {
  Divider,
  IOSpacingScale,
  IOStyles,
  SearchInput,
  SearchInputRef,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Platform,
  View,
  ViewStyle
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import I18n from "../../../i18n";
import { EmptyList } from "../components/Search/EmptyList";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIOStore } from "../../../store/hooks";
import { UIMessage } from "../types";
import { WrappedMessageListItem } from "../components/Home/WrappedMessageListItem";
import {
  trackMessageSearchClosing,
  trackMessageSearchPage
} from "../analytics";
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
      ...IOStyles.horizontalContentPadding,
      marginTop: insets.top,
      paddingVertical: INPUT_PADDING
    }),
    [insets.top]
  );

  const renderItemCallback = useCallback(
    (itemInfo: ListRenderItemInfo<UIMessage>) => (
      <WrappedMessageListItem
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

    return <VSpacer size={16} />;
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
      <View style={containerStyle}>
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
      </View>
      <FlatList
        ItemSeparatorComponent={() => <Divider />}
        data={filteredMessages}
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
