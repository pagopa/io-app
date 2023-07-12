import * as React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IOColors, hexToRgba } from "../core/variables/IOColors";
import { WithTestID } from "../../types/WithTestID";
import { IOVisualCostants } from "../core/variables/IOStyles";
import ButtonSolid from "./ButtonSolid";

export type StickyGradientBottomActions = WithTestID<{
  // Accepted components: ButtonSolid, ButtonLink
  // Don't use any components other than this, please.
  firstAction?: React.ReactNode;
  secondAction?: React.ReactNode;
}>;

const HEADER_BG_COLOR: IOColors = "white";

const styles = StyleSheet.create({
  headerInner: {
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    width: "100%",
    flex: 1,
    justifyContent: "flex-end"
  }
});

export const StickyGradientBottomActions = ({
  firstAction,
  secondAction,
  testID
}: StickyGradientBottomActions) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: 150,
        // Check if iPhone bottom handle is present. If not, add a
        // default margin to avoid Button attached to the
        // bottom without margin
        paddingBottom:
          insets.bottom === 0
            ? IOVisualCostants.appMarginDefault
            : insets.bottom,
        backgroundColor: hexToRgba(IOColors[HEADER_BG_COLOR], 0.7),
        borderTopColor: IOColors["error-500"],
        borderTopWidth: 1
      }}
      accessibilityRole="header"
      testID={testID}
    >
      <View style={styles.headerInner}>
        <ButtonSolid
          fullWidth
          label="Fixed component"
          accessibilityLabel={""}
          onPress={() => Alert.alert("Button pressed! (⁠⁠ꈍ⁠ᴗ⁠ꈍ⁠)")}
        />
        {/* <View style={[IOStyles.row, { flexShrink: 0 }]}>
          {firstAction}
          {secondAction && (
            <>
              <HSpacer size={16} />
              {secondAction}
            </>
          )}
        </View> */}
      </View>
    </View>
  );
};

export default StickyGradientBottomActions;
