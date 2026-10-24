import { PropsWithChildren } from "react";
import { ColorValue, LayoutChangeEvent, StyleSheet, View } from "react-native";

import { useIOTheme, useIOThemeContext } from "../../context";
import { footerBoxShadow, IOColors, IODimensions } from "../../core";
import { WithTestID } from "../../utils/types";
import { IOButton, IOButtonBlockSpecificProps } from "../buttons";
import { useBottomMargins } from "./hooks/useBottomMargins";

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
    endAction: IOButtonBlockProps;
    /* Don't include safe area insets */
    excludeSafeAreaMargins?: boolean;
    /* Fixed at the bottom of the screen */
    fixed?: boolean;
    onMeasure?: (measurements: FooterActionsInlineMeasurements) => void;
    startAction: IOButtonBlockProps;
  }>
>;

type IOButtonBlockProps = Omit<
  IOButtonBlockSpecificProps,
  "fullWidth" | "variant"
>;

const styles = StyleSheet.create({
  buttonContainer: {
    paddingHorizontal: IODimensions.padding.screen.default,
    width: "100%",
    flexShrink: 0
  },
  buttonWrapper: {
    flex: 1
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

  const topSpacing = fixed ? IODimensions.padding.footer.vertical : 0;

  /* Background color should be app main background
     (both light and dark themes) */
  const HEADER_BG_COLOR: ColorValue = IOColors[theme["appBackground-primary"]];

  const getActionBlockMeasurements = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    /* Height of the safe bottom area, applied to the ScrollView:
       Actions + Screen end margin */
    const safeBottomAreaHeight =
      bottomMargin + height + IODimensions.padding.screen.end;
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
              backgroundColor: HEADER_BG_COLOR,
              boxShadow: [footerBoxShadow]
            }
          : { marginTop: IODimensions.padding.screen.end },
        /* Apply bottom border only on dark theme, only if fixed */
        themeType === "dark" &&
          fixed && {
            borderTopColor: IOColors[theme["divider-bottomBar"]],
            borderTopWidth: 1
          }
      ]}
      testID={testID}
    >
      <View
        onLayout={getActionBlockMeasurements}
        pointerEvents="box-none"
        style={[styles.buttonContainer, { paddingTop: topSpacing }]}
      >
        <View
          style={{
            flexDirection: "row",
            gap: IODimensions.gap.footer.actions
          }}
        >
          <View style={styles.buttonWrapper}>
            <IOButton fullWidth variant="outline" {...startAction} />
          </View>
          <View style={styles.buttonWrapper}>
            <IOButton fullWidth variant="solid" {...endAction} />
          </View>
        </View>
      </View>
    </View>
  );
};
