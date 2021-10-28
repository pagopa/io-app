import { View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";

import { SearchNoResultMessage } from "../../search/SearchNoResultMessage";
import { isTextIncludedCaseInsensitive } from "../../../utils/strings";
import { UIMessage } from "../../../store/reducers/entities/messages/types";

import MessageList from "./MessageList";

const styles = StyleSheet.create({
  listWrapper: {
    flex: 1
  }
});

type Props = {
  messages: ReadonlyArray<UIMessage>;
  searchText: string;
  navigateToMessageDetail: (id: string) => void;
  isLoading: boolean;
};

/**
 * A component to render a list of messages that match a searchText.
 */
const MessagesSearch = ({
  messages,
  navigateToMessageDetail,
  searchText
}: Props) => {
  const searchResults: ReadonlyArray<UIMessage> = messages.filter(message =>
    isTextIncludedCaseInsensitive(
      [message.title, message.organizationName, message.serviceName].join(" "),
      searchText
    )
  );

  return searchResults.length > 0 ? (
    <View style={styles.listWrapper}>
      <MessageList
        filteredMessages={searchResults}
        onPressItem={navigateToMessageDetail}
        onLongPressItem={navigateToMessageDetail}
        selectedMessageIds={new Set()}
      />
    </View>
  ) : (
    <SearchNoResultMessage errorType="NoResultsFound" />
  );
};

export default MessagesSearch;
