import * as React from "react";
import { Text, View, SafeAreaView } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

export const DSSafeAreaCentered = () => {
  const insets = useSafeAreaInsets();
  const fixedBottomBarHeight: number = 70;

  return (
    <View style={IOStyles.flex}>
      <SafeAreaView
        style={{
          flexGrow: 1,
          backgroundColor: IOColors["error-100"]
        }}
      >
        <ScrollView
          centerContent
          contentInset={{ bottom: fixedBottomBarHeight }}
          contentContainerStyle={{
            backgroundColor: IOColors.white
            // paddingBottom: fixedBottomBarHeight
          }}
        >
          <View style={{ padding: IOVisualCostants.appMarginDefault }}>
            <H2>Start</H2>
            <VSpacer size={24} />
            <Body>Single text</Body>
            <VSpacer size={24} />
            <H2>End</H2>
          </View>
        </ScrollView>
        {/* Fixed Component: Start */}
        <View
          style={{
            bottom: 0,
            position: "absolute",
            width: "100%",
            paddingBottom: insets.bottom,
            paddingHorizontal: IOVisualCostants.appMarginDefault,
            backgroundColor: hexToRgba(IOColors["blueIO-500"], 0.7)
          }}
        >
          <View
            style={{
              alignSelf: "flex-end",
              alignItems: "center",
              justifyContent: "center",
              height: fixedBottomBarHeight,
              width: "100%",
              backgroundColor: hexToRgba(IOColors.black, 0.8)
            }}
          >
            <Text style={{ color: IOColors.white }}>Fixed component</Text>
          </View>
        </View>
        {/* Fixed Component: End */}
      </SafeAreaView>
    </View>
  );
};
