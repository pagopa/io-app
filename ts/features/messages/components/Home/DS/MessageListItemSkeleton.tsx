import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import {
  IOColors,
  IOStyles,
  IOVisualCostants,
  WithTestID
} from "@pagopa/io-app-design-system";

export const SkeletonHeight = 95 + StyleSheet.hairlineWidth;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: SkeletonHeight,
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
    marginTop: 13
  },
  textRow2Container: { marginTop: 15, marginBottom: 5 },
  timeContainer: {
    marginLeft: 12,
    width: 30
  },
  titleContainer: {
    flexDirection: "row"
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
    </View>
  </View>
);
