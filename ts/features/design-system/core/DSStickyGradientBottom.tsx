import * as React from "react";
import { Alert, GestureResponderEvent, ScrollView, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets
} from "react-native-safe-area-context";
import { IOColors } from "../../../components/core/variables/IOColors";
import { H2 } from "../../../components/core/typography/H2";
import { Body } from "../../../components/core/typography/Body";
import StickyGradientBottomActions from "../../../components/ui/StickyGradientBottomActions";
import ButtonOutline from "../../../components/ui/ButtonOutline";
import { IOVisualCostants } from "../../../components/core/variables/IOStyles";

const bottomBarHeight: number = 0;

export const DSStickyGradientBottom = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: IOColors.white
      }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
        <ScrollView
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
        </ScrollView>
        <StickyGradientBottomActions />
      </SafeAreaView>
    </View>
  );
};
