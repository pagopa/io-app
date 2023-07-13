import * as React from "react";
import { Alert, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets
} from "react-native-safe-area-context";
import Animated, { useAnimatedScrollHandler } from "react-native-reanimated";
import { IOColors } from "../../../components/core/variables/IOColors";
import { H2 } from "../../../components/core/typography/H2";
import { Body } from "../../../components/core/typography/Body";
import StickyGradientBottomActions from "../../../components/ui/StickyGradientBottomActions";
import ButtonOutline from "../../../components/ui/ButtonOutline";
import { IOVisualCostants } from "../../../components/core/variables/IOStyles";

const bottomBarHeight: number = 80;

export const DSStickyGradientBottom = () => {
  const insets = useSafeAreaInsets();
  // const scrollOffset = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      // eslint-disable-next-line no-console
      console.log(event.contentOffset.y);
    }
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: IOColors.white
      }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingHorizontal: IOVisualCostants.appMarginDefault,
            paddingBottom: insets.bottom + bottomBarHeight,
            backgroundColor: IOColors.white
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
        <StickyGradientBottomActions />
      </SafeAreaView>
    </View>
  );
};
