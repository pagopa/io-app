import {
  IOSkeleton,
  IOVisualCostants,
  WithTestID
} from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";

import { ListItemMessageStandardHeight } from "./ListItemMessage";

export const SkeletonHeight =
  ListItemMessageStandardHeight + StyleSheet.hairlineWidth;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: SkeletonHeight,
    padding: 16
  },
  textContainer: {
    flex: 1,
    marginLeft: 8
  },
  textRow1Container: {
    marginTop: 13
  },
  textRow2Container: { marginTop: 15, marginBottom: 5 },
  timeContainer: {
    marginLeft: 12,
    width: 30
  }
});

type ListItemMessageSkeletonProps = WithTestID<{
  accessibilityLabel: string;
}>;

export const ListItemMessageSkeleton = ({
  accessibilityLabel
}: ListItemMessageSkeletonProps) => (
  <View accessibilityLabel={accessibilityLabel} style={styles.container}>
    <View style={{ justifyContent: "center" }}>
      <IOSkeleton
        radius={IOVisualCostants.avatarRadiusSizeSmall}
        shape="square"
        size={IOVisualCostants.avatarSizeSmall}
      />
    </View>
    <View style={styles.textContainer}>
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <IOSkeleton
            height={16}
            radius={IOVisualCostants.avatarRadiusSizeSmall}
            shape="rectangle"
            width="100%"
          />
        </View>
        <View style={styles.timeContainer}>
          <IOSkeleton
            height={16}
            radius={IOVisualCostants.avatarRadiusSizeSmall}
            shape="rectangle"
            width="100%"
          />
        </View>
      </View>
      <View style={styles.textRow1Container}>
        <IOSkeleton
          height={8}
          radius={IOVisualCostants.avatarRadiusSizeSmall}
          shape="rectangle"
          width="100%"
        />
      </View>
      <View style={styles.textRow2Container}>
        <IOSkeleton
          height={8}
          radius={IOVisualCostants.avatarRadiusSizeSmall}
          shape="rectangle"
          width="100%"
        />
      </View>
    </View>
  </View>
);
