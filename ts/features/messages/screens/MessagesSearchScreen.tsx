import {
  Divider,
  IOSpacingScale,
  IOStyles,
  SearchInput,
  SearchInputRef,
  VSpacer
} from "@pagopa/io-app-design-system";
import React, { useCallback, useRef, useState } from "react";
import { FlatList, ListRenderItemInfo, Platform, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import I18n from "../../../i18n";
import { EmptyList } from "../components/Search/EmptyList";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import { searchMessagesCachedSelector } from "../store/reducers/allPaginated";
import { UIMessage } from "../types";
import { WrappedMessageListItem } from "../components/Home/WrappedMessageListItem";

const INPUT_PADDING: IOSpacingScale = 16;
const MIN_QUERY_LENGTH: number = 3;

export const MessagesSearchScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useIONavigation();
  const searchInputRef = useRef<SearchInputRef>(null);
  const [query, setQuery] = useState<string>("");

  const searchResultMessages = useIOSelector(state =>
    searchMessagesCachedSelector(state, query, MIN_QUERY_LENGTH)
  );

  const renderItemCallback = useCallback(
    (itemInfo: ListRenderItemInfo<UIMessage>) => (
      <WrappedMessageListItem index={itemInfo.index} message={itemInfo.item} />
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

  const handleCancel = useCallback(() => navigation.goBack(), [navigation]);

  useFocusEffect(
    useCallback(() => {
      searchInputRef.current?.focus();
    }, [])
  );

  return (
    <>
      <View
        style={[
          {
            marginTop: insets.top,
            paddingVertical: INPUT_PADDING
          },
          IOStyles.horizontalContentPadding
        ]}
      >
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
        data={searchResultMessages}
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
