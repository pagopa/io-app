import {
  Body,
  H4,
  IOColorPalette,
  IODimensions,
  useIOColors,
  withAlpha
} from "@io-app/design-system";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const DSSafeArea = () => {
  const colors = useIOColors();

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: IOColorPalette.red[100] }}
      >
        <ScrollView
          contentContainerStyle={{
            backgroundColor: colors.background.default
          }}
        >
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
            paddingHorizontal: IODimensions.padding.screen.default,
            backgroundColor: withAlpha(IOColorPalette.blueIO[500], 0.7)
          }}
        >
          <View
            style={{
              alignSelf: "flex-end",
              alignItems: "center",
              justifyContent: "center",
              height: 70,
              width: "100%",
              backgroundColor: withAlpha(IOColorPalette.greyscale.black, 0.8)
            }}
          >
            <Text style={{ color: IOColorPalette.greyscale.white }}>
              Fixed component
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};
