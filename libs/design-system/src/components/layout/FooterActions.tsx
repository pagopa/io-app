import { Fragment, PropsWithChildren, useState } from "react";
import {
  ColorValue,
  LayoutChangeEvent,
  LayoutRectangle,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from "react-native";
import Animated, { AnimatedStyle } from "react-native-reanimated";

import { useIOTheme } from "../../context";
import {
  buttonSolidHeight,
  footerBoxShadow,
  hexToRgba,
  IOColors,
  IOSpacer,
  IOSpacing,
  IOVisualCostants
} from "../../core";
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
    /* Show the following elements:
       - Opaque red background to show the component boundaries
       - Height of the component */
    debugMode?: boolean;
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

/* Margin between `solid` and `variant` variant */
const spaceBetweenActions: IOSpacer = 16;
/* Margin between `solid` and `link` variant */
const spaceBetweenActionAndLink: IOSpacer = 16;

const styles = StyleSheet.create({
  buttonContainer: {
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    width: "100%",
    flexShrink: 0
  },
  debugText: {
    position: "absolute",
    right: 8,
    top: -16,
    color: IOColors.black,
    fontSize: 9,
    opacity: 0.75
  }
});

export const FooterActions = ({
  actions,
  excludeSafeAreaMargins = false,
  animatedStyles,
  fixed = true,
  transparent = false,
  onMeasure,
  testID,
  debugMode = false
}: FooterActionsProps) => {
  const theme = useIOTheme();

  const { bottomMargin, extraBottomMargin } = useBottomMargins(
    !!actions?.secondary,
    excludeSafeAreaMargins
  );

  /* Total height of actions */
  const [actionBlockHeight, setActionBlockHeight] =
    useState<LayoutRectangle["height"]>(0);

  /* Background color should be app main background
     (both light and dark themes) */
  const HEADER_BG_COLOR: ColorValue = IOColors[theme["appBackground-primary"]];
  const TRANSPARENT_BG_COLOR: ColorValue = "transparent";

  /* Safe background block. Cover everything until it reaches
     the half of the primary action button. It avoids
     glitchy behavior underneath.  */
  const safeBackgroundBlockHeight =
    bottomMargin + actionBlockHeight - buttonSolidHeight / 2;

  const getActionBlockMeasurements = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setActionBlockHeight(height);
    /* Height of the safe bottom area, applied to the ScrollView:
       Actions + Content end margin */
    const safeBottomAreaHeight =
      bottomMargin + height + IOSpacing.screenEndMargin;
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
          : { marginTop: IOSpacing.screenEndMargin },
        debugMode && {
          backgroundColor: hexToRgba(IOColors["error-500"], 0.15)
        },
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
        {debugMode && (
          <Text style={styles.debugText}>{`Height: ${actionBlockHeight}`}</Text>
        )}

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
      {primaryAction && (
        <IOButton fullWidth variant="solid" {...primaryAction} />
      )}
      {type === "TwoButtons" && secondaryAction && (
        <View style={{ alignSelf: "center", marginBottom: extraBottomMargin }}>
          <VSpacer size={spaceBetweenActionAndLink} />
          <IOButton variant="link" {...secondaryAction} />
        </View>
      )}
      {type === "ThreeButtons" && (
        <>
          {secondaryAction && (
            <>
              <VSpacer size={spaceBetweenActions} />
              <IOButton fullWidth variant="outline" {...secondaryAction} />
            </>
          )}
          {tertiaryAction && (
            <View
              style={{ alignSelf: "center", marginBottom: extraBottomMargin }}
            >
              <VSpacer size={spaceBetweenActionAndLink} />
              <IOButton variant="link" {...tertiaryAction} />
            </View>
          )}
        </>
      )}
    </Fragment>
  );
};
