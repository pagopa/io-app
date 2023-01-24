import * as O from "fp-ts/lib/Option";
import React, { useRef, useState } from "react";
import {
  Animated,
  FlatList,
  FlatListProps,
  ListRenderItemInfo,
  StyleSheet,
  Vibration
} from "react-native";
import { UIMessage } from "../../../store/reducers/entities/messages/types";
import customVariables, {
  VIBRATION_LONG_PRESS_DURATION
} from "../../../theme/variables";
import { generateItemLayout, ItemSeparator, RenderItem } from "./helpers";

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: customVariables.contentPadding
  }
});

const keyExtractor = (message: UIMessage) => message.id;

const animated = {
  onScroll: Animated.event([
    {
      nativeEvent: {
        contentOffset: { y: new Animated.Value(0) }
      }
    }
  ]),
  scrollEventThrottle: 8
};

type OwnProps = {
  messages: ReadonlyArray<UIMessage>;
  onLongPressItem?: (id: string) => void;
  onPressItem?: (message: UIMessage) => void;
  /** An optional list of messages to mark as selected */
  selectedMessageIds?: ReadonlySet<string>;
  testID?: string;
};

type Props = OwnProps & Omit<FlatListProps<UIMessage>, "data" | "renderItem">;

const MessageList = ({
  testID,
  messages = [],
  selectedMessageIds,
  onLongPressItem,
  onPressItem = (_: UIMessage) => undefined,
  ...rest
}: Props) => {
  const flatListRef: React.RefObject<FlatList> = useRef(null);

  const [longPressedItemIndex, setLongPressedItemIndex] = useState<
    O.Option<number>
  >(O.none);

  const scrollTo = (index: number, animated: boolean = false) => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToIndex({ animated, index });
    }
  };

  const handleOnLayoutChange = () => {
    if (O.isSome(longPressedItemIndex)) {
      scrollTo(longPressedItemIndex.value, true);
      setLongPressedItemIndex(O.none);
    }
  };

  const onLongPress = ({ id }: UIMessage) => {
    if (!onLongPressItem) {
      return;
    }
    Vibration.vibrate(VIBRATION_LONG_PRESS_DURATION);
    onLongPressItem(id);
    const lastIndex = messages.length - 1;
    const lastMessageId = messages[lastIndex].id;
    if (id === lastMessageId) {
      setLongPressedItemIndex(O.some(lastIndex));
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<UIMessage>) => (
    <RenderItem
      message={item}
      onLongPress={onLongPress}
      onPress={onPressItem}
      selectedMessageIds={selectedMessageIds}
    />
  );

  return (
    <Animated.FlatList
      {...rest}
      data={messages}
      renderItem={renderItem}
      ItemSeparatorComponent={ItemSeparator}
      keyExtractor={keyExtractor}
      ref={flatListRef}
      scrollEnabled={true}
      scrollEventThrottle={animated?.scrollEventThrottle}
      style={styles.padded}
      getItemLayout={(
        _: ReadonlyArray<UIMessage> | null | undefined,
        index: number
      ) => generateItemLayout(messages.length)(index)}
      onScroll={(...args) => {
        animated.onScroll(...args);
      }}
      onLayout={handleOnLayoutChange}
      testID={testID}
    />
  );
};

export default MessageList;
