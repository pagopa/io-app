import * as React from "react";
import { ScrollView, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets
} from "react-native-safe-area-context";
import { IOColors } from "../../../components/core/variables/IOColors";
import { H2 } from "../../../components/core/typography/H2";
import { Body } from "../../../components/core/typography/Body";
import { IOVisualCostants } from "../../../components/core/variables/IOStyles";

export const DSHeaderSecondLevel = () => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
      <ScrollView
        contentContainerStyle={{
          backgroundColor: IOColors.white,
          paddingTop: IOVisualCostants.appMarginDefault,
          paddingBottom: insets.bottom
        }}
      >
        <View style={{ paddingHorizontal: IOVisualCostants.appMarginDefault }}>
          <H2>Start</H2>
          {[...Array(50)].map((_el, i) => (
            <Body key={`body-${i}`}>Repeated text</Body>
          ))}
          <H2>End</H2>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
