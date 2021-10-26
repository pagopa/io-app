import { none } from "fp-ts/lib/Option";
import { View } from "native-base";
import React, { ComponentProps } from "react";
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

type OwnProps = {
  messages: ReadonlyArray<UIMessage>;
  searchText: string;
  navigateToMessageDetail: (id: string) => void;
  isLoading: boolean;
};

type Props = Pick<ComponentProps<typeof MessageList>, "onRefresh"> & OwnProps;

/**
 * A component to render a list of messages that match a searchText.
 */
const MessagesSearch = (props: Props) => {
  const { isLoading, messages, searchText, navigateToMessageDetail } = props;
  const searchResults = messages.filter(message =>
    isTextIncludedCaseInsensitive(
      [message.title, message.organizationName, message.serviceName].join(" "),
      searchText
    )
  );

  return searchResults.length > 0 ? (
    <View style={styles.listWrapper}>
      <MessageList
        {...props}
        messages={searchResults}
        onPressItem={navigateToMessageDetail}
        onLongPressItem={navigateToMessageDetail}
        refreshing={isLoading}
        selectedMessageIds={none}
      />
    </View>
  ) : (
    <SearchNoResultMessage errorType="NoResultsFound" />
  );
};

export default MessagesSearch;
