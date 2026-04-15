import { ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets
} from "react-native-safe-area-context";
import {
  Body,
  H4,
  IOColors,
  IOVisualCostants,
  hexToRgba
} from "@pagopa/io-app-design-system";

const bottomBarHeight: number = 70;
const topBarHeight: number = 55;

export const DSEdgeToEdgeArea = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: IOColors.white
      }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + topBarHeight,
            paddingBottom: insets.bottom + bottomBarHeight,
            backgroundColor: IOColors.white
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
            backgroundColor: hexToRgba(IOColors["blueIO-500"], 0.7),
            paddingTop: insets.top
          }}
        >
          <View
            style={{
              backgroundColor: IOColors.black,
              height: topBarHeight,
              width: "100%",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Text style={{ color: IOColors.white }}>Header</Text>
          </View>
        </View>
        {/* TOP BAR: End */}
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
              backgroundColor: IOColors.black,
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
      </SafeAreaView>
    </View>
  );
};
