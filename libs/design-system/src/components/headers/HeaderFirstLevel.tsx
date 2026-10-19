import { createRef, useEffect, useLayoutEffect } from "react";
import {
  AccessibilityInfo,
  findNodeHandle,
  StyleSheet,
  View
} from "react-native";
import Animated, {
  AnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useIOTheme } from "../../context";
import {
  alertEdgeToEdgeInsetTransitionConfig,
  IOColorsLegacy,
  IODimensions
} from "../../core";
import { WithTestID } from "../../utils/types";
import { IconButton } from "../buttons";
import { HStack } from "../layout";
import { H2 } from "../typography";
import { HeaderActionProps } from "./common";

export type HeaderFirstLevel = WithTestID<{
  actions: HeaderActionsProp;
  animatedFlatListRef?: AnimatedRef<Animated.FlatList<any>>;
  animatedRef?: AnimatedRef<Animated.ScrollView>;
  ignoreSafeAreaMargin?: boolean;
  title: string;
  variant?: Variant;
}>;

type HeaderActionsProp =
  | readonly [] // No actions
  | readonly [HeaderActionProps, HeaderActionProps, HeaderActionProps] // Three actions
  | readonly [HeaderActionProps, HeaderActionProps] // Two actions
  | readonly [HeaderActionProps]; // Single action

type Variant = "contrast" | "primary";

const styles = StyleSheet.create({
  headerInner: {
    paddingHorizontal: IODimensions.padding.screen.default,
    height: IODimensions.height.header,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  headerDivider: {
    position: "absolute",
    width: "100%",
    height: StyleSheet.hairlineWidth,
    left: 0,
    right: 0,
    bottom: 0
  }
});

export const HeaderFirstLevel = ({
  title,
  testID,
  actions = [],
  ignoreSafeAreaMargin = false,
  animatedRef,
  variant = "primary",
  animatedFlatListRef
}: HeaderFirstLevel) => {
  const titleRef = createRef<View>();
  const insets = useSafeAreaInsets();
  const theme = useIOTheme();
  const paddingTop = useSharedValue(ignoreSafeAreaMargin ? 0 : insets.top);
  const isPrimary = variant === "primary";

  useLayoutEffect(() => {
    const reactNode = findNodeHandle(titleRef.current);
    if (reactNode !== null) {
      AccessibilityInfo.setAccessibilityFocus(reactNode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* We show the divider only when the header is scrolled down */
  const offset = useScrollOffset(
    (animatedRef ?? animatedFlatListRef) as AnimatedRef<Animated.ScrollView>
  );

  useEffect(() => {
    paddingTop.value = withTiming(
      ignoreSafeAreaMargin ? 0 : insets.top,
      alertEdgeToEdgeInsetTransitionConfig
    );
  }, [ignoreSafeAreaMargin, insets.top, paddingTop]);

  const animatedStyle = useAnimatedStyle(() => ({
    paddingTop: paddingTop.value
  }));

  const animatedDivider = useAnimatedStyle(() => ({
    opacity: withTiming(offset.value > 0 ? 1 : 0, { duration: 200 })
  }));

  return (
    <Animated.View
      accessibilityRole="header"
      style={[
        {
          backgroundColor: isPrimary
            ? IOColorsLegacy[theme["appBackground-primary"]]
            : IOColorsLegacy[theme["appBackground-accent"]]
        },
        animatedStyle
      ]}
      testID={testID}
    >
      {/* Divider */}
      {(animatedRef || animatedFlatListRef) && isPrimary && (
        <Animated.View
          style={[
            {
              ...styles.headerDivider,
              backgroundColor: IOColorsLegacy[theme["divider-default"]]
            },
            animatedDivider
          ]}
        />
      )}

      <View style={styles.headerInner}>
        <View accessibilityRole="header" accessible ref={titleRef}>
          <H2
            color={
              isPrimary
                ? theme["textHeading-default"]
                : theme["textHeading-constrast"]
            }
            maxFontSizeMultiplier={1.25}
            numberOfLines={1}
            style={{ flexShrink: 1 }}
            weight="Bold"
          >
            {title}
          </H2>
        </View>
        <HStack
          space={IODimensions.gap.header.actions}
          style={{ flexShrink: 0 }}
        >
          {actions.map(action => (
            <IconButton
              key={`header-first-level-action-${action.icon}`}
              {...action}
              color={variant}
            />
          ))}
        </HStack>
      </View>
    </Animated.View>
  );
};
