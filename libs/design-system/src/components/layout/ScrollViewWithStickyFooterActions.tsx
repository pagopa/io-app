import { ComponentProps, ReactNode, useState } from "react";
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
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";

import { useIOTheme } from "../../context";
import {
  footerBoxShadow,
  IOColors,
  IOSpacing,
  IOSpacingScale
} from "../../core";
import { FooterActions, FooterActionsMeasurements } from "./FooterActions";

const defaultScrollEventThrottle = 8;
const placeholderTestID = "ScrollViewWithStickyFooterActionsPlaceholder";
const dockedActionsTestID = "ScrollViewWithStickyFooterActionsDockedActions";

export type ScrollViewWithStickyFooterActionsProps = {
  afterPlaceholder: ReactNode;
  beforePlaceholder: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;

  footerActionProps: Pick<
    ComponentProps<typeof FooterActions>,
    "actions" | "testID" | "transparent"
  >;

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

  const backgroundColor = transparent
    ? "transparent"
    : IOColors[theme["appBackground-primary"]];

  const {
    dockedActionsStyle,
    floatingActionsPointerEvents,
    floatingActionsStyles,
    handleFloatingActionsMeasure,
    handlePlaceholderLayout,
    handleScroll,
    handleScrollViewLayout
  } = useFooterActionsDocking();

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
          testID={placeholderTestID}
        >
          {actions && (
            <FooterActions
              actions={actions}
              animatedStyles={{ mainBlock: dockedActionsStyle }}
              excludeSafeAreaMargins
              fixed={false}
              testID={dockedActionsTestID}
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
          // since this view sits outside the ScrollView,
          // to ensure correct screenReader order a11y is handled by the docked clone
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents={floatingActionsPointerEvents}
          style={StyleSheet.absoluteFill}
        >
          <FooterActions
            actions={actions}
            animatedStyles={floatingActionsStyles}
            onMeasure={handleFloatingActionsMeasure}
            testID={testID}
            transparent={transparent}
          />
        </View>
      )}
    </View>
  );
};

const shadowTransitionDistance: IOSpacingScale = 24;
const invisibleButAccessibleOpacity = 0.01;

const useFooterActionsDocking = () => {
  const scrollY = useSharedValue(0);
  const scrollViewHeight = useSharedValue(0);
  const placeholderY = useSharedValue(0);
  const floatingActionsHeight = useSharedValue(0);
  const [floatingActionsPointerEvents, setFloatingActionsPointerEvents] =
    useState<"box-none" | "none">("box-none"); // the floating footer sits above the docked one, so its pointer events are disabled once docked

  const dockingScrollY = useDerivedValue(
    () =>
      placeholderY.get() + floatingActionsHeight.get() - scrollViewHeight.get()
  );
  // ------------------ handlers --------------------------

  const handleScroll = useAnimatedScrollHandler(({ contentOffset }) => {
    scrollY.set(contentOffset.y);
  });

  const handleScrollViewLayout = (event: LayoutChangeEvent) => {
    scrollViewHeight.set(event.nativeEvent.layout.height);
  };

  const handlePlaceholderLayout = (event: LayoutChangeEvent) => {
    placeholderY.set(event.nativeEvent.layout.y);
  };

  const handleFloatingActionsMeasure = ({
    safeBottomAreaHeight
  }: FooterActionsMeasurements) => {
    floatingActionsHeight.set(safeBottomAreaHeight);
  };

  // ---------- docking/floating logic --------------------

  const isDocked = useDerivedValue(() => {
    const isMeasured = floatingActionsHeight.get() > 0;
    return isMeasured && scrollY.get() > dockingScrollY.get();
  });

  const floatingActionsStyle = useAnimatedStyle(() => ({
    opacity: isDocked.get() ? 0 : 1
  }));

  const floatingShadowStyle = useAnimatedStyle(() => {
    const dockingPoint = dockingScrollY.get();
    const shadowColor = interpolateColor(
      scrollY.get(),
      [dockingPoint - shadowTransitionDistance, dockingPoint],
      [footerBoxShadow.color, "transparent"]
    );

    return { boxShadow: [{ ...footerBoxShadow, color: shadowColor }] };
  });

  const dockedActionsStyle = useAnimatedStyle(() => ({
    opacity: isDocked.get() ? 1 : invisibleButAccessibleOpacity
  }));

  useAnimatedReaction(
    () => isDocked.get(),
    (docked, wasDocked) => {
      if (docked !== wasDocked) {
        scheduleOnRN(
          setFloatingActionsPointerEvents,
          docked ? "none" : "box-none"
        );
      }
    }
  );

  return {
    dockedActionsStyle,
    floatingActionsPointerEvents,
    floatingActionsStyles: {
      background: floatingShadowStyle,
      mainBlock: floatingActionsStyle
    },
    handleFloatingActionsMeasure,
    handlePlaceholderLayout,
    handleScroll,
    handleScrollViewLayout
  };
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1
  }
});
