import * as React from "react";
import { Text, View, SafeAreaView, ScrollView } from "react-native";
import {
  Body,
  H4,
  IOColors,
  IOVisualCostants,
  hexToRgba
} from "@pagopa/io-app-design-system";
import { IOStyles } from "../../../components/core/variables/IOStyles";

export const DSSafeArea = () => (
  <View style={IOStyles.flex}>
    <SafeAreaView style={{ flex: 1, backgroundColor: IOColors["error-100"] }}>
      <ScrollView contentContainerStyle={{ backgroundColor: IOColors.white }}>
        <View style={{ flex: 1 }}>
          <H4>Start</H4>
          {[...Array(50)].map((_el, i) => (
            <Body key={`body-${i}`}>Repeated text</Body>
          ))}
          <H4>End</H4>
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
