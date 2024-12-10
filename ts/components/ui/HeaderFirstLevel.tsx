import {
  H3,
  HStack,
  HeaderActionProps,
  IOColors,
  IOVisualCostants,
  IconButton,
  WithTestID,
  alertEdgeToEdgeInsetTransitionConfig,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { createRef, useEffect, useLayoutEffect } from "react";
import {
  AccessibilityInfo,
  StyleSheet,
  View,
  findNodeHandle
} from "react-native";
import Animated, {
  AnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CommonProps = WithTestID<{
  title: string;
  // This Prop will be removed once all the screens on the first level routing will be refactored
  backgroundColor?: "light" | "dark";
  ignoreSafeAreaMargin?: boolean;
  animatedRef?: AnimatedRef<Animated.ScrollView>;
  animatedFlatListRef?: AnimatedRef<Animated.FlatList<any>>;
}>;

interface Base extends CommonProps {
  type: "base";
  firstAction?: never;
  secondAction?: never;
  thirdAction?: never;
}

interface OneAction extends CommonProps {
  type: "singleAction";
  firstAction: HeaderActionProps;
  secondAction?: never;
  thirdAction?: never;
}

interface TwoActions extends CommonProps {
  type: "twoActions";
  firstAction: HeaderActionProps;
  secondAction: HeaderActionProps;
  thirdAction?: never;
}

interface ThreeActions extends CommonProps {
  type: "threeActions";
  firstAction: HeaderActionProps;
  secondAction: HeaderActionProps;
  thirdAction: HeaderActionProps;
}

export type HeaderFirstLevel = Base | OneAction | TwoActions | ThreeActions;

const HEADER_BG_COLOR_DARK: IOColors = "bluegrey";

const styles = StyleSheet.create({
  headerInner: {
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    height: IOVisualCostants.headerHeight,
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
  type,
  testID,
  backgroundColor = "light",
  firstAction,
  secondAction,
  thirdAction,
  ignoreSafeAreaMargin = false,
  animatedRef,
  animatedFlatListRef
}: HeaderFirstLevel) => {
  const titleRef = createRef<View>();
  const insets = useSafeAreaInsets();
  const theme = useIOTheme();
  const paddingTop = useSharedValue(ignoreSafeAreaMargin ? 0 : insets.top);

  useLayoutEffect(() => {
    const reactNode = findNodeHandle(titleRef.current);
    if (reactNode !== null) {
      AccessibilityInfo.setAccessibilityFocus(reactNode);
    }
  });

  /* We show the divider only when the header is scrolled down */
  const offset = useScrollViewOffset(
    (animatedRef as AnimatedRef<Animated.ScrollView>) ||
      (animatedFlatListRef as AnimatedRef<Animated.FlatList<any>>)
  );

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
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
      style={[
        {
          backgroundColor:
            backgroundColor === "light"
              ? IOColors[theme["appBackground-primary"]]
              : IOColors[HEADER_BG_COLOR_DARK]
        },
        animatedStyle
      ]}
      accessibilityRole="header"
      testID={testID}
    >
      {/* Divider */}
      {(animatedRef || animatedFlatListRef) && (
        <Animated.View
          style={[
            {
              ...styles.headerDivider,
              backgroundColor: IOColors[theme["divider-default"]]
            },
            animatedDivider
          ]}
        />
      )}

      <View style={styles.headerInner}>
        <View ref={titleRef} accessible accessibilityRole="header">
          <H3
            weight="Bold"
            style={{ flexShrink: 1 }}
            numberOfLines={1}
            color={
              backgroundColor === "dark" ? "white" : theme["textBody-default"]
            }
          >
            {title}
          </H3>
        </View>
        <HStack space={16} style={{ flexShrink: 0 }}>
          {type === "threeActions" && (
            <IconButton
              {...thirdAction}
              color={backgroundColor === "dark" ? "contrast" : "primary"}
            />
          )}
          {(type === "twoActions" || type === "threeActions") && (
            <IconButton
              {...secondAction}
              color={backgroundColor === "dark" ? "contrast" : "primary"}
            />
          )}
          {type !== "base" && (
            <IconButton
              {...firstAction}
              color={backgroundColor === "dark" ? "contrast" : "primary"}
            />
          )}
        </HStack>
      </View>
    </Animated.View>
  );
};

export default HeaderFirstLevel;
