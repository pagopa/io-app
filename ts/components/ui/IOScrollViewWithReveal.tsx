/* eslint-disable functional/immutable-data */
import {
  HeaderSecondLevel,
  IOButton,
  IOButtonBlockSpecificProps,
  IOButtonLinkSpecificProps,
  IOColors,
  IOSpacer,
  IOSpacingScale,
  IOVisualCostants,
  VSpacer,
  hexToRgba,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";

import {
  ComponentProps,
  Fragment,
  PropsWithChildren,
  useLayoutEffect,
  useMemo,
  useState
} from "react";

import {
  ColorValue,
  LayoutChangeEvent,
  LayoutRectangle,
  RefreshControl,
  RefreshControlProps,
  StyleSheet,
  View,
  ViewStyle
} from "react-native";
import { easeGradient } from "react-native-easing-gradient";
import LinearGradient from "react-native-linear-gradient";
import Animated, {
  AnimatedRef,
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated";
import { useStatusAlertProps } from "../../hooks/useStatusAlertProps";
import { WithTestID } from "../../types/WithTestID";
import { useFooterActionsMargin } from "../../hooks/useFooterActionsMargin";

type ButtonBlockProps = Omit<
  IOButtonBlockSpecificProps,
  "fullWidth" | "variant" | "color"
>;

type ButtonLinkProps = Omit<IOButtonLinkSpecificProps, "color" | "variant">;

export type IOScrollViewRevealActions = {
  primary: ButtonBlockProps;
  anchor: ButtonLinkProps;
};

type IOScrollViewWithRevealProps = WithTestID<
  PropsWithChildren<{
    headerConfig?: ComponentProps<typeof HeaderSecondLevel>;
    actions?: IOScrollViewRevealActions;
    debugMode?: boolean;
    animatedRef?: AnimatedRef<Animated.ScrollView>;
  }>
>;

/* Percentage of scrolled content that triggers
   the gradient opaciy transition */
const gradientOpacityScrollTrigger = 0.85;
/* Extended gradient area above the actions */
const gradientSafeAreaHeight: number = 120;
/* End content margin before the actions */
const contentEndMargin: IOSpacingScale = 32;
/* Margin between solid variant and link variant */
const spaceBetweenActionAndLink: IOSpacer = 16;
/* Extra bottom margin for iPhone bottom handle because
   Link variant doesn't have a fixed height */
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
  testID
}: IOScrollViewWithRevealProps) => {
  const alertProps = useStatusAlertProps();
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

  const { bottomMargin, needSafeAreaMargin } = useFooterActionsMargin();

  /* GENERATE EASING GRADIENT */
  const APP_BG_COLOR: ColorValue = IOColors[theme["appBackground-accent"]];

  const { colors, locations } = easeGradient({
    colorStops: {
      0: { color: hexToRgba(APP_BG_COLOR, 0) },
      1: { color: APP_BG_COLOR }
    },
    easing: Easing.ease,
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
      Extrapolation.CLAMP
    )
  }));

  const ignoreSafeAreaMargin = useMemo(() => {
    if (alertProps !== undefined) {
      return true;
    }
    return headerConfig?.ignoreSafeAreaMargin;
  }, [headerConfig?.ignoreSafeAreaMargin, alertProps]);

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
            paddingBottom: actions
              ? safeBottomAreaHeight
              : bottomMargin + contentEndMargin,
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

export const renderActionButtons = (
  actions: IOScrollViewRevealActions,
  extraBottomMargin: number
) => {
  const { primary: primaryAction, anchor: anchorAction } = actions;

  return (
    <>
      {anchorAction && (
        <View
          style={{
            alignSelf: "center",
            marginBottom: extraBottomMargin
          }}
        >
          <IOButton variant="link" color="contrast" {...anchorAction} />
          <VSpacer size={spaceBetweenActionAndLink} />
        </View>
      )}

      {primaryAction && (
        <IOButton
          variant="solid"
          color="contrast"
          fullWidth
          {...primaryAction}
        />
      )}
    </>
  );
};
