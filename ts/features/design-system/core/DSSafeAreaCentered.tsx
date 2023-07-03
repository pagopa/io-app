import * as React from "react";
import { Text, View, SafeAreaView } from "react-native";
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
import { VSpacer } from "../../../components/core/spacer/Spacer";

export const DSSafeAreaCentered = () => (
  <View style={IOStyles.flex}>
    <SafeAreaView style={{ flex: 1, backgroundColor: IOColors["error-100"] }}>
      <View
        style={[
          IOStyles.flex,
          {
            backgroundColor: IOColors.white,
            alignItems: "center",
            justifyContent: "center"
          }
        ]}
      >
        <H2>Start</H2>
        <VSpacer size={24} />
        <Body>Single text</Body>
        <VSpacer size={24} />
        <H2>End</H2>
      </View>
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
