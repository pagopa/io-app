import React from "react";
import { ImageURISource, StyleSheet, View } from "react-native";
import {
  Avatar,
  H3,
  IOSpacingScale,
  IOStyles,
  LabelSmall
} from "@pagopa/io-app-design-system";

const ITEM_PADDING_VERTICAL: IOSpacingScale = 6;
const AVATAR_MARGIN_RIGHT: IOSpacingScale = 16;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: ITEM_PADDING_VERTICAL
  },
  itemAvatar: {
    marginRight: AVATAR_MARGIN_RIGHT
  }
});

export type ServiceDetailsHeaderProps = {
  logoUri: ReadonlyArray<ImageURISource>;
  organizationName: string;
  serviceName: string;
};

export const ServiceDetailsHeader = ({
  logoUri,
  organizationName,
  serviceName
}: ServiceDetailsHeaderProps) => (
  <View style={styles.container}>
    <View style={styles.itemAvatar}>
      <Avatar logoUri={logoUri} size="medium" />
    </View>
    <View style={IOStyles.flex}>
      <H3>{organizationName}</H3>
      <LabelSmall fontSize="regular" color="grey-700">
        {serviceName}
      </LabelSmall>
    </View>
  </View>
);
