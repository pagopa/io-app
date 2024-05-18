import React, { useMemo } from "react";
import { FlatList, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import {
  Avatar,
  Body,
  Divider,
  HSpacer,
  IOColors,
  IOStyles,
  Icon,
  Label,
  PressableListItemBase,
  Tag
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
  loading: boolean;
  selected: boolean;
};

const messageListItemHeight = () => 130;

export const MessageListItem = ({
  loading,
  selected
}: MessageListItemProps) => {
  if (loading) {
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
            <View style={IOStyles.flex}>
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
    <PressableListItemBase
      onPress={undefined}
      testID={undefined}
      accessibilityLabel={undefined}
    >
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 16
        }}
      >
        <View
          style={{
            justifyContent: "center"
          }}
        >
          {selected && (
            <View
              style={{
                alignItems: "center",
                backgroundColor: IOColors["blueIO-500"],
                borderRadius: 8,
                justifyContent: "center",
                height: 44,
                width: 44
              }}
            >
              <Icon name="checkTickBig" color="white" />
            </View>
          )}
          {!selected && <Avatar size="small" />}
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <View
            style={{
              flexDirection: "row",
              marginRight: 8
            }}
          >
            <Label
              fontSize="small"
              weight="SemiBold"
              numberOfLines={1}
              style={IOStyles.flex}
            >
              {"Organisation name that goes a long way until it co"}
            </Label>
            <Label fontSize="small" weight="Regular">
              {"09:35"}
            </Label>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Body numberOfLines={2} style={IOStyles.flex}>
              <Label fontSize="small" weight="SemiBold">
                {"Service name"}
              </Label>
              <Label>{" • "}</Label>
              <Label fontSize="small" weight="Regular">
                {
                  "Message title that goes a long way before having and end and it spans multiple decades "
                }
              </Label>
            </Body>
            <Svg
              width={14}
              height={14}
              style={{ marginLeft: 8, alignSelf: "center" }}
            >
              <Circle
                cx={"50%"}
                cy={"50%"}
                r={14 / 2}
                fill={IOColors["blueIO-500"]}
              />
            </Svg>
          </View>
          <View style={{ flexDirection: "row", marginTop: 10 }}>
            <Tag text={"VALORE LEGALE"} variant="legalMessage" />
            <HSpacer size={8} />
            <Tag variant="attachment" />
          </View>
        </View>
      </View>
    </PressableListItemBase>
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
      renderItem={({ item, index }) => (
        <MessageListItem
          loading={typeof item === "number"}
          selected={index % 2 === 1}
        />
      )}
    />
  );
};
