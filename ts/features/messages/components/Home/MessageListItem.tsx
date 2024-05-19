import React from "react";
import { ImageURISource, View } from "react-native";
import Placeholder from "rn-placeholder";
import Svg, { Circle } from "react-native-svg";
import {
  Avatar,
  Body,
  HSpacer,
  IOColors,
  IOStyles,
  Icon,
  Label,
  Tag,
  WithTestID
} from "@pagopa/io-app-design-system";
import { messageListItemHeight } from "./homeUtils";
import { CustomPressableListItemBase } from "./CustomPressableListItemBase";

type MessageListItemProps = WithTestID<
  | {
      accessibilityLabel: string;
      bodyPrequel: string;
      bodySequel: string;
      onLongPress?: () => void;
      onPress?: () => void;
      title: string;
      titleTime: string;
      selected?: boolean;
      serviceLogos?: ReadonlyArray<ImageURISource>;
      showBadgeAndTag?: boolean;
      showCircle?: boolean;
      type: "loaded";
    }
  | {
      accessibilityLabel: string;
      type: "loading";
    }
>;

export const MessageListItem = (props: MessageListItemProps) => {
  if (props.type === "loading") {
    // console.log(`=== MessageListItem (loading)`);
    return (
      <View
        accessibilityLabel={props.accessibilityLabel}
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
  // console.log(`=== MessageListItem (${props.bodySequel})`);
  return (
    <CustomPressableListItemBase
      onPress={props.onPress}
      onLongPress={props.onLongPress}
      selected={props.selected}
      testID={props.testID}
      accessibilityLabel={props.accessibilityLabel}
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
          {props.selected && (
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
          {!props.selected && (
            <Avatar logoUri={props.serviceLogos} size="small" />
          )}
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
              {props.title}
            </Label>
            <Label fontSize="small" weight="Regular">
              {props.titleTime}
            </Label>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Body numberOfLines={2} style={IOStyles.flex}>
              <Label fontSize="small" weight="SemiBold">
                {props.bodyPrequel}
              </Label>
              <Label>{" • "}</Label>
              <Label fontSize="small" weight="Regular">
                {props.bodySequel}
              </Label>
            </Body>
            {props.showCircle && (
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
            )}
          </View>
          {props.showBadgeAndTag && (
            <View style={{ flexDirection: "row", marginTop: 10 }}>
              <Tag text={"VALORE LEGALE"} variant="legalMessage" />
              <HSpacer size={8} />
              <Tag variant="attachment" />
            </View>
          )}
        </View>
      </View>
    </CustomPressableListItemBase>
  );
};
