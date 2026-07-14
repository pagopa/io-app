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
} from "@io-app/design-system";
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

import { GuidedTour } from "../../features/tour/components/GuidedTour";
import { useFooterActionsMargin } from "../../hooks/useFooterActionsMargin";
import { WithTestID } from "../../types/WithTestID";
import { useIOAlertVisible } from "../StatusMessages/IOAlertVisibleContext";
import {
  ButtonBlockProps,
  ButtonBlockWithTourGuideProps
} from "./utils/buttons";

export type IOScrollViewActions =
  | {
      primary: ButtonBlockWithTourGuideProps;
      secondary: ButtonBlockProps;
      tertiary: ButtonLinkProps;
      type: "ThreeButtons";
    }
  | {
      primary: ButtonBlockWithTourGuideProps;
      secondary: ButtonLinkProps;
      tertiary?: never;
      type: "TwoButtons";
    }
  | {
      primary: ButtonBlockWithTourGuideProps;
      secondary?: never;
      tertiary?: never;
      type: "SingleButton";
    };

export type IOScrollViewProps = WithTestID<
  PropsWithChildren<{
    actions?: WithTestID<IOScrollViewActions>;
    alwaysBounceVertical?: boolean;
    animatedRef?: AnimatedRef<Animated.ScrollView>;
    /* Center content in iOS without inertial scrolling */
    centerContent?: boolean;
    contentContainerStyle?: ViewStyle;
    debugMode?: boolean;
    /* Don't include end content margin */
    excludeEndContentMargin?: boolean;
    /* Don't include safe area insets */
    excludeSafeAreaMargins?: boolean;
    headerConfig?: ComponentProps<typeof HeaderSecondLevel>;
    /* Include page margins */
    includeContentMargins?: boolean;
    refreshControlProps?: RefreshControlProps;
    snapOffset?: number;
    topElement?: React.ReactNode;
  }>
>;

type ButtonLinkProps = Omit<IOButtonLinkSpecificProps, "color" | "variant">;

type IOSCrollViewHeaderScrollValues = ComponentProps<
  typeof HeaderSecondLevel
>["scrollValues"];

/* Percentage of scrolled content that triggers
   the gradient opaciy transition */
const gradientOpacityScrollTrigger = 0.85;
/* Extended gradient area above the actions */
const gradientSafeAreaHeight: IOSpacingScale = 96;
/* End content margin before the actions */
const contentEndMargin: IOSpacingScale = 32;
/* Margin between solid variant and outline variant */
const spaceBetweenActions: IOSpacer = 16;
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
  },
  centerContentWrapper: {
    flexGrow: 1,
    alignItems: "stretch",
    justifyContent: "center",
    alignContent: "center"
  }
});

/**
 * The main scrollable container component. It includes full support for custom
 * headers and actions.
 *
 * @param [headerConfig] Configuration for the header component. Use this only
 *   if you need to configure a custom header from scratch. If you need the
 *   predefined configuration with default `Back (<)` and `Help (?)` buttons,
 *   use `useHeaderSecondLevel`
 * @param {IOScrollViewActions} [actions] Actions to be rendered at the bottom
 *   of the `ScrollView`
 * @param [animatedRef] Ref generated through `useAnimatedRef` (used by
 *   `useScrollViewOffset` to get the scroll position)
 * @param {number} [snapOffset] Offset when you need to add a snap point
 * @param {boolean} [excludeSafeAreaMargins=false] Exclude safe area margins at
 *   the bottom of the `ScrollView` This is useful if you have a screen with a
 *   tab bar at the bottom, or if the bottom margin is already being managed.
 *   Default is `false`
 * @param {boolean} [excludeEndContentMargin=false] Exclude the end content
 *   margin. Default is `false`
 * @param {boolean} [includeContentMargins=true] Include horizontal screen
 *   margins. Default is `true`
 * @param {boolean} [debugMode=false] Enable debug mode. Only for testing
 *   purposes. Default is `false`
 */
