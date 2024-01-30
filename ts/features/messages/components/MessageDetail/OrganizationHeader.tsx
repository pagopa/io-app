import React from "react";
import { ImageURISource, StyleSheet, View } from "react-native";
import {
  Avatar,
  IOSpacingScale,
  IOStyles,
  LabelSmall
} from "@pagopa/io-app-design-system";

export type OrganizationHeaderProps = {
  organizationName: string;
  serviceName: string;
  logoUri: ImageURISource;
  accessibilityLabel?: string;
};

const ITEM_PADDING_VERTICAL: IOSpacingScale = 6;
const AVATAR_MARGIN_LEFT: IOSpacingScale = 16;

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: ITEM_PADDING_VERTICAL
  },
  itemAvatar: {
    marginLeft: AVATAR_MARGIN_LEFT
  }
});

export const OrganizationHeader = ({
  logoUri,
  organizationName,
  serviceName,
  ...rest
}: OrganizationHeaderProps) => (
  <View {...rest} accessible={true} style={styles.item}>
    <View style={IOStyles.flex}>
      <LabelSmall fontSize="regular" color="grey-700">
        {organizationName}
      </LabelSmall>
      <LabelSmall fontSize="regular" color="blueIO-500">
        {serviceName}
      </LabelSmall>
    </View>
    <View style={styles.itemAvatar}>
      <Avatar logoUri={logoUri} size="small" shape="circle" />
    </View>
  </View>
);
