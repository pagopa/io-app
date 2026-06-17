import {
  createRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState
} from "react";
import {
  AccessibilityInfo,
  ColorValue,
  Platform,
  StyleSheet,
  View,
  findNodeHandle
} from "react-native";
import Animated, {
  AnimatedRef,
  SharedValue,
  interpolate,
  interpolateColor,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useScrollOffset,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";
import { useIOTheme } from "../../context";
import {
  IOColors,
  IOSpringValues,
  IOThemeDark,
  IOThemeLight,
  IOVisualCostants,
  alertEdgeToEdgeInsetTransitionConfig,
  hexToRgba,
  iconBtnSizeSmall
} from "../../core";
import type { IOSpacer, IOSpacingScale } from "../../core/IOSpacing";
import { WithTestID } from "../../utils/types";
import { IconButton } from "../buttons/IconButton";
import { HSpacer, HStack } from "../layout";
import { IOText } from "../typography";
import { HeaderActionProps } from "./common";

type ScrollValues = {
  contentOffsetY: SharedValue<number>;
  triggerOffset: number;
};

type DiscreteTransitionProps =
  | {
      enableDiscreteTransition: true;
      animatedRef:
        | AnimatedRef<Animated.ScrollView>
        | AnimatedRef<Animated.FlatList<any>>;
    }
  | {
      enableDiscreteTransition?: false;
      animatedRef?: never;
    };

type BackProps =
  | {
      goBack: () => void;
      backAccessibilityLabel: string;
      backTestID?: string;
    }
  | {
      goBack?: never;
      backAccessibilityLabel?: never;
      backTestID?: never;
    };

type CommonProps = WithTestID<{
  scrollValues?: ScrollValues;
  title: string;
  // Visual attributes
  transparent?: boolean;
  variant?: "neutral" | "contrast" | "primary";
  backgroundColor?: string;
  ignoreSafeAreaMargin?: boolean;
  // Prevents screen readers from focusing on the title when other elements are focused
  // (e.g. when an input text is throwing an error)
  ignoreAccessibilityCheck?: boolean;
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

export type HeaderSecondLevel = BackProps &
  DiscreteTransitionProps &
  (Base | OneAction | TwoActions | ThreeActions);

const titleHorizontalMargin: IOSpacingScale = 16;

const styles = StyleSheet.create({
  headerInner: {
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    height: IOVisualCostants.headerHeight,
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  titleContainer: {
    flexGrow: 1,
    flexShrink: 1,
    marginHorizontal: titleHorizontalMargin
  }
});

/**
 * HeaderSecondLevel component is used to display the header on pages on the second level of navigation.
 * @param {HeaderSecondLevel} props - The props of the component
 * @returns React Element
 */
export const HeaderSecondLevel = ({
  scrollValues = undefined,
  goBack,
  backAccessibilityLabel,
  backTestID,
  title,
  type,
  variant,
  backgroundColor,
  transparent = false,
  ignoreSafeAreaMargin = false,
  enableDiscreteTransition = false,
  animatedRef,
  testID,
  firstAction,
  secondAction,
  thirdAction,
  ignoreAccessibilityCheck = false
}: HeaderSecondLevel) => {
  const scrollOffset = useScrollOffset(
    (animatedRef as AnimatedRef<Animated.ScrollView>) ||
      (animatedRef as AnimatedRef<Animated.FlatList<any>>)
  );

  const titleRef = createRef<View>();

  const theme = useIOTheme();
  const insets = useSafeAreaInsets();
  const isTitleAccessible = useMemo(() => !!title.trim(), [title]);
  const paddingTop = useSharedValue(ignoreSafeAreaMargin ? 0 : insets.top);

  const AnimatedIOText = Animated.createAnimatedComponent(IOText);

  // If the variant is not set, set a fallback color
  const defaultIconColor = variant ?? "neutral";

  /* We apply the same logic of `persistentColorMode`
  to the title color: if variant is set, the color will
  be persistent, otherwise it will vary depending
  on the color scheme. */
  const titleColorVariant =
    variant === "contrast"
      ? IOColors[IOThemeDark["textHeading-default"]]
      : IOColors[IOThemeLight["textHeading-default"]];

  const titleColor: ColorValue = variant
    ? titleColorVariant
    : IOColors[theme["textHeading-default"]];

  /* Visual attributes when there are transitions between states */
  const HEADER_DEFAULT_BG_COLOR: IOColors = theme["appBackground-primary"];

  const headerBgColorSolidState =
    backgroundColor ?? IOColors[HEADER_DEFAULT_BG_COLOR];

  const headerBgColorTransparentState = transparent
    ? hexToRgba(headerBgColorSolidState, 0)
    : headerBgColorSolidState;

  const borderColorDefault = IOColors[theme["divider-default"]];
  const borderColorSolidState = backgroundColor ?? borderColorDefault;
  const borderColorTransparentState = hexToRgba(borderColorSolidState, 0);

  useLayoutEffect(() => {
    if (isTitleAccessible) {
      const reactNode = findNodeHandle(titleRef.current);
      if (reactNode !== null) {
        AccessibilityInfo.setAccessibilityFocus(reactNode);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bgColorDiscreteTransition = useDerivedValue(() =>
    withSpring(scrollOffset.value > 0 ? 1 : 0, IOSpringValues.header)
  );

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    paddingTop.value = withTiming(
      ignoreSafeAreaMargin ? 0 : insets.top,
      alertEdgeToEdgeInsetTransitionConfig
    );
  }, [ignoreSafeAreaMargin, insets.top, paddingTop]);

  const animatedPaddingStyle = useAnimatedStyle(() => ({
    marginTop: paddingTop.value
  }));

  const headerWrapperAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: enableDiscreteTransition
      ? interpolateColor(
          bgColorDiscreteTransition.value,
          [0, 1],
          [headerBgColorTransparentState, headerBgColorSolidState]
        )
      : scrollValues
      ? interpolateColor(
          scrollValues.contentOffsetY.value,
          [0, scrollValues.triggerOffset],
          [headerBgColorTransparentState, headerBgColorSolidState]
        )
      : headerBgColorSolidState,
    borderColor: enableDiscreteTransition
      ? interpolateColor(
          bgColorDiscreteTransition.value,
          [0, 1],
          [borderColorTransparentState, borderColorSolidState]
        )
      : scrollValues
      ? interpolateColor(
          scrollValues.contentOffsetY.value,
          [0, scrollValues.triggerOffset],
          [borderColorTransparentState, borderColorSolidState]
        )
      : "transparent"
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: enableDiscreteTransition
      ? interpolate(bgColorDiscreteTransition.value, [0, 1], [0, 1])
      : scrollValues
      ? interpolate(
          scrollValues.contentOffsetY.value,
          [0, scrollValues.triggerOffset],
          [0, 1]
        )
      : 1
  }));

  const [importantForAccessibility, setImportantForAccessibility] = useState<
    "yes" | "no-hide-descendants"
  >("yes");

  // Updates accessibility state based on scroll position.
  useAnimatedReaction(
    () =>
      enableDiscreteTransition
        ? scrollOffset.value
        : scrollValues?.contentOffsetY.value,
    (currentOffset, previousOffset) => {
      if (currentOffset !== previousOffset) {
        const offsetToCompare = enableDiscreteTransition
          ? 0
          : scrollValues?.triggerOffset ?? 0;
        // Sets accessibility to "yes" when scrolled past the threshold, else hides it from screen readers.
        const newValue =
          (currentOffset ?? 0) > offsetToCompare && !ignoreAccessibilityCheck
            ? "yes"
            : "no-hide-descendants";
        scheduleOnRN(setImportantForAccessibility, newValue);
      }
    },
    [scrollValues, enableDiscreteTransition]
  );

  return (
    <Animated.View
      accessibilityRole="header"
      style={[
        { borderBottomWidth: 1, borderColor: borderColorTransparentState },
        ignoreSafeAreaMargin ? { borderColor: borderColorSolidState } : {},
        headerWrapperAnimatedStyle
      ]}
    >
      <Animated.View
        testID={testID}
        style={[animatedPaddingStyle, styles.headerInner]}
      >
        {goBack ? (
          <IconButton
            icon={Platform.select({
              android: "backAndroid",
              default: "backiOS"
            })}
            color={defaultIconColor}
            /* If we specify a variant, we probably want to
              make it persistent in both light and dark modes. */
            persistentColorMode={!!variant}
            onPress={goBack}
            accessibilityLabel={backAccessibilityLabel}
            testID={backTestID}
          />
        ) : (
          <HSpacer size={32} />
        )}
        <View
          ref={titleRef}
          accessibilityElementsHidden={!isTitleAccessible}
          importantForAccessibility={importantForAccessibility}
          accessible={isTitleAccessible}
          accessibilityLabel={title}
          accessibilityRole="header"
          style={styles.titleContainer}
        >
          <AnimatedIOText
            size={14}
            numberOfLines={1}
            accessible={false}
            weight={"Semibold"}
            style={[
              { color: titleColor, textAlign: "center" },
              titleAnimatedStyle
            ]}
          >
            {title}
          </AnimatedIOText>
        </View>
        <HStack allowScaleSpacing space={16} style={{ flexShrink: 0 }}>
          {type === "threeActions" && (
            <IconButton
              {...thirdAction}
              color={defaultIconColor}
              persistentColorMode={!!variant}
            />
          )}
          {(type === "twoActions" || type === "threeActions") && (
            <IconButton
              {...secondAction}
              color={defaultIconColor}
              persistentColorMode={!!variant}
            />
          )}
          {type !== "base" ? (
            <IconButton
              {...firstAction}
              color={defaultIconColor}
              persistentColorMode={!!variant}
            />
          ) : (
            <HSpacer size={iconBtnSizeSmall as IOSpacer} />
          )}
        </HStack>
      </Animated.View>
    </Animated.View>
  );
};
