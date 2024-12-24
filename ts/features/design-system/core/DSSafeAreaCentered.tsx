import { Text, View, SafeAreaView, Platform } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  IOColors,
  hexToRgba,
  VSpacer,
  IOVisualCostants,
  Body,
  H4
} from "@pagopa/io-app-design-system";
import { IOStyles } from "../../../components/core/variables/IOStyles";

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
