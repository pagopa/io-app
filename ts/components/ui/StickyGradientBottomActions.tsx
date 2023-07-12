import * as React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo } from "react";
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
const GRADIENT_AREA_HEIGHT: number = 132;

const styles = StyleSheet.create({
  buttonContainer: {
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    width: "100%",
    flex: 1,
    justifyContent: "flex-end"
  }
});

export const StickyGradientBottomActions = ({
  // firstAction,
  // secondAction,
  testID
}: StickyGradientBottomActions) => {
  const insets = useSafeAreaInsets();

  // Check if iPhone bottom handle is present. If not, add a
  // default margin to avoid Button attached to the
  // bottom without margin
  const bottomMargin: number = useMemo(
    () =>
      insets.bottom === 0 ? IOVisualCostants.appMarginDefault : insets.bottom,
    [insets]
  );

  return (
    <View
      style={{
        width: "100%",
        position: "absolute",
        bottom: 0,
        height: GRADIENT_AREA_HEIGHT + bottomMargin,
        paddingBottom: bottomMargin
      }}
      testID={testID}
      pointerEvents="box-none"
    >
      <View
        style={{
          height: GRADIENT_AREA_HEIGHT + bottomMargin,
          ...StyleSheet.absoluteFillObject,
          backgroundColor: hexToRgba(IOColors[HEADER_BG_COLOR], 0.7),
          borderTopColor: IOColors["error-500"],
          borderTopWidth: 1
        }}
        pointerEvents="none"
      />
      <View style={styles.buttonContainer} pointerEvents="box-none">
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
