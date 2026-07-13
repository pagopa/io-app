import { PropsWithChildren } from "react";
import { ColorValue, LayoutChangeEvent, StyleSheet, View } from "react-native";
import { useIOTheme, useIOThemeContext } from "../../context";
import {
  IOColors,
  IOSpacer,
  IOSpacing,
  IOSpacingScale,
  IOVisualCostants
} from "../../core";
import { WithTestID } from "../../utils/types";
import { IOButton, IOButtonBlockSpecificProps } from "../buttons";
import { useBottomMargins } from "./hooks/useBottomMargins";

type IOButtonBlockProps = Omit<
  IOButtonBlockSpecificProps,
  "variant" | "fullWidth"
>;

export type FooterActionsInlineMeasurements = {
  /* Height of the safe bottom area. It includes:
     - Margin between screen content
       and actions (contentEndMargin)
     - Actions block height
     - Eventual safe area margin (bottomMargin)
     This is the total bottom padding that needs
     to be applied to the ScrollView.
  */
  safeBottomAreaHeight: number;
};

type FooterActionsInline = WithTestID<
  PropsWithChildren<{
    startAction: IOButtonBlockProps;
    endAction: IOButtonBlockProps;
    onMeasure?: (measurements: FooterActionsInlineMeasurements) => void;
    /* Don't include safe area insets */
    excludeSafeAreaMargins?: boolean;
    /* Fixed at the bottom of the screen */
    fixed?: boolean;
  }>
>;

const styles = StyleSheet.create({
  buttonContainer: {
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    width: "100%",
    flexShrink: 0
  },
  buttonWrapper: {
    flex: 1
  },
  blockShadow: {
    shadowColor: IOColors.black,
    shadowOffset: {
      width: 0,
      height: -4
    },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 10 // Prop supported on Android only
  }
});

export const FooterActionsInline = ({
  startAction,
  endAction,
  excludeSafeAreaMargins = false,
  fixed = true,
  onMeasure,
  testID
}: FooterActionsInline) => {
  const theme = useIOTheme();
  const { themeType } = useIOThemeContext();

  const { bottomMargin } = useBottomMargins(false, excludeSafeAreaMargins);

  /* Margin between `solid` and `outline` variant */
  const spaceBetweenActions: IOSpacer = 16;
  /* Top padding applied above the actions */
  const topSpacingValue: IOSpacingScale = 16;
  const topSpacing = fixed ? topSpacingValue : 0;

  /* Background color should be app main background
     (both light and dark themes) */
  const HEADER_BG_COLOR: ColorValue = IOColors[theme["appBackground-primary"]];

  const getActionBlockMeasurements = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    /* Height of the safe bottom area, applied to the ScrollView:
       Actions + Screen end margin */
    const safeBottomAreaHeight =
      bottomMargin + height + IOSpacing.screenEndMargin;
    onMeasure?.({ safeBottomAreaHeight });
  };

  return (
    <View
      style={[
        {
          width: "100%",
          paddingBottom: bottomMargin
        },
        fixed
          ? {
              position: "absolute",
              bottom: 0,
              backgroundColor: HEADER_BG_COLOR
            }
          : { marginTop: IOSpacing.screenEndMargin },
        /* Apply shadow only on light theme OR if fixed */
        fixed || themeType === "light" ? styles.blockShadow : {},
        /* Apply bottom border only on dark theme */
        themeType === "dark" && {
          borderTopColor: IOColors[theme["divider-bottomBar"]],
          borderTopWidth: 1
        }
      ]}
      testID={testID}
    >
      <View
        style={[styles.buttonContainer, { paddingTop: topSpacing }]}
        onLayout={getActionBlockMeasurements}
        pointerEvents="box-none"
      >
        <View
          style={{
            flexDirection: "row",
            gap: spaceBetweenActions
          }}
        >
          <View style={styles.buttonWrapper}>
            <IOButton variant="outline" fullWidth {...startAction} />
          </View>
          <View style={styles.buttonWrapper}>
            <IOButton variant="solid" fullWidth {...endAction} />
          </View>
        </View>
      </View>
    </View>
  );
};
