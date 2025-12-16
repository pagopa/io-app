import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  IOColors,
  hexToRgba,
  ContentWrapper,
  IOVisualCostants,
  Body,
  H4
} from "@pagopa/io-app-design-system";

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
      <ScrollView
        contentContainerStyle={{
          backgroundColor: IOColors.white,
          paddingVertical: IOVisualCostants.appMarginDefault
        }}
      >
        {/* This extra View is required because ScrollView
          doesn't manage properly the padding values set directly */}
        <ContentWrapper>
          <View style={{ paddingBottom: insets.bottom + bottomBarHeight }}>
            <H4>Start</H4>
            {[...Array(50)].map((_el, i) => (
              <Body key={`body-${i}`}>Repeated text</Body>
            ))}
            <H4>End</H4>
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
