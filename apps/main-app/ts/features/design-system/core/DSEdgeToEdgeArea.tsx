import {
  Body,
  H4,
  hexToRgba,
  IOColorsLegacy,
  IODimensions
} from "@io-app/design-system";
import { ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets
} from "react-native-safe-area-context";

const bottomBarHeight = 70;
const topBarHeight = 55;

export const DSEdgeToEdgeArea = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: IOColorsLegacy.white
      }}
    >
      <SafeAreaView edges={["left", "right"]} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + topBarHeight,
            paddingBottom: insets.bottom + bottomBarHeight,
            backgroundColor: IOColorsLegacy.white
          }}
        >
          <H4>Start</H4>
          {[...Array(50)].map((_el, i) => (
            <Body key={`body-${i}`}>Repeated text</Body>
          ))}
          <H4>End</H4>
        </ScrollView>
        {/* TOP BAR: Start */}
        <View
          style={{
            position: "absolute",
            top: 0,
            width: "100%",
            backgroundColor: hexToRgba(IOColorsLegacy["blueIO-500"], 0.7),
            paddingTop: insets.top
          }}
        >
          <View
            style={{
              backgroundColor: IOColorsLegacy.black,
              height: topBarHeight,
              width: "100%",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Text style={{ color: IOColorsLegacy.white }}>Header</Text>
          </View>
        </View>
        {/* TOP BAR: End */}
        {/* BOTTOM BAR: Start */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            paddingHorizontal: IODimensions.padding.screen.default,
            backgroundColor: hexToRgba(IOColorsLegacy["blueIO-500"], 0.7),
            paddingBottom: insets.bottom
          }}
        >
          <View
            style={{
              backgroundColor: IOColorsLegacy.black,
              height: bottomBarHeight,
              width: "100%",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Text style={{ color: IOColorsLegacy.white }}>Fixed component</Text>
          </View>
        </View>
        {/* BOTTOM BAR: End */}
      </SafeAreaView>
    </View>
  );
};
