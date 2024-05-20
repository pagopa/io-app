import React from "react";
import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import {
  IOColors,
  IOStyles,
  IOVisualCostants,
  WithTestID
} from "@pagopa/io-app-design-system";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16
  },
  serviceLogo: {
    justifyContent: "center"
  },
  textContainer: {
    ...IOStyles.flex,
    marginLeft: 8
  },
  textRow1Container: {
    marginTop: 25
  },
  textRow2Container: { marginTop: 13 },
  textRow3Container: { marginTop: 13 },
  timeContainer: {
    marginLeft: 8,
    width: 35
  },
  titleContainer: {
    flexDirection: "row",
    paddingTop: 3
  },
  titleRow: {
    ...IOStyles.flex
  }
});

type MessageListItemSkeletonProps = WithTestID<{
  accessibilityLabel: string;
}>;

export const MessageListItemSkeleton = ({
  accessibilityLabel
}: MessageListItemSkeletonProps) => (
  <View accessibilityLabel={accessibilityLabel} style={styles.container}>
    <View style={styles.serviceLogo}>
      <Placeholder.Box
        animate={"fade"}
        color={IOColors["grey-100"]}
        height={IOVisualCostants.avatarSizeSmall}
        radius={IOVisualCostants.avatarRadiusSizeSmall}
        width={IOVisualCostants.avatarSizeSmall}
      />
    </View>
    <View style={styles.textContainer}>
      <View style={styles.titleContainer}>
        <View style={styles.titleRow}>
          <Placeholder.Box
            animate={"fade"}
            color={IOColors["grey-100"]}
            radius={IOVisualCostants.avatarRadiusSizeSmall}
            height={16}
            width={"100%"}
          />
        </View>
        <View style={styles.timeContainer}>
          <Placeholder.Box
            animate={"fade"}
            color={IOColors["grey-100"]}
            radius={IOVisualCostants.avatarRadiusSizeSmall}
            height={16}
            width={"100%"}
          />
        </View>
      </View>
      <View style={styles.textRow1Container}>
        <Placeholder.Box
          animate={"fade"}
          color={IOColors["grey-100"]}
          radius={IOVisualCostants.avatarRadiusSizeSmall}
          height={8}
          width={"100%"}
        />
      </View>
      <View style={styles.textRow2Container}>
        <Placeholder.Box
          animate={"fade"}
          color={IOColors["grey-100"]}
          radius={IOVisualCostants.avatarRadiusSizeSmall}
          height={8}
          width={"100%"}
        />
      </View>
      <View style={styles.textRow3Container}>
        <Placeholder.Box
          animate={"fade"}
          color={IOColors["grey-100"]}
          radius={IOVisualCostants.avatarRadiusSizeSmall}
          height={8}
          width={"50%"}
        />
      </View>
    </View>
  </View>
);
