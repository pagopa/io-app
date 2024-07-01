/* eslint-disable functional/immutable-data */
import {
  ButtonLink,
  ButtonOutline,
  ButtonSolid,
  HeaderSecondLevel,
  IOColors,
  IOSpacer,
  IOSpacingScale,
  IOVisualCostants,
  VSpacer,
  hexToRgba,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as React from "react";
import {
  ComponentProps,
  Fragment,
  PropsWithChildren,
  useLayoutEffect,
  useState
} from "react";
import {
  ColorValue,
  LayoutChangeEvent,
  LayoutRectangle,
  StyleSheet,
  View
} from "react-native";
import { easeGradient } from "react-native-easing-gradient";
import LinearGradient from "react-native-linear-gradient";
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { WithTestID } from "../../types/WithTestID";

export type IOScrollViewActions =
  | {
      type: "SingleButton";
      primary: Omit<ComponentProps<typeof ButtonSolid>, "fullWidth">;
      secondary?: never;
      tertiary?: never;
    }
  | {
      type: "TwoButtons";
      primary: Omit<ComponentProps<typeof ButtonSolid>, "fullWidth">;
      secondary: Omit<ComponentProps<typeof ButtonLink>, "color">;
      tertiary?: never;
    }
  | {
      type: "ThreeButtons";
      primary: Omit<ComponentProps<typeof ButtonSolid>, "fullWidth">;
      secondary: Omit<
        ComponentProps<typeof ButtonOutline>,
        "fullWidth" | "color"
      >;
      tertiary: Omit<ComponentProps<typeof ButtonLink>, "color">;
    };

type IOSCrollViewHeaderScrollValues = ComponentProps<
  typeof HeaderSecondLevel
>["scrollValues"];

type IOScrollView = WithTestID<
  PropsWithChildren<{
    headerConfig?: ComponentProps<typeof HeaderSecondLevel>;
    actions?: IOScrollViewActions;
    debugMode?: boolean;
    snapOffset?: number;
    /* Don't include safe area insets */
    excludeSafeAreaMargins?: boolean;
    /* Don't include end content margin */
    excludeEndContentMargin?: boolean;
    /* Include page margins */
    includeContentMargins?: boolean;
  }>
>;

/* Percentage of scrolled content that triggers
   the gradient opaciy transition */
const gradientOpacityScrollTrigger = 0.85;
/* Extended gradient area above the actions */
const gradientSafeAreaHeight: IOSpacingScale = 96;
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
  gradientBottomActions: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    justifyContent: "flex-end"
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject
  },
  buttonContainer: {
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    width: "100%",
    flexShrink: 0
  }
});

