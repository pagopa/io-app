import React, { useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  Body,
  Divider,
  IOColors,
  IOStyles
} from "@pagopa/io-app-design-system";
import {
  useSafeAreaFrame,
  useSafeAreaInsets
} from "react-native-safe-area-context";
import Placeholder from "rn-placeholder";
import { MessageListCategory } from "../../types/messageListCategory";
import { useIOSelector } from "../../../../store/hooks";
import { messageListForCategorySelector } from "../../store/reducers/allPaginated";
import { UIMessage } from "../../types";

type MessageListProps = {
  category: MessageListCategory;
};

type MessageListItemProps = {
  item: number | UIMessage;
};

const messageListItemHeight = () => 130;

export const MessageListItem = ({ item }: MessageListItemProps) => {
  if (typeof item === "number") {
    return (
      <View
        style={{
          flexDirection: "row",
          height: messageListItemHeight(),
          padding: 16
        }}
      >
        <View style={{ justifyContent: "center" }}>
          <Placeholder.Box
            animate={"fade"}
            color={IOColors["grey-100"]}
            height={44}
            radius={8}
            width={44}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <View
            style={{
              flexDirection: "row",
              paddingTop: 3
            }}
          >
            <View style={{ flex: 1 }}>
              <Placeholder.Box
                animate={"fade"}
                color={IOColors["grey-100"]}
                radius={8}
                height={16}
                width={"100%"}
              />
            </View>
            <View style={{ marginLeft: 8, width: 35 }}>
              <Placeholder.Box
                animate={"fade"}
                color={IOColors["grey-100"]}
                radius={8}
                height={16}
                width={"100%"}
              />
            </View>
          </View>
          <View style={{ marginTop: 25 }}>
            <Placeholder.Box
              animate={"fade"}
              color={IOColors["grey-100"]}
              radius={8}
              height={8}
              width={"100%"}
            />
          </View>
          <View style={{ marginTop: 13 }}>
            <Placeholder.Box
              animate={"fade"}
              color={IOColors["grey-100"]}
              radius={8}
              height={8}
              width={"100%"}
            />
          </View>
          <View style={{ marginTop: 13 }}>
            <Placeholder.Box
              animate={"fade"}
              color={IOColors["grey-100"]}
              radius={8}
              height={8}
              width={"50%"}
            />
          </View>
        </View>
      </View>
    );
  }
  return (
    <View>
      <Body>{item.title}</Body>
    </View>
  );
};

export const MessageList = ({ category }: MessageListProps) => {
  const safeAreaFrame = useSafeAreaFrame();
  const safeAreaInsets = useSafeAreaInsets();
  const messageList = useIOSelector(state =>
    messageListForCategorySelector(state, category)
  );
  console.log(
    `=== MessageList (${category}) (${JSON.stringify(messageList)}) `
  );
  const loadingList = useMemo(() => {
    console.log(`=== MessageList computing loading list`);
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
      renderItem={({ item, index }) => <MessageListItem item={item} />}
    />
  );
};
