import {
  ComponentProps,
  ReactNode,
  useEffect,
  useEffectEvent,
  useState
} from "react";
import {
  LayoutChangeEvent,
  LayoutRectangle,
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

export type ScrollViewWithStickyFooterActionsProps = {
  /** Content rendered after the point where the footer stops being fixed. */
  afterPlaceholder: ReactNode;
  /** Content rendered before the point where the footer stops being fixed. */
  beforePlaceholder: ReactNode;
  /** Style applied to the component container. */
  containerStyle?: StyleProp<ViewStyle>;

  footerActionProps: Omit<
    ComponentProps<typeof FooterActions>,
    "animatedStyles" | "children" | "fixed"
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
  const scrollY = useSharedValue(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const [placeholderY, setPlaceholderY] = useState<LayoutRectangle["y"]>(0);
  const { actions, onMeasure, transparent } = footerActionProps;
  const placeholderHeight = actions ? footerHeight : IOSpacing.screenEndMargin;

  const placeholderTopEdge =
    placeholderY - scrollViewHeight + placeholderHeight;
  const backgroundColor = transparent
    ? "transparent"
    : IOColors[theme["appBackground-primary"]];

  const handleScroll = useAnimatedScrollHandler(({ contentOffset }) => {
    scrollY.set(contentOffset.y);
  });

  const handleScrollViewLayout = (event: LayoutChangeEvent) => {
    setScrollViewHeight(event.nativeEvent.layout.height);
  };

  const handlePlaceholderLayout = (event: LayoutChangeEvent) => {
    setPlaceholderY(event.nativeEvent.layout.y);
  };

  const handleFooterActionsMeasure = (
    measurements: FooterActionsMeasurements
  ) => {
    setFooterHeight(measurements.safeBottomAreaHeight);
    onMeasure?.(measurements);
  };

  const notifyActionsAbsent = useEffectEvent(() => {
    onMeasure?.({
      actionBlockHeight: 0,
      safeBottomAreaHeight: IOSpacing.screenEndMargin
    });
  });

  useEffect(() => {
    if (!actions) {
      notifyActionsAbsent();
    }
  }, [actions]);

  const actionBlockAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: Math.min(0, placeholderTopEdge - scrollY.get())
      }
    ]
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const scrollPosition = scrollY.get();
    const isAttachedToPlaceholder = placeholderTopEdge < scrollPosition;
    const shadowColor = interpolateColor(
      scrollPosition,
      [placeholderTopEdge - shadowTransitionDistance, placeholderTopEdge],
      [footerBoxShadow.color, "transparent"]
    );

    return {
      backgroundColor: isAttachedToPlaceholder
        ? "transparent"
        : backgroundColor,
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
          style={{ height: placeholderHeight, backgroundColor }}
          testID="ScrollViewWithStickyFooterActionsPlaceholder"
        />
        {afterPlaceholder}
        <View
          style={{ height: IOSpacing.screenEndMargin + safeAreaBottom }}
          testID="ScrollViewWithStickyFooterActionsEndSpacer"
        />
      </Animated.ScrollView>
      {actions && (
        <FooterActions
          {...footerActionProps}
          animatedStyles={{
            background: backgroundAnimatedStyle,
            mainBlock: actionBlockAnimatedStyle
          }}
          onMeasure={handleFooterActionsMeasure}
          transparent={transparent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1
  }
});