export const IOScrollView = ({
  headerConfig,
  children,
  actions,
  snapOffset,
  excludeSafeAreaMargins = false,
  excludeEndContentMargin = false,
  includeContentMargins = true,
  debugMode = false,
  testID
}: IOScrollView) => {
  const theme = useIOTheme();

  /* Navigation */
  const navigation = useNavigation();

  /* Shared Values for `reanimated` */
  const scrollPositionAbsolute =
    useSharedValue(0); /* Scroll position (Absolute) */
  const scrollPositionPercentage =
    useSharedValue(0); /* Scroll position (Relative) */

  /* Total height of actions */
  const [actionBlockHeight, setActionBlockHeight] =
    useState<LayoutRectangle["height"]>(0);

  const getActionBlockHeight = (event: LayoutChangeEvent) => {
    setActionBlockHeight(event.nativeEvent.layout.height);
  };

  const insets = useSafeAreaInsets();
  const needSafeAreaMargin = insets.bottom !== 0;

  /* Check if the iPhone bottom handle is present.
     If not, or if you don't need safe area insets,
     add a default margin to prevent the button
     from sticking to the bottom. */
  const bottomMargin =
    !needSafeAreaMargin || excludeSafeAreaMargins
      ? IOVisualCostants.appMarginDefault
      : insets.bottom;

  /* GENERATE EASING GRADIENT
     Background color should be app main background
     (both light and dark themes) */
  const HEADER_BG_COLOR: ColorValue = IOColors[theme["appBackground-primary"]];

  const { colors, locations } = easeGradient({
    colorStops: {
      0: { color: hexToRgba(HEADER_BG_COLOR, 0) },
      1: { color: HEADER_BG_COLOR }
    },
    easing: Easing.ease,
    extraColorStopsPerTransition: 20
  });

  /* When the secondary action is visible, add extra margin
     to avoid little space from iPhone bottom handle */
  const extraBottomMargin =
    actions?.secondary && needSafeAreaMargin ? extraSafeAreaMargin : 0;

  /* Safe background block. Cover at least 85% of the space
     to avoid glitchy elements underneath */
  const safeBackgroundBlockHeight = (bottomMargin + actionBlockHeight) * 0.85;

  /* Total height of "Actions + Gradient" area */
  const gradientAreaHeight =
    bottomMargin + actionBlockHeight + gradientSafeAreaHeight;

  /* Height of the safe bottom area, applied to the ScrollView:
     Actions + Content end margin */
  const safeBottomAreaHeight =
    bottomMargin + actionBlockHeight + contentEndMargin;

  const handleScroll = useAnimatedScrollHandler(
    ({ contentOffset, layoutMeasurement, contentSize }) => {
      const scrollPosition = contentOffset.y;
      const maxScrollHeight = contentSize.height - layoutMeasurement.height;
      const scrollPercentage = scrollPosition / maxScrollHeight;

      scrollPositionAbsolute.value = scrollPosition;
      scrollPositionPercentage.value = scrollPercentage;
    }
  );

  const opacityTransition = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollPositionPercentage.value,
      [0, gradientOpacityScrollTrigger, 1],
      [1, 1, 0],
      Extrapolate.CLAMP
    )
  }));

  /* Set custom header with `react-navigation` library using
     `useLayoutEffect` hook */

  useLayoutEffect(() => {
    const scrollValues: IOSCrollViewHeaderScrollValues = {
      contentOffsetY: scrollPositionAbsolute,
      triggerOffset: snapOffset || 0
    };

    if (headerConfig) {
      navigation.setOptions({
        header: () => (
          <HeaderSecondLevel {...headerConfig} scrollValues={scrollValues} />
        ),
        headerTransparent: headerConfig.transparent
      });
    }
  }, [headerConfig, navigation, scrollPositionAbsolute, snapOffset]);

  return (
    <Fragment>
      <Animated.ScrollView
        testID={testID}
        onScroll={handleScroll}
        scrollEventThrottle={8}
        snapToOffsets={[0, snapOffset || 0]}
        snapToEnd={false}
        decelerationRate="normal"
        contentContainerStyle={{
          paddingBottom: excludeEndContentMargin
            ? 0
            : actions
            ? safeBottomAreaHeight
            : bottomMargin + contentEndMargin,
          paddingHorizontal: includeContentMargins
            ? IOVisualCostants.appMarginDefault
            : 0
        }}
      >
        {children}
      </Animated.ScrollView>
      {actions && (
        <View
          style={[
            styles.gradientBottomActions,
            {
              height: gradientAreaHeight,
              paddingBottom: bottomMargin
            }
          ]}
          testID={testID}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.gradientContainer,
              debugMode && {
                backgroundColor: hexToRgba(IOColors["error-500"], 0.15)
              }
            ]}
            pointerEvents="none"
          >
            <Animated.View
              style={[
                opacityTransition,
                debugMode && {
                  borderTopColor: IOColors["error-500"],
                  borderTopWidth: 1,
                  backgroundColor: hexToRgba(IOColors["error-500"], 0.4)
                }
              ]}
            >
              <LinearGradient
                style={{
                  height: gradientAreaHeight - safeBackgroundBlockHeight
                }}
                locations={locations}
                colors={colors}
              />
            </Animated.View>

            {/* Safe background block. It's added because when you swipe up
                quickly, the content below is visible for about 100ms. Without this
                block, the content appears glitchy. */}
            <View
              style={{
                bottom: 0,
                height: safeBackgroundBlockHeight,
                backgroundColor: HEADER_BG_COLOR
              }}
            />
          </Animated.View>
          <View
            style={styles.buttonContainer}
            onLayout={getActionBlockHeight}
            pointerEvents="box-none"
          >
            {renderActionButtons(actions, extraBottomMargin)}
          </View>
        </View>
      )}
    </Fragment>
  );
};

const renderActionButtons = (
  actions: IOScrollViewActions,
  extraBottomMargin: number
) => {
  const {
    type,
    primary: primaryAction,
    secondary: secondaryAction,
    tertiary: tertiaryAction
  } = actions;

  return (
    <>
      {primaryAction && <ButtonSolid fullWidth {...primaryAction} />}

      {type === "TwoButtons" && (
        <View
          style={{
            alignSelf: "center",
            marginBottom: extraBottomMargin
          }}
        >
          <VSpacer size={spaceBetweenActionAndLink} />
          <ButtonLink
            color="primary"
            {...(secondaryAction as ComponentProps<typeof ButtonLink>)}
          />
        </View>
      )}

      {type === "ThreeButtons" && (
        <Fragment>
          <VSpacer size={spaceBetweenActions} />
          <ButtonOutline fullWidth color="primary" {...secondaryAction} />

          <View
            style={{
              alignSelf: "center",
              marginBottom: extraBottomMargin
            }}
          >
            <VSpacer size={spaceBetweenActionAndLink} />
            <ButtonLink color="primary" {...tertiaryAction} />
          </View>
        </Fragment>
      )}
    </>
  );
};
