import {
  ActionProp,
  H3,
  HSpacer,
  IOColors,
  IOStyles,
  IOVisualCostants,
  IconButton,
  VSpacer,
  WithTestID,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as React from "react";
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
  withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { HeaderActionProps } from "../../hooks/useHeaderProps";

type CommonProps = WithTestID<{
  title: string;
  // This Prop will be removed once all the screens on the first level routing will be refactored
  backgroundColor?: "light" | "dark";
  animatedRef?: AnimatedRef<Animated.ScrollView>;
  animatedFlatListRef?: AnimatedRef<Animated.FlatList<any>>;
  endBlock?: React.ReactNode;
}>;

interface Base extends CommonProps {
  type: "base";
  firstAction?: never;
  secondAction?: never;
  thirdAction?: never;
}

interface OneAction extends CommonProps {
  type: "singleAction";
  firstAction: ActionProp;
  secondAction?: never;
  thirdAction?: never;
}

interface TwoActions extends CommonProps {
  type: "twoActions";
  firstAction: ActionProp;
  secondAction: ActionProp;
  thirdAction?: never;
}

interface ThreeActions extends CommonProps {
  type: "threeActions";
  firstAction: ActionProp;
  secondAction: ActionProp;
  thirdAction: ActionProp;
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
  endBlock,
  animatedRef,
  animatedFlatListRef
}: HeaderFirstLevel) => {
  const titleRef = React.createRef<View>();
  const insets = useSafeAreaInsets();
  const theme = useIOTheme();

  React.useLayoutEffect(() => {
    const reactNode = findNodeHandle(titleRef.current);
    if (reactNode !== null) {
      AccessibilityInfo.setAccessibilityFocus(reactNode);
    }
  });

  /* We show the divider only when the header is scrolled down */
  const offset = useScrollViewOffset(
    (animatedRef ||
      animatedFlatListRef) as AnimatedRef<Animated.ScrollView> | null
  );

  const animatedBottomBorder = useAnimatedStyle(() => ({
    opacity: withTiming(offset.value > 0 ? 1 : 0, { duration: 200 })
  }));

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor:
          backgroundColor === "light"
            ? IOColors[theme["appBackground-primary"]]
            : IOColors[HEADER_BG_COLOR_DARK]
      }}
      accessibilityRole="header"
      testID={testID}
    >
      {/* Divider */}
      <Animated.View
        style={[
          {
            ...styles.headerDivider,
            backgroundColor: IOColors[theme["divider-default"]]
          },
          animatedBottomBorder
        ]}
      />

      <View style={styles.headerInner}>
        <View ref={titleRef} accessible accessibilityRole="header">
          <H3
            style={{ flexShrink: 1 }}
            numberOfLines={1}
            color={
              backgroundColor === "dark" ? "white" : theme["textBody-default"]
            }
          >
            {title}
          </H3>
        </View>
        <View style={[IOStyles.row, { flexShrink: 0 }]}>
          {type === "threeActions" && (
            <>
              <IconButton
                {...thirdAction}
                color={backgroundColor === "dark" ? "contrast" : "primary"}
              />
              {/* Ideally, with the "gap" flex property,
              we can get rid of these ugly constructs */}
              <HSpacer size={16} />
            </>
          )}
          {(type === "twoActions" || type === "threeActions") && (
            <>
              <IconButton
                {...secondAction}
                color={backgroundColor === "dark" ? "contrast" : "primary"}
              />
              {/* Same as above */}
              <HSpacer size={16} />
            </>
          )}
          {type !== "base" && (
            <IconButton
              {...firstAction}
              color={backgroundColor === "dark" ? "contrast" : "primary"}
            />
          )}
        </View>
      </View>
      {endBlock && (
        <View style={{ paddingHorizontal: IOVisualCostants.appMarginDefault }}>
          {endBlock}
          <VSpacer size={12} />
        </View>
      )}
    </View>
  );
};

export default HeaderFirstLevel;
