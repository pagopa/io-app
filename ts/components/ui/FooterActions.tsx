import {
  ButtonLink,
  ButtonOutline,
  ButtonSolid,
  IOColors,
  IOSpacer,
  IOSpacingScale,
  IOVisualCostants,
  VSpacer,
  buttonSolidHeight,
  hexToRgba,
  useIOExperimentalDesign,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as React from "react";
import {
  ComponentProps,
  Fragment,
  PropsWithChildren,
  useMemo,
  useState
} from "react";
import {
  View,
  StyleSheet,
  LayoutRectangle,
  LayoutChangeEvent,
  ColorValue
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WithTestID } from "../../types/WithTestID";

type FooterSingleButton = {
  type: "SingleButton";
  primary: Omit<ComponentProps<typeof ButtonSolid>, "fullWidth">;
  secondary?: never;
  tertiary?: never;
};

type FooterTwoButtons = {
  type: "TwoButtons";
  primary: Omit<ComponentProps<typeof ButtonSolid>, "fullWidth">;
  secondary: Omit<ComponentProps<typeof ButtonLink>, "color">;
  tertiary?: never;
};

type FooterThreeButtons = {
  type: "ThreeButtons";
  primary: Omit<ComponentProps<typeof ButtonSolid>, "fullWidth">;
  secondary: Omit<ComponentProps<typeof ButtonOutline>, "fullWidth" | "color">;
  tertiary: Omit<ComponentProps<typeof ButtonLink>, "color">;
};

type FooterActions = FooterSingleButton | FooterTwoButtons | FooterThreeButtons;

type FooterActionsProps = WithTestID<
  PropsWithChildren<{
    actions?: FooterActions;
    debugMode?: boolean;
    /* Don't include safe area insets */
    excludeSafeAreaMargins?: boolean;
    /* Include page margins */
    includeContentMargins?: boolean;
  }>
>;

/* End content margin before the actions */
const contentEndMargin: IOSpacingScale = 32;
/* Margin between ButtonSolid and ButtonOutline */
const spaceBetweenActions: IOSpacer = 16;
/* Margin between ButtonSolid and ButtonLink */
const spaceBetweenActionAndLink: IOSpacer = 16;
/* Extra bottom margin for iPhone bottom handle because
   ButtonLink doesn't have a fixed height */
const extraSafeAreaMargin: IOSpacingScale = 8;

const styles = StyleSheet.create({
  buttonContainer: {
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    width: "100%",
    flexShrink: 0
  }
});

export const FooterActions = ({
  actions,
  excludeSafeAreaMargins = false,
  // includeContentMargins = true,
  testID
}: FooterActionsProps) => {
  const theme = useIOTheme();
  const { isExperimental } = useIOExperimentalDesign();

  const type = actions?.type;
  const primaryAction = actions?.primary;
  const secondaryAction = actions?.secondary;
  const tertiaryAction = actions?.tertiary;

  /* Total height of actions */
  const [actionBlockHeight, setActionBlockHeight] =
    useState<LayoutRectangle["height"]>(0);

  const getActionBlockHeight = (event: LayoutChangeEvent) => {
    setActionBlockHeight(event.nativeEvent.layout.height);
  };

  /* Background color should be app main background
     (both light and dark themes) */
  const HEADER_BG_COLOR: ColorValue = IOColors[theme["appBackground-primary"]];
  const BUTTONSOLID_HEIGHT = isExperimental ? buttonSolidHeight : 40;

  const insets = useSafeAreaInsets();
  const needSafeAreaMargin = useMemo(() => insets.bottom !== 0, [insets]);
  const safeAreaMargin = useMemo(() => insets.bottom, [insets]);

  /* Check if the iPhone bottom handle is present.
     If not, or if you don't need safe area insets,
     add a default margin to prevent the button
     from sticking to the bottom. */
  const bottomMargin: number = useMemo(
    () =>
      !needSafeAreaMargin || excludeSafeAreaMargins
        ? IOVisualCostants.appMarginDefault
        : safeAreaMargin,
    [needSafeAreaMargin, excludeSafeAreaMargins, safeAreaMargin]
  );

  /* Total height of "Actions + Gradient" area */
  const footerActionsHeight: number = useMemo(
    () => bottomMargin + actionBlockHeight,
    [actionBlockHeight, bottomMargin]
  );

  /* When the secondary action is visible, add extra margin
     to avoid little space from iPhone bottom handle */
  const extraBottomMargin: number = useMemo(
    () => (secondaryAction && needSafeAreaMargin ? extraSafeAreaMargin : 0),
    [needSafeAreaMargin, secondaryAction]
  );

  /* Safe background block. Cover at least 85% of the space
     to avoid glitchy elements underneath */
  const safeBackgroundBlockHeight: number = useMemo(
    () => bottomMargin + actionBlockHeight - BUTTONSOLID_HEIGHT / 2,
    [BUTTONSOLID_HEIGHT, actionBlockHeight, bottomMargin]
  );

  /* Height of the safe bottom area, applied to the ScrollView:
     Actions + Content end margin */
  // const safeBottomAreaHeight: number = useMemo(
  //   () => bottomMargin + actionBlockHeight + contentEndMargin,
  //   [actionBlockHeight, bottomMargin]
  // );

  // const opacityTransition = useAnimatedStyle(() => ({
  //   opacity: interpolate(
  //     scrollPositionPercentage.value,
  //     [0, gradientOpacityScrollTrigger, 1],
  //     [1, 1, 0],
  //     Extrapolate.CLAMP
  //   )
  // }));

  // eslint-disable-next-line no-console
  console.log("footerActionsHeight", footerActionsHeight);
  // eslint-disable-next-line no-console
  console.log("Bottom margin", bottomMargin);

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        width: "100%",
        paddingBottom: bottomMargin
      }}
      testID={testID}
    >
      {/* Safe background block. It's added because when you swipe up
          quickly, the content below is visible for about 100ms. Without this
          block, the content scrolls underneath. */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: safeBackgroundBlockHeight,
          backgroundColor: HEADER_BG_COLOR
        }}
        pointerEvents="none"
      />

      <View
        style={styles.buttonContainer}
        onLayout={getActionBlockHeight}
        pointerEvents="box-none"
      >
        {primaryAction && <ButtonSolid fullWidth {...primaryAction} />}

        {type === "TwoButtons" && (
          <View
            style={{
              alignSelf: "center",
              marginBottom: extraBottomMargin
            }}
          >
            <VSpacer size={spaceBetweenActionAndLink} />
            {secondaryAction && (
              <ButtonLink
                color="primary"
                {...(secondaryAction as ComponentProps<typeof ButtonLink>)}
              />
            )}
          </View>
        )}

        {type === "ThreeButtons" && (
          <Fragment>
            {secondaryAction && (
              <Fragment>
                <VSpacer size={spaceBetweenActions} />
                <ButtonOutline fullWidth color="primary" {...secondaryAction} />
              </Fragment>
            )}

            {tertiaryAction && (
              <View
                style={{
                  alignSelf: "center",
                  marginBottom: extraBottomMargin
                }}
              >
                <VSpacer size={spaceBetweenActionAndLink} />
                <ButtonLink color="primary" {...tertiaryAction} />
              </View>
            )}
          </Fragment>
        )}
      </View>
    </View>
  );
};
