import { Fragment, PropsWithChildren, useState } from "react";
import {
  ColorValue,
  LayoutChangeEvent,
  LayoutRectangle,
  StyleSheet,
  View,
  ViewStyle
} from "react-native";
import Animated, { AnimatedStyle } from "react-native-reanimated";

import { useIOColors } from "../../context";
import { footerBoxShadow, IODimensions } from "../../core";
import { WithTestID } from "../../utils/types";
import {
  IOButton,
  IOButtonBlockSpecificProps,
  IOButtonLinkSpecificProps
} from "../buttons";
import { useBottomMargins } from "./hooks/useBottomMargins";
import { VSpacer } from "./Spacer";

export type FooterActionsMeasurements = {
  // Height of the "Actions" block
  actionBlockHeight: number;
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
type FooterActions = FooterSingleButton | FooterThreeButtons | FooterTwoButtons;

type FooterActionsProps = WithTestID<
  PropsWithChildren<{
    actions?: FooterActions;
    animatedStyles?: FooterAnimatedStyles;
    /* Don't include safe area insets */
    excludeSafeAreaMargins?: boolean;
    /* Fixed at the bottom of the screen */
    fixed?: boolean;
    onMeasure?: (measurements: FooterActionsMeasurements) => void;
    /* Make the background transparent */
    transparent?: boolean;
  }>
>;

type FooterAnimatedStyles = {
  /* Apply object returned by `useAnimatedStyle` to the background */
  background?: AnimatedStyle<ViewStyle>;
  /* Apply object returned by `useAnimatedStyle` to the main block */
  mainBlock?: AnimatedStyle<ViewStyle>;
};

type FooterSingleButton = {
  primary: IOButtonBlockProps;
  secondary?: never;
  tertiary?: never;
  type: "SingleButton";
};

type FooterThreeButtons = {
  primary: IOButtonBlockProps;
  secondary: IOButtonBlockProps;
  tertiary: IOButtonLinkProps;
  type: "ThreeButtons";
};

type FooterTwoButtons = {
  primary: IOButtonBlockProps;
  secondary: IOButtonLinkProps;
  tertiary?: never;
  type: "TwoButtons";
};

type IOButtonBlockProps = Omit<
  IOButtonBlockSpecificProps,
  "fullWidth" | "variant"
>;

type IOButtonLinkProps = Omit<IOButtonLinkSpecificProps, "variant">;

const styles = StyleSheet.create({
  buttonContainer: {
    paddingHorizontal: IODimensions.padding.screen.default,
    width: "100%",
    flexShrink: 0
  }
});

export const FooterActions = ({
  actions,
  excludeSafeAreaMargins = false,
  animatedStyles,
  fixed = true,
  transparent = false,
  onMeasure,
  testID
}: FooterActionsProps) => {
  const footerColors = useIOColors().component.footer;

  const { bottomMargin, extraBottomMargin } = useBottomMargins(
    !!actions?.secondary,
    excludeSafeAreaMargins
  );

  /* Total height of actions */
  const [actionBlockHeight, setActionBlockHeight] =
    useState<LayoutRectangle["height"]>(0);

  /* Background color should be app main background
     (both light and dark themes) */
  const HEADER_BG_COLOR: ColorValue = footerColors.background;
  const TRANSPARENT_BG_COLOR: ColorValue = "transparent";

  /* Safe background block. Cover everything until it reaches
     the half of the primary action button. It avoids
     glitchy behavior underneath.  */
  const safeBackgroundBlockHeight =
    bottomMargin + actionBlockHeight - IODimensions.height.button / 2;

  const getActionBlockMeasurements = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setActionBlockHeight(height);
    /* Height of the safe bottom area, applied to the ScrollView:
       Actions + Content end margin */
    const safeBottomAreaHeight =
      bottomMargin + height + IODimensions.padding.screen.end;
    onMeasure?.({ actionBlockHeight: height, safeBottomAreaHeight });
  };

  return (
    <Animated.View
      style={[
        {
          width: "100%",
          paddingBottom: bottomMargin
        },
        fixed
          ? { position: "absolute", bottom: 0 }
          : { marginTop: IODimensions.padding.screen.end },
        animatedStyles?.mainBlock
      ]}
      testID={testID}
    >
      {/* Safe background block. It's added because when you swipe up
          quickly, the content below is visible for about 100ms. Without this
          block, the content scrolls underneath. */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            ...(fixed && {
              width: "100%",
              height: safeBackgroundBlockHeight,
              position: "absolute",
              bottom: 0,
              boxShadow: [footerBoxShadow],
              backgroundColor: transparent
                ? TRANSPARENT_BG_COLOR
                : HEADER_BG_COLOR
            })
          },
          animatedStyles?.background
        ]}
      />

      <View
        onLayout={getActionBlockMeasurements}
        pointerEvents="box-none"
        style={styles.buttonContainer}
      >
        {renderActions(actions, extraBottomMargin)}
      </View>
    </Animated.View>
  );
};

const renderActions = (
  actions: FooterActions | undefined,
  extraBottomMargin: number
) => {
  if (!actions) {
    return null;
  }
  const {
    type,
    primary: primaryAction,
    secondary: secondaryAction,
    tertiary: tertiaryAction
  } = actions;
  return (
    <Fragment>
      {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
      {primaryAction && (
        <IOButton fullWidth variant="solid" {...primaryAction} />
      )}
      {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
      {type === "TwoButtons" && secondaryAction && (
        <View style={{ alignSelf: "center", marginBottom: extraBottomMargin }}>
          <VSpacer size={IODimensions.gap.footer.link} />
          <IOButton variant="link" {...secondaryAction} />
        </View>
      )}
      {type === "ThreeButtons" && (
        <>
          {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
          {secondaryAction && (
            <>
              <VSpacer size={IODimensions.gap.footer.actions} />
              <IOButton fullWidth variant="outline" {...secondaryAction} />
            </>
          )}
          {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
          {tertiaryAction && (
            <View
              style={{ alignSelf: "center", marginBottom: extraBottomMargin }}
            >
              <VSpacer size={IODimensions.gap.footer.link} />
              <IOButton variant="link" {...tertiaryAction} />
            </View>
          )}
        </>
      )}
    </Fragment>
  );
};
