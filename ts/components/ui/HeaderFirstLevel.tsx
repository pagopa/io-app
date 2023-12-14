import * as React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  IOColors,
  HSpacer,
  IOVisualCostants,
  H3,
  IOStyles
} from "@pagopa/io-app-design-system";
import { WithTestID } from "../../types/WithTestID";

export type HeaderFirstLevel = WithTestID<{
  title: string;
  // Accepted components: IconButton
  // Don't use any components other than this, please.
  firstAction?: React.ReactNode;
  secondAction?: React.ReactNode;
  thirdAction?: React.ReactNode;
}>;

const HEADER_BG_COLOR: IOColors = "white";

const styles = StyleSheet.create({
  headerInner: {
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    height: IOVisualCostants.headerHeight,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
});

export const HeaderFirstLevel = ({
  title,
  firstAction,
  secondAction,
  thirdAction,
  testID
}: HeaderFirstLevel) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: IOColors[HEADER_BG_COLOR]
      }}
      accessibilityRole="header"
      testID={testID}
    >
      <View style={styles.headerInner}>
        <H3 style={{ flexShrink: 1 }} numberOfLines={1}>
          {title}
        </H3>
        <View style={[IOStyles.row, { flexShrink: 0 }]}>
          {firstAction}
          {secondAction && (
            <>
              {/* Ideally, with the "gap" flex property,
              we can get rid of these ugly constructs */}
              <HSpacer size={16} />
              {secondAction}
            </>
          )}
          {thirdAction && (
            <>
              {/* Same as above */}
              <HSpacer size={16} />
              {thirdAction}
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default HeaderFirstLevel;
