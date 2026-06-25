import {
  alertEdgeToEdgeInsetTransitionConfig,
  H2,
  HeaderActionProps,
  HStack,
  IconButton,
  IOColors,
  IOVisualCostants,
  useIOTheme,
  WithTestID
} from "@pagopa/io-app-design-system";
import { useEffect, useLayoutEffect, useRef } from "react";
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
import {
  GuidedTour,
  GuidedTourProps
} from "../../features/tour/components/GuidedTour";

export type HeaderFirstLevelAction = HeaderActionProps & {
  tourGuideProps?: GuidedTourProps;
};

export type HeaderFirstLevelActions =
  | readonly []
  | readonly [HeaderFirstLevelAction]
  | readonly [HeaderFirstLevelAction, HeaderFirstLevelAction]
  | readonly [
      HeaderFirstLevelAction,
      HeaderFirstLevelAction,
      HeaderFirstLevelAction
    ];

type Variant = "primary" | "contrast";

export type IOHeaderFirstLevelProps = WithTestID<{
  title: string;
  actions: HeaderFirstLevelActions;
  animatedRef?: AnimatedRef<Animated.ScrollView>;
  animatedFlatListRef?: AnimatedRef<Animated.FlatList<any>>;
  ignoreSafeAreaMargin?: boolean;
  variant?: Variant;
}>;

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

const renderAction = (action: HeaderFirstLevelAction, variant: Variant) => {
  const { tourGuideProps, ...iconButtonProps } = action;
  const actionKey = `header-first-level-action-${action.icon}`;
  const button = (
    <IconButton key={actionKey} {...iconButtonProps} color={variant} />
  );

  return tourGuideProps ? (
    <GuidedTour key={actionKey} {...tourGuideProps}>
      {button}
    </GuidedTour>
  ) : (
    button
  );
};

export const hasHeaderFirstLevelTourActions = (
  actions: HeaderFirstLevelActions
): boolean => actions.some(action => action.tourGuideProps !== undefined);

export const IOHeaderFirstLevel = ({
  title,
  testID,
  actions = [],
  ignoreSafeAreaMargin = false,
  animatedRef,
  variant = "primary",
  animatedFlatListRef
}: IOHeaderFirstLevelProps) => {
  const titleRef = useRef<View>(null);
  const insets = useSafeAreaInsets();
  const theme = useIOTheme();
  const paddingTop = useSharedValue(ignoreSafeAreaMargin ? 0 : insets.top);
  const isPrimary = variant === "primary";

  useLayoutEffect(() => {
    const reactNode = findNodeHandle(titleRef.current);
    if (reactNode !== null) {
      AccessibilityInfo.setAccessibilityFocus(reactNode);
    }
  }, []);

  const offset = useScrollOffset(
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
          backgroundColor: isPrimary
            ? IOColors[theme["appBackground-primary"]]
            : IOColors[theme["appBackground-accent"]]
        },
        animatedStyle
      ]}
      accessibilityRole="header"
      testID={testID}
    >
      {(animatedRef || animatedFlatListRef) && isPrimary && (
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
          <H2
            weight="Bold"
            style={{ flexShrink: 1 }}
            numberOfLines={1}
            color={
              isPrimary
                ? theme["textHeading-default"]
                : theme["textHeading-constrast"]
            }
            maxFontSizeMultiplier={1.25}
          >
            {title}
          </H2>
        </View>
        <HStack space={16} style={{ flexShrink: 0 }}>
          {actions.map(action => renderAction(action, variant))}
        </HStack>
      </View>
    </Animated.View>
  );
};
