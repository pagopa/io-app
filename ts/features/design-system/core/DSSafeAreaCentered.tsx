import {
  Body,
  H4,
  hexToRgba,
  IOColors,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Platform, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const DSSafeAreaCentered = () => {
  const insets = useSafeAreaInsets();
  const fixedBottomBarHeight: number = 70;

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        style={{
          flexGrow: 1,
          backgroundColor: IOColors["error-100"]
        }}
      >
        {/* This extra View is mandatory when you have a fixed
        bottom component to get a consistent behavior
        across platforms */}
        <View style={{ flexGrow: 1, paddingBottom: fixedBottomBarHeight }}>
          <ScrollView
            centerContent
            contentContainerStyle={[
              { backgroundColor: IOColors.white },
              /* Android fallback because `centerContent`
              is only an iOS property */
              Platform.OS === "android" && {
                flexGrow: 1,
                justifyContent: "center"
              }
            ]}
          >
            <View style={{ padding: IOVisualCostants.appMarginDefault }}>
              <H4>Start</H4>
              <VSpacer size={24} />
              <Body>Single text</Body>
              <VSpacer size={24} />
              <H4>End</H4>
            </View>
          </ScrollView>
        </View>
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
