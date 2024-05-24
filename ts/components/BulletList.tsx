import { View } from "react-native";
import React, { ComponentProps, memo, useCallback } from "react";
import { Body, IOSpacer, VSpacer } from "@pagopa/io-app-design-system";

const BULLET_ITEM = "\u2022";

type ListItem = {
  value: string;
  id: string | number;
  textProps?: ComponentProps<typeof Body>;
  list?: Array<Omit<ListItem, "list">>;
};

type Props = {
  title: string;
  list: Array<ListItem>;
  textProps?: ComponentProps<typeof Body>;
  spacing?: IOSpacer;
};

export const BulletList = memo(
  ({ title, list, spacing = 8, textProps = {} }: Props) => {
    const renderListItems = useCallback(
      (list?: Array<ListItem>) =>
        list?.map(({ id, value, textProps = {}, ...rest }) => (
          <View key={id} style={{ paddingLeft: spacing }} {...textProps}>
            <Body>
              {BULLET_ITEM} {value}
            </Body>
            {"list" in rest && renderListItems(rest.list)}
          </View>
        )),
      [spacing]
    );

    return (
      <View>
        <Body {...textProps}>{title}</Body>
        <VSpacer size={spacing} />
        {renderListItems(list)}
      </View>
    );
  }
);
