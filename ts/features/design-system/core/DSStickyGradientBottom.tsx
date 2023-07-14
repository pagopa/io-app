import * as React from "react";
import { useMemo } from "react";
import { Alert, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets
} from "react-native-safe-area-context";
import Animated, {
  Easing,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { IOColors } from "../../../components/core/variables/IOColors";
import { H2 } from "../../../components/core/typography/H2";
import { Body } from "../../../components/core/typography/Body";
import StickyGradientBottomActions from "../../../components/ui/StickyGradientBottomActions";
import ButtonOutline from "../../../components/ui/ButtonOutline";
import {
  IOVisualCostants,
  buttonSolidHeight
} from "../../../components/core/variables/IOStyles";
import { IOSpacingScale } from "../../../components/core/variables/IOSpacing";

// Extended gradient area above the actions
export const GRADIENT_SAFE_AREA: IOSpacingScale = 80;
// End content margin before the actions
const contentEndMargin: IOSpacingScale = 32;

export const DSStickyGradientBottom = () => {
  const enableTransition = useSharedValue(1);
  const insets = useSafeAreaInsets();

  // Check if iPhone bottom handle is present. If not, add a
  // default margin to avoid Button attached to the
  // bottom without margin
  const bottomMargin: number = useMemo(
    () =>
      insets.bottom === 0 ? IOVisualCostants.appMarginDefault : insets.bottom,
    [insets]
  );

  /* Total height of "Actions + Gradient" area */
  const gradientAreaHeight: number = useMemo(
    () => bottomMargin + buttonSolidHeight + GRADIENT_SAFE_AREA,
    [bottomMargin]
  );

  /* Height of "Actions" area + Content end margin */
  const actionsAreaHeight: number = useMemo(
    () => bottomMargin + buttonSolidHeight + contentEndMargin,
    [bottomMargin]
  );

  const handleScroll = useAnimatedScrollHandler(
    ({ contentOffset, layoutMeasurement, contentSize }) => {
      const isEndReached =
        layoutMeasurement.height + contentOffset.y >= contentSize.height;

      // eslint-disable-next-line functional/immutable-data
      enableTransition.value = isEndReached ? 0 : 1;
    }
  );

  const animatedOpacity = useAnimatedStyle(() => ({
    opacity: withTiming(enableTransition.value, {
      duration: 500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    })
  }));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: IOColors.white
      }}
    >
      <Animated.ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault,
          paddingBottom: actionsAreaHeight
        }}
      >
        <H2>Start</H2>
        {[...Array(50)].map((_el, i) => (
          <Body key={`body-${i}`}>Repeated text</Body>
        ))}
        <ButtonOutline
          label="Test"
          accessibilityLabel={""}
          onPress={() => Alert.alert("Test button")}
        />
        {[...Array(2)].map((_el, i) => (
          <Body key={`body-${i}`}>Repeated text</Body>
        ))}
        <H2>End</H2>
      </Animated.ScrollView>

      <StickyGradientBottomActions
        bottomMargin={bottomMargin}
        gradientAreaHeight={gradientAreaHeight}
        transitionAnimStyle={animatedOpacity}
      />
    </View>
  );
};
