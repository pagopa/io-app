import { ComponentProps, ReactNode } from "react";
import {
  LayoutChangeEvent,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useIOTheme } from "../../context";
import {
  footerBoxShadow,
  IOColors,
  IOSpacing,
  IOSpacingScale
} from "../../core";
import { FooterActions, FooterActionsMeasurements } from "./FooterActions";

const shadowTransitionDistance: IOSpacingScale = 24;
const defaultScrollEventThrottle = 8;
/* Keeps the docked copy of the actions invisible while the sticky footer
   covers it, without making it fully transparent: iOS may skip fully
   transparent views when building the accessibility tree. */
const hiddenDockedActionsOpacity = 0.01;

export type ScrollViewWithStickyFooterActionsProps = {
  /** Content rendered after the point where the footer stops being fixed. */
  afterPlaceholder: ReactNode;
  /** Content rendered before the point where the footer stops being fixed. */
  beforePlaceholder: ReactNode;
  /** Style applied to the component container. */
  containerStyle?: StyleProp<ViewStyle>;

  footerActionProps: Pick<
    ComponentProps<typeof FooterActions>,
    "actions" | "testID" | "transparent"
  >;

  /**
   * Props applied to the internal vertical scroll view. `horizontal`,
   * `onLayout` and `onScroll` are managed internally to keep the footer aligned
   * with its placeholder.
   */
  scrollViewProps?: Omit<
    ScrollViewProps,
    "children" | "horizontal" | "onLayout" | "onScroll"
  >;
};

/**
 * Displays footer actions fixed at the bottom of a scroll view until their
 * placeholder is reached. Content placement around the placeholder is
 * controlled through `beforePlaceholder` and `afterPlaceholder`.
 */
export const ScrollViewWithStickyFooterActions = ({
  afterPlaceholder,
  beforePlaceholder,
  containerStyle,
  footerActionProps,
  scrollViewProps
}: ScrollViewWithStickyFooterActionsProps) => {
  const theme = useIOTheme();
  const { bottom: safeAreaBottom } = useSafeAreaInsets();
  const { actions, testID, transparent } = footerActionProps;
  const scrollY = useSharedValue(0);
  const scrollViewHeight = useSharedValue(0);
  const placeholderY = useSharedValue(0);
  const stickyFooterHeight = useSharedValue(0);

  const backgroundColor = transparent
    ? "transparent"
    : IOColors[theme["appBackground-primary"]];

  const handleScroll = useAnimatedScrollHandler(({ contentOffset }) => {
    scrollY.set(contentOffset.y);
  });

  const handleScrollViewLayout = (event: LayoutChangeEvent) => {
    scrollViewHeight.set(event.nativeEvent.layout.height);
  };

  const handlePlaceholderLayout = (event: LayoutChangeEvent) => {
    placeholderY.set(event.nativeEvent.layout.y);
  };

  const handleStickyFooterMeasure = ({
    safeBottomAreaHeight
  }: FooterActionsMeasurements) => {
    stickyFooterHeight.set(safeBottomAreaHeight);
  };

  /* Scroll position at which the sticky footer reaches its placeholder, or
     `undefined` until the sticky footer is measured. */
  const dockingScrollY = useDerivedValue(() => {
    const footerHeight = stickyFooterHeight.get();
    return footerHeight > 0
      ? placeholderY.get() - scrollViewHeight.get() + footerHeight
      : undefined;
  });

  /* Once the sticky footer reaches its placeholder it's replaced by the docked
     copy, which scrolls with the content and leaves only a regular margin
     below the actions instead of the bottom safe area. The sticky footer is
     also moved off screen so it can't intercept touches. */
  const isDocked = useDerivedValue(() => {
    const threshold = dockingScrollY.get();
    return threshold !== undefined && threshold < scrollY.get();
  });

  const stickyActionsAnimatedStyle = useAnimatedStyle(() => {
    const docked = isDocked.get();
    return {
      opacity: docked ? 0 : 1,
      transform: [{ translateY: docked ? stickyFooterHeight.get() : 0 }]
    };
  });

  const dockedActionsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: isDocked.get() ? 1 : hiddenDockedActionsOpacity
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const threshold = dockingScrollY.get();
    const shadowColor =
      threshold === undefined
        ? footerBoxShadow.color
        : interpolateColor(
            scrollY.get(),
            [threshold - shadowTransitionDistance, threshold],
            [footerBoxShadow.color, "transparent"]
          );

    return {
      backgroundColor: isDocked.get() ? "transparent" : backgroundColor,
      boxShadow: [{ ...footerBoxShadow, color: shadowColor }]
    };
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.ScrollView
        {...scrollViewProps}
        onLayout={handleScrollViewLayout}
        onScroll={handleScroll}
        scrollEventThrottle={
          scrollViewProps?.scrollEventThrottle ?? defaultScrollEventThrottle
        }
      >
        {beforePlaceholder}
        <View
          onLayout={handlePlaceholderLayout}
          style={[
            { backgroundColor },
            !actions && { height: IOSpacing.screenEndMargin }
          ]}
          testID="ScrollViewWithStickyFooterActionsPlaceholder"
        >
          {/* Screen readers follow the view hierarchy, so they would reach the
              sticky footer, rendered outside the scroll view, only after the
              whole scrollable content. The docked copy exposes the actions in
              their reading order, so the sticky footer is hidden from them. */}
          {actions && (
            <FooterActions
              actions={actions}
              animatedStyles={{ mainBlock: dockedActionsAnimatedStyle }}
              excludeSafeAreaMargins
              fixed={false}
              testID="ScrollViewWithStickyFooterActionsDockedActions"
              transparent
            />
          )}
        </View>
        {afterPlaceholder}
        <View
          style={{ height: IOSpacing.screenEndMargin + safeAreaBottom }}
          testID="ScrollViewWithStickyFooterActionsEndSpacer"
        />
      </Animated.ScrollView>
      {actions && (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents="box-none"
          style={StyleSheet.absoluteFill}
        >
          <FooterActions
            actions={actions}
            animatedStyles={{
              background: backgroundAnimatedStyle,
              mainBlock: stickyActionsAnimatedStyle
            }}
            onMeasure={handleStickyFooterMeasure}
            testID={testID}
            transparent={transparent}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1
  }
});
