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
  IOColors,
  IOSpacer,
  IOSpacing,
  IOVisualCostants,
  buttonSolidHeight,
  hexToRgba
} from "../../core";
import { WithTestID } from "../../utils/types";
import {
  IOButton,
  IOButtonBlockSpecificProps,
  IOButtonLinkSpecificProps
} from "../buttons";
import { VSpacer } from "./Spacer";
import { useBottomMargins } from "./hooks/useBottomMargins";

type IOButtonBlockProps = Omit<
  IOButtonBlockSpecificProps,
  "variant" | "fullWidth"
>;
type IOButtonLinkProps = Omit<IOButtonLinkSpecificProps, "variant">;

type FooterSingleButton = {
  type: "SingleButton";
  primary: IOButtonBlockProps;
  secondary?: never;
  tertiary?: never;
};

type FooterTwoButtons = {
  type: "TwoButtons";
  primary: IOButtonBlockProps;
  secondary: IOButtonLinkProps;
  tertiary?: never;
};

type FooterThreeButtons = {
  type: "ThreeButtons";
  primary: IOButtonBlockProps;
  secondary: IOButtonBlockProps;
  tertiary: IOButtonLinkProps;
};

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

type FooterActions = FooterSingleButton | FooterTwoButtons | FooterThreeButtons;

type FooterAnimatedStyles = {
  /* Apply object returned by `useAnimatedStyle` to the main block */
  mainBlock?: AnimatedStyle<ViewStyle>;
  /* Apply object returned by `useAnimatedStyle` to the background */
  background?: AnimatedStyle<ViewStyle>;
};

type FooterActionsProps = WithTestID<
  PropsWithChildren<{
    actions?: FooterActions;
    onMeasure?: (measurements: FooterActionsMeasurements) => void;
    animatedStyles?: FooterAnimatedStyles;
    /* Make the background transparent */
    transparent?: boolean;
    /* Don't include safe area insets */
    excludeSafeAreaMargins?: boolean;
    /* Fixed at the bottom of the screen */
    fixed?: boolean;
    /* Show the following elements:
       - Opaque red background to show the component boundaries
       - Height of the component */
    debugMode?: boolean;
  }>
>;

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
  },
  blockShadow: {
    shadowColor: IOColors.black,
    shadowOffset: {
      width: 0,
      height: -4
    },
    shadowOpacity: 0.1,
    shadowRadius: 32
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
        style={[
          {
            ...(fixed && {
              width: "100%",
              height: safeBackgroundBlockHeight,
              position: "absolute",
              bottom: 0,
              backgroundColor: transparent
                ? TRANSPARENT_BG_COLOR
                : HEADER_BG_COLOR
            }),
            ...(fixed ? styles.blockShadow : null)
          },
          animatedStyles?.background
        ]}
        pointerEvents="none"
      />

      <View
        style={styles.buttonContainer}
        onLayout={getActionBlockMeasurements}
        pointerEvents="box-none"
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
        <IOButton variant="solid" fullWidth {...primaryAction} />
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
              <IOButton variant="outline" fullWidth {...secondaryAction} />
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
