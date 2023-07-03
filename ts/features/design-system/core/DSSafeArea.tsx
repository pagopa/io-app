import * as React from "react";
import { Text, View, SafeAreaView, ScrollView } from "react-native";
import {
  IOColors,
  hexToRgba
} from "../../../components/core/variables/IOColors";
import { Body } from "../../../components/core/typography/Body";
import { H2 } from "../../../components/core/typography/H2";
import {
  IOStyles,
  IOVisualCostants
} from "../../../components/core/variables/IOStyles";

export const DSSafeArea = () => (
  <View style={IOStyles.flex}>
    <SafeAreaView style={{ flex: 1, backgroundColor: IOColors["error-100"] }}>
      <ScrollView>
        <View style={{ flex: 1, backgroundColor: IOColors.white }}>
          <H2>Start</H2>
          {[...Array(50)].map((_el, i) => (
            <Body key={`body-${i}`}>Repeated text</Body>
          ))}
          <H2>End</H2>
        </View>
      </ScrollView>
      <View
        style={{
          width: "100%",
          paddingHorizontal: IOVisualCostants.appMarginDefault,
          backgroundColor: hexToRgba(IOColors["blueIO-500"], 0.7)
        }}
      >
        <View
          style={{
            alignSelf: "flex-end",
            alignItems: "center",
            justifyContent: "center",
            height: 70,
            width: "100%",
            backgroundColor: hexToRgba(IOColors.black, 0.8)
          }}
        >
          <Text style={{ color: IOColors.white }}>Fixed component</Text>
        </View>
      </View>
    </SafeAreaView>
  </View>
);
