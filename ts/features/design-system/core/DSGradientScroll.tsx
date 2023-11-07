import * as React from "react";
import { Alert, View } from "react-native";
import {
  ButtonOutline,
  GradientScrollView,
  IOColors
} from "@pagopa/io-app-design-system";
import { H2 } from "../../../components/core/typography/H2";
import { Body } from "../../../components/core/typography/Body";

export const DSGradientScroll = () => (
  <View
    style={{
      flexGrow: 1,
      backgroundColor: IOColors.white
    }}
  >
    <GradientScrollView
      primaryActionProps={{
        label: "Primary action",
        accessibilityLabel: "",
        onPress: () => Alert.alert("Primary action pressed! (⁠⁠ꈍ⁠ᴗ⁠ꈍ⁠)")
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
    </GradientScrollView>
  </View>
);
