import React from "react";
import { View, StyleSheet } from "react-native";

import { UIMessage } from "../../store/reducers/entities/messages/types";
import { isTextIncludedCaseInsensitive } from "../../utils/strings";
import { SearchNoResultMessage } from "../search/SearchNoResultMessage";

const styles = StyleSheet.create({
  listWrapper: {
    flex: 1
  }
});

type Props = {
  messages: ReadonlyArray<UIMessage>;
  searchText: string;

  /** Will be called only with non-empty results */
  renderSearchResults: (results: ReadonlyArray<UIMessage>) => React.ReactNode;
};

/**
 * A component filter a list of messages matching the search text.
 * A default view is rendered if there are no matching messages.
 */
const MessagesSearch = ({
  messages,
  renderSearchResults,
  searchText
}: Props) => {
  const searchResults: ReadonlyArray<UIMessage> = messages
    .filter(message =>
      isTextIncludedCaseInsensitive(
        [message.title, message.organizationName, message.serviceName].join(
          " "
        ),
        searchText
      )
    )
    // sorted from newest to oldest
    .sort((a, b) => b.id.localeCompare(a.id, "en"));

  return searchResults.length > 0 ? (
    <View style={styles.listWrapper}>{renderSearchResults(searchResults)}</View>
  ) : (
    <SearchNoResultMessage errorType="NoResultsFound" />
  );
};

export default MessagesSearch;