export const IOScrollView = ({
  headerConfig,
  children,
  topElement,
  actions,
  snapOffset,
  excludeSafeAreaMargins = false,
  excludeEndContentMargin = false,
  includeContentMargins = true,
  debugMode = false,
  animatedRef,
  centerContent,
  refreshControlProps,
  contentContainerStyle,
  alwaysBounceVertical,
  testID
}: IOScrollViewProps) => {
  const { isAlertVisible } = useIOAlertVisible();
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

  const { bottomMargin, needSafeAreaMargin } = useFooterActionsMargin(
    excludeSafeAreaMargins
  );

  /* GENERATE EASING GRADIENT
     Background color should be app main background
     (both light and dark themes) */
  const APP_BG_COLOR: ColorValue = IOColors[theme["appBackground-primary"]];

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
      scrollPositionPercentage.value = Number.isNaN(scrollPercentage)
        ? 0
        : scrollPercentage;
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
    const scrollValues: IOSCrollViewHeaderScrollValues = {
      contentOffsetY: scrollPositionAbsolute,
      triggerOffset: snapOffset || 0
    };

    if (headerConfig) {
      navigation.setOptions({
        header: () => (
          <HeaderSecondLevel
            {...headerConfig}
            ignoreSafeAreaMargin={ignoreSafeAreaMargin}
            scrollValues={scrollValues}
          />
        ),
        headerTransparent: headerConfig.transparent
      });
    }
  }, [
    headerConfig,
    navigation,
    scrollPositionAbsolute,
    snapOffset,
    ignoreSafeAreaMargin
  ]);

  const RefreshControlComponent = refreshControlProps ? (
    <RefreshControl {...refreshControlProps} />
  ) : undefined;

  return (
    <Fragment>
      <Animated.ScrollView
        alwaysBounceVertical={alwaysBounceVertical}
        centerContent={centerContent}
        contentContainerStyle={[
          {
            paddingBottom: excludeEndContentMargin
              ? 0
              : actions
                ? safeBottomAreaHeight
                : bottomMargin + contentEndMargin,
            paddingHorizontal: includeContentMargins
              ? IOVisualCostants.appMarginDefault
              : 0,
            ...contentContainerStyle
          },
          /* Apply the same logic used in the
          `OperationResultScreenContent` component */
          centerContent ? styles.centerContentWrapper : {}
        ]}
        decelerationRate="normal"
        onScroll={handleScroll}
        ref={animatedRef}
        refreshControl={RefreshControlComponent}
        scrollEventThrottle={8}
        snapToEnd={false}
        snapToOffsets={
          // If there is a refresh control, don't snap to offsets
          // This is a react-native bug: https://github.com/facebook/react-native/issues/27324
          RefreshControlComponent ? undefined : [0, snapOffset || 0]
        }
        testID={testID}
      >
        {topElement}
        {children}
      </Animated.ScrollView>
      {actions && (
        <View
          pointerEvents="box-none"
          style={[
            styles.gradientBottomActions,
            {
              height: gradientAreaHeight,
              paddingBottom: bottomMargin
            }
          ]}
          {...(testID && { testID: `${testID}-actions` })}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.gradientContainer,
              debugMode && {
                backgroundColor: hexToRgba(IOColors["error-500"], 0.15)
              }
            ]}
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
                colors={colors}
                locations={locations}
                style={{
                  height: gradientAreaHeight - safeBackgroundBlockHeight
                }}
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
            onLayout={getActionBlockHeight}
            pointerEvents="box-none"
            style={styles.buttonContainer}
          >
            {renderActionButtons(actions, extraBottomMargin)}
          </View>
        </View>
      )}
    </Fragment>
  );
};

export const renderActionButtons = (
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
      {primaryAction &&
        (primaryAction.tourGuideProps ? (
          <GuidedTour {...primaryAction.tourGuideProps}>
            <IOButton fullWidth variant="solid" {...primaryAction} />
          </GuidedTour>
        ) : (
          <IOButton fullWidth variant="solid" {...primaryAction} />
        ))}

      {type === "TwoButtons" && (
        <View
          style={{
            alignSelf: "center",
            marginBottom: extraBottomMargin
          }}
        >
          <VSpacer size={spaceBetweenActionAndLink} />
          <IOButton color="primary" variant="link" {...secondaryAction} />
        </View>
      )}

      {type === "ThreeButtons" && (
        <Fragment>
          <VSpacer size={spaceBetweenActions} />
          <IOButton color="primary" variant="outline" {...secondaryAction} />

          <View
            style={{
              alignSelf: "center",
              marginBottom: extraBottomMargin
            }}
          >
            <VSpacer size={spaceBetweenActionAndLink} />
            <IOButton color="primary" variant="link" {...tertiaryAction} />
          </View>
        </Fragment>
      )}
    </>
  );
};
