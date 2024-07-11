import * as React from "react";

import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Skottie } from "react-native-skottie";

/* Animated Pictograms */
import ScanCardiOS from "../../../../assets/animated-pictograms/ScanCardiOS.json";

export const DSAnimatedPictograms = () => {
  const insets = useSafeAreaInsets();
  // const theme = useIOTheme();

  const heroHeight: number = 350 + insets.top;

  return (
    <>
      <View
        style={{
          width: "100%",
          minHeight: heroHeight,
          position: "absolute",
          alignItems: "center",
          top: 0
        }}
      >
        <Skottie
          style={{ width: 200, height: 200 }}
          source={ScanCardiOS}
          autoPlay={true}
        />
      </View>

      {/* <ScrollView
        contentContainerStyle={{
          paddingTop: scrollGradientHeight,
          paddingBottom: 32 + insets.bottom
        }}
      >
        <ContentWrapper>
          <RadioGroup<string>
            type="radioListItem"
            items={renderedOrganizationsURIs}
            selectedItem={selectedItem}
            onPress={onEntitySelected}
          />
        </ContentWrapper>
      </ScrollView> */}
    </>
  );
};
