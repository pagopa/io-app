import * as React from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  IOColors,
  hexToRgba
} from "../../../components/core/variables/IOColors";
import { H2 } from "../../../components/core/typography/H2";
import { Body } from "../../../components/core/typography/Body";
import { IOVisualCostants } from "../../../components/core/variables/IOStyles";
import { ContentWrapper } from "../../../components/core/ContentWrapper";

const bottomBarHeight: number = 70;

export const DSFullScreenModal = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: IOColors.white
      }}
    >
      <ScrollView style={{ backgroundColor: IOColors.white }}>
        {/* This extra View is required because ScrollView
          doesn't manage properly the padding values set directly */}
        <ContentWrapper>
          <View style={{ paddingBottom: insets.bottom + bottomBarHeight }}>
            <H2>Start</H2>
            {[...Array(50)].map((_el, i) => (
              <Body key={`body-${i}`}>Repeated text</Body>
            ))}
            <H2>End</H2>
          </View>
        </ContentWrapper>
      </ScrollView>
      {/* BOTTOM BAR: Start */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          paddingHorizontal: IOVisualCostants.appMarginDefault,
          backgroundColor: hexToRgba(IOColors["blueIO-500"], 0.7),
          paddingBottom: insets.bottom
        }}
      >
        <View
          style={{
            backgroundColor: hexToRgba(IOColors.black, 0.5),
            height: bottomBarHeight,
            width: "100%",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text style={{ color: IOColors.white }}>Fixed component</Text>
        </View>
      </View>
      {/* BOTTOM BAR: End */}
    </View>
  );
};
