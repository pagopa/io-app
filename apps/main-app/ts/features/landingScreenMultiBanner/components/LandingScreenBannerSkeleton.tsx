import {
  IOBannerRadius,
  IOSkeleton,
  IOVisualCostants
} from "@io-app/design-system";
import { StyleSheet, View } from "react-native";

/** Approximates the height of the landing screen banners */
const BANNER_SKELETON_HEIGHT = 120;

export const LandingScreenBannerSkeleton = () => (
  <View
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
    style={styles.container}
    testID="landingScreenBannerSkeleton"
  >
    <IOSkeleton
      height={BANNER_SKELETON_HEIGHT}
      radius={IOBannerRadius}
      shape="rectangle"
      width="100%"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: IOVisualCostants.appMarginDefault,
    marginVertical: 16
  }
});
