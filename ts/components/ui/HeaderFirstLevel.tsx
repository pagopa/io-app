import * as React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IOColors } from "../core/variables/IOColors";
import { WithTestID } from "../../types/WithTestID";
import { IOStyles, IOVisualCostants } from "../core/variables/IOStyles";
import { NewH3 } from "../core/typography/NewH3";
import { HSpacer } from "../core/spacer/Spacer";

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
        <NewH3 style={{ flexShrink: 1 }} numberOfLines={1}>
          {title}
        </NewH3>
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
