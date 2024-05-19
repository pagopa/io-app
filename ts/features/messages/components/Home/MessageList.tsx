import React, { useMemo } from "react";
import { FlatList, View } from "react-native";
import { Body, Divider, IOStyles } from "@pagopa/io-app-design-system";
import {
  useSafeAreaFrame,
  useSafeAreaInsets
} from "react-native-safe-area-context";
import I18n from "../../../../i18n";
import { MessageListCategory } from "../../types/messageListCategory";
import { useIOSelector } from "../../../../store/hooks";
import { messageListForCategorySelector } from "../../store/reducers/allPaginated";
import { UIMessage } from "../../types";
import { messageListItemHeight } from "./homeUtils";
import { MessageListItem } from "./MessageListItem";
import { WrappedMessageListItem } from "./WrappedMessageListItem";

type MessageListProps = {
  category: MessageListCategory;
};

export const MessageList = ({ category }: MessageListProps) => {
  const safeAreaFrame = useSafeAreaFrame();
  const safeAreaInsets = useSafeAreaInsets();
  const messageList = useIOSelector(state =>
    messageListForCategorySelector(state, category)
  );
  /* console.log(
    `=== MessageList (${category}) (${messageList?.length ?? "undefined"}) `
  ); */
  const loadingList = useMemo(() => {
    // console.log(`=== MessageList computing loading list`);
    const listHeight =
      safeAreaFrame.height -
      safeAreaInsets.top -
      safeAreaInsets.bottom -
      108 -
      54;
    const count = Math.floor(listHeight / messageListItemHeight());
    return [...Array(count).keys()];
  }, [safeAreaFrame.height, safeAreaInsets.top, safeAreaInsets.bottom]);

  return (
    <FlatList
      data={(messageList ?? loadingList) as Readonly<Array<number | UIMessage>>}
      ListEmptyComponent={() => (
        <View style={IOStyles.flex}>
          <Body>{`The list is empty`}</Body>
        </View>
      )}
      ItemSeparatorComponent={messageList ? () => <Divider /> : undefined}
      renderItem={({ item }) => {
        if (typeof item === "number") {
          return (
            <MessageListItem
              accessibilityLabel={I18n.t("messages.loading")}
              type={"loading"}
            />
          );
        } else {
          return <WrappedMessageListItem message={item} />;
        }
      }}
    />
  );
};
