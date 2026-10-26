import {
  Body,
  H4,
  IOColorPalette,
  IODimensions,
  useIOColors,
  VStack,
  withAlpha
} from "@io-app/design-system";
import { Platform, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets
} from "react-native-safe-area-context";

export const DSSafeAreaCentered = () => {
  const insets = useSafeAreaInsets();
  const colors = useIOColors();
  const fixedBottomBarHeight = 70;

  return (
    <SafeAreaView
      style={{
        flexGrow: 1,
        backgroundColor: IOColorPalette.red[100],
        paddingBottom: fixedBottomBarHeight
      }}
    >
      <ScrollView
        alwaysBounceVertical={false}
        centerContent
        contentContainerStyle={[
          { backgroundColor: colors.background.default },
          /* Android fallback because `centerContent`
              is only an iOS property */
          Platform.OS === "android" && {
            flexGrow: 1,
            justifyContent: "center"
          }
        ]}
      >
        <VStack
          space={24}
          style={{ padding: IODimensions.padding.screen.default }}
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
          paddingHorizontal: IODimensions.padding.screen.default,
          backgroundColor: withAlpha(IOColorPalette.blueIO[500], 0.5)
        }}
      >
        <View
          style={{
            alignSelf: "flex-end",
            alignItems: "center",
            justifyContent: "center",
            height: fixedBottomBarHeight,
            width: "100%",
            backgroundColor: withAlpha(IOColorPalette.greyscale.black, 0.8)
          }}
        >
          <Text style={{ color: IOColorPalette.greyscale.white }}>
            Fixed component
          </Text>
        </View>
      </View>
      {/* Fixed Component: End */}
    </SafeAreaView>
  );
};
