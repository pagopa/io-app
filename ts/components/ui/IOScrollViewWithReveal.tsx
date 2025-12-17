/* eslint-disable functional/immutable-data */
import {
  HeaderSecondLevel,
  hexToRgba,
  IOButton,
  IOButtonLinkSpecificProps,
  IOColors,
  IOSpacer,
  IOSpacingScale,
  IOVisualCostants,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";

import {
  ComponentProps,
  Fragment,
  PropsWithChildren,
  useLayoutEffect,
  useMemo
} from "react";

import { ColorValue, StyleSheet, View } from "react-native";
import { easeGradient } from "react-native-easing-gradient";
import LinearGradient from "react-native-linear-gradient";
import Animated, {
  AnimatedRef,
  Easing,
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { useFooterActionsMargin } from "../../hooks/useFooterActionsMargin";
import { WithTestID } from "../../types/WithTestID";
import { useIOAlertVisible } from "../StatusMessages/IOAlertVisibleContext";
import { ButtonBlockProps } from "./utils/buttons";

type ButtonLinkProps = Omit<IOButtonLinkSpecificProps, "color" | "variant">;

export type IOScrollViewRevealActions = {
  primary: Omit<ButtonBlockProps, "color">;
  anchor: ButtonLinkProps;
};

type IOScrollViewWithRevealProps = WithTestID<
  PropsWithChildren<{
    headerConfig?: ComponentProps<typeof HeaderSecondLevel>;
    actions: IOScrollViewRevealActions;
    debugMode?: boolean;
    animatedRef: AnimatedRef<Animated.ScrollView>;
    hideAnchorAction: SharedValue<boolean>;
  }>
>;

/* Percentage of scrolled content that triggers
   the gradient opaciy transition */
const gradientOpacityScrollTrigger = 0.85;
/* Extended gradient area above the actions */
const gradientSafeAreaHeight: number = 80;
/* Margin between solid variant and link variant */
const spaceBetweenActionAndLink: IOSpacer = 16;
/* Extra bottom margin for iPhone bottom handle because
   Link variant doesn't have a fixed height */
const extraSafeAreaMargin: IOSpacingScale = 8;
const anchorLinkTransitionDuration: number = 600; // in ms

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
    position: "relative",
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    width: "100%",
    flexShrink: 0
  }
});

/**
 * The main scrollable container component.
 * It includes full support for custom headers and actions.
 *
 * @param [headerConfig] Configuration for the header component. Use this only if you need to configure a custom header from scratch.
 * If you need the predefined configuration with default `Back (<)` and `Help (?)` buttons, use `useHeaderSecondLevel`
 * @param {IOScrollViewActions} [actions] Actions to be rendered at the bottom of the `ScrollView`
 * @param [animatedRef] Ref generated through `useAnimatedRef` (used by `useScrollViewOffset` to get the scroll position)
 * @param {number} [snapOffset] Offset when you need to add a snap point
 * @param {boolean} [excludeSafeAreaMargins=false] Exclude safe area margins at the bottom of the `ScrollView`
 * This is useful if you have a screen with a tab bar at the bottom, or if the bottom margin is already being managed
 * @param {boolean} [excludeEndContentMargin=false] Exclude the end content margin
 * @param {boolean} [includeContentMargins=true] Include horizontal screen margins
 * @param {boolean} [debugMode=false] Enable debug mode. Only for testing purposes
 */
