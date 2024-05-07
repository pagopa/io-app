import React from "react";
import { ImageURISource, StyleSheet, View } from "react-native";
import {
  Avatar,
  H3,
  IOColors,
  IOSpacingScale,
  IOStyles,
  IOVisualCostants,
  LabelSmall,
  VSpacer
} from "@pagopa/io-app-design-system";
import Placeholder from "rn-placeholder";

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
      <H3>{serviceName}</H3>
      <LabelSmall fontSize="regular" color="grey-700">
        {organizationName}
      </LabelSmall>
    </View>
  </View>
);

export const ServiceDetailsHeaderSkeleton = () => (
  <View style={styles.container} accessible={true}>
    <View style={styles.itemAvatar}>
      <Placeholder.Box
        width={IOVisualCostants.avatarSizeMedium}
        height={IOVisualCostants.avatarSizeMedium}
        animate="fade"
        radius={IOVisualCostants.avatarRadiusSizeMedium}
        color={IOColors["grey-200"]}
      />
    </View>
    <View style={IOStyles.flex}>
      <Placeholder.Box
        animate="fade"
        color={IOColors["grey-200"]}
        height={16}
        width={"100%"}
        radius={8}
      />
      <VSpacer size={8} />
      <Placeholder.Box
        animate="fade"
        color={IOColors["grey-200"]}
        height={16}
        width={"80%"}
        radius={8}
      />
      <VSpacer size={8} />
      <Placeholder.Box
        animate="fade"
        color={IOColors["grey-200"]}
        height={8}
        width={"60%"}
        radius={8}
      />
    </View>
  </View>
);
