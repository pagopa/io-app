import * as React from "react";
import { View, StyleSheet } from "react-native";
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

const styles = StyleSheet.create({
  header: {
    backgroundColor: IOColors.white,
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
}: HeaderFirstLevel) => (
  <View accessibilityRole="header" testID={testID} style={styles.header}>
    <NewH3 style={{ flexShrink: 1 }} numberOfLines={1}>
      {title}
    </NewH3>
    <View style={[IOStyles.row, { flexShrink: 0 }]}>
      {firstAction}
      {secondAction && (
        <>
          {/* Ideally with "gap" flex property
          we can get rid of these ugly constructs */}
          <HSpacer size={16} />
          {secondAction}
        </>
      )}
      {thirdAction && (
        <>
          <HSpacer size={16} />
          {thirdAction}
        </>
      )}
    </View>
  </View>
);

export default HeaderFirstLevel;