export const IOScrollViewWithReveal = ({
  headerConfig,
  children,
  actions,
  debugMode = false,
  animatedRef,
  hideAnchorAction,
  testID
}: IOScrollViewWithRevealProps) => {
  const { isAlertVisible } = useIOAlertVisible();
  const theme = useIOTheme();

  /* Navigation */
  const navigation = useNavigation();

  /* Shared Values for `reanimated` */
  const scrollPositionAbsolute =
    useSharedValue(0); /* Scroll position (Absolute) */
  const scrollPositionPercentage =
    useSharedValue(0); /* Scroll position (Relative) */

  /* We need a fixed height, because when the anchor action is hidden,
    there's a layout shift in the button container */
  const actionBlockHeight: number = 100;

  const { bottomMargin, needSafeAreaMargin } = useFooterActionsMargin();

  /* GENERATE EASING GRADIENT */
  const APP_BG_COLOR: ColorValue = IOColors[theme["appBackground-primary"]];

  const { colors, locations } = easeGradient({
    colorStops: {
      0: { color: hexToRgba(APP_BG_COLOR, 0) },
      1: { color: APP_BG_COLOR }
    },
    easing: Easing.out(Easing.ease),
    extraColorStopsPerTransition: 20
  });

  /* When the secondary action is visible, add extra margin
     to avoid little space from iPhone bottom handle */
  const extraBottomMargin =
    actions?.anchor && needSafeAreaMargin ? extraSafeAreaMargin : 0;

  /* Safe background block. Cover at least 85% of the space
     to avoid glitchy elements underneath */
  const safeBackgroundBlockHeight = bottomMargin + actionBlockHeight * 0.5;

  /* Total height of "Actions + Gradient" area */
  const gradientAreaHeight =
    bottomMargin + actionBlockHeight + gradientSafeAreaHeight;

  /* Height of the safe bottom area, applied to the ScrollView:
     Actions + Content end margin */
  const safeBottomAreaHeight = bottomMargin + actionBlockHeight;

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
      Extrapolation.CLAMP
    )
  }));

  const ignoreSafeAreaMargin = useMemo(() => {
    if (isAlertVisible) {
      return true;
    }
    return headerConfig?.ignoreSafeAreaMargin;
  }, [headerConfig?.ignoreSafeAreaMargin, isAlertVisible]);

  /* Set custom header with `react-navigation` library using
     `useLayoutEffect` hook */

  useLayoutEffect(() => {
    if (headerConfig) {
      navigation.setOptions({
        header: () => (
          <HeaderSecondLevel
            {...headerConfig}
            ignoreSafeAreaMargin={ignoreSafeAreaMargin}
          />
        ),
        headerTransparent: headerConfig.transparent
      });
    }
  }, [headerConfig, navigation, scrollPositionAbsolute, ignoreSafeAreaMargin]);

  const anchorLinkHeight = useSharedValue(0);

  const anchorLinkAnimatedStyle = useAnimatedStyle(() => {
    const transitionConfig = {
      duration: anchorLinkTransitionDuration,
      easing: Easing.inOut(Easing.exp)
    };

    return {
      opacity: withTiming(hideAnchorAction.value ? 0 : 1, transitionConfig),
      transform: [
        {
          translateY: withTiming(
            hideAnchorAction.value ? anchorLinkHeight.value : 0,
            transitionConfig
          )
        }
      ]
    };
  });

  return (
    <Fragment>
      <Animated.ScrollView
        ref={animatedRef}
        testID={testID}
        onScroll={handleScroll}
        scrollEventThrottle={8}
        snapToEnd={false}
        decelerationRate="normal"
        contentContainerStyle={[
          {
            paddingBottom: actions ? safeBottomAreaHeight : bottomMargin,
            flexGrow: 1
          }
        ]}
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
          pointerEvents="box-none"
          {...(testID && { testID: `${testID}-actions` })}
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
                backgroundColor: APP_BG_COLOR
              }}
            />
          </Animated.View>
          <View style={styles.buttonContainer} pointerEvents="box-none">
            <Animated.View
              onLayout={event => {
                anchorLinkHeight.value = event.nativeEvent.layout.height;
              }}
              style={[{ alignSelf: "center" }, anchorLinkAnimatedStyle]}
            >
              <IOButton variant="link" {...actions.anchor} />
              <VSpacer size={spaceBetweenActionAndLink} />
            </Animated.View>

            <View style={{ marginBottom: extraBottomMargin }}>
              <IOButton variant="solid" fullWidth {...actions.primary} />
            </View>
          </View>
        </View>
      )}
    </Fragment>
  );
};
