import {
  Body,
  H4,
  hexToRgba,
  IOColors,
  IOVisualCostants,
  VStack
} from "@pagopa/io-app-design-system";
import { Platform, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets
} from "react-native-safe-area-context";

export const DSSafeAreaCentered = () => {
  const insets = useSafeAreaInsets();
  const fixedBottomBarHeight: number = 70;

  return (
    <SafeAreaView
      style={{
        flexGrow: 1,
        backgroundColor: IOColors["error-100"],
        paddingBottom: fixedBottomBarHeight
      }}
    >
      <ScrollView
        centerContent
        alwaysBounceVertical={false}
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
        <VStack
          style={{ padding: IOVisualCostants.appMarginDefault }}
          space={24}
        >
          <H4>Start</H4>
          <Body>Single text</Body>
          <H4>End</H4>
        </VStack>
      </ScrollView>
      {/* Fixed Component: Start */}
      <View
        style={{
          bottom: 0,
          position: "absolute",
          width: "100%",
          paddingBottom: insets.bottom,
          paddingHorizontal: IOVisualCostants.appMarginDefault,
          backgroundColor: hexToRgba(IOColors["blueIO-500"], 0.5)
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
  );
};
