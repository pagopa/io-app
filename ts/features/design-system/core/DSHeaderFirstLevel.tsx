import * as React from "react";
import { ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets
} from "react-native-safe-area-context";
import {
  Body,
  H4,
  IOColors,
  IOVisualCostants,
  hexToRgba
} from "@pagopa/io-app-design-system";

const bottomBarHeight: number = 70;

export const DSHeaderFirstLevel = () => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
      <ScrollView
        contentContainerStyle={{
          backgroundColor: IOColors.white,
          paddingTop: IOVisualCostants.appMarginDefault,
          paddingBottom:
            insets.bottom + bottomBarHeight + IOVisualCostants.appMarginDefault
        }}
      >
        <View style={{ paddingHorizontal: IOVisualCostants.appMarginDefault }}>
          <H4>Start</H4>
          {[...Array(50)].map((_el, i) => (
            <Body key={`body-${i}`}>Repeated text</Body>
          ))}
          <H4>End</H4>
        </View>
      </ScrollView>
      {/* BOTTOM BAR: Start */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          backgroundColor: hexToRgba(IOColors["blueIO-500"], 0.7),
          paddingBottom: insets.bottom
        }}
      >
        <View
          style={{
            backgroundColor: IOColors.black,
            height: bottomBarHeight,
            width: "100%",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text style={{ color: IOColors.white }}>Navbar</Text>
        </View>
      </View>
      {/* BOTTOM BAR: End */}
    </SafeAreaView>
  );
};
