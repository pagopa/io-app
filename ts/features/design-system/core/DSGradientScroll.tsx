import * as React from "react";
import { Alert, View } from "react-native";
import { IOColors } from "@pagopa/io-app-design-system";
import { H2 } from "../../../components/core/typography/H2";
import { Body } from "../../../components/core/typography/Body";
import ButtonOutline from "../../../components/ui/ButtonOutline";
import GradientScrollView from "../../../components/ui/GradientScrollView";
import ButtonSolid from "../../../components/ui/ButtonSolid";

export const DSGradientScroll = () => (
  <View
    style={{
      flexGrow: 1,
      backgroundColor: IOColors.white
    }}
  >
    <GradientScrollView
      primaryAction={
        <ButtonSolid
          fullWidth
          label="Primary action"
          accessibilityLabel={""}
          onPress={() => Alert.alert("Primary action pressed! (⁠⁠ꈍ⁠ᴗ⁠ꈍ⁠)")}
        />
      }
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
