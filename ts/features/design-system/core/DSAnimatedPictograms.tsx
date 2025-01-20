import {
  ContentWrapper,
  IOColors,
  IOPictogramSizeScale,
  IOVisualCostants,
  RadioGroup,
  hexToRgba,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";

/* Animated Pictograms */
import empty from "../../../../assets/animated-pictograms/Empty.json";
import error from "../../../../assets/animated-pictograms/Error.json";
import fatalError from "../../../../assets/animated-pictograms/FatalError.json";
import lock from "../../../../assets/animated-pictograms/Lock.json";
import scanCardAndroid from "../../../../assets/animated-pictograms/ScanCardAndroid.json";
import scanCardiOS from "../../../../assets/animated-pictograms/ScanCardiOS.json";
import search from "../../../../assets/animated-pictograms/Search.json";
import success from "../../../../assets/animated-pictograms/Success.json";
import umbrella from "../../../../assets/animated-pictograms/Umbrella.json";
import warning from "../../../../assets/animated-pictograms/Warning.json";
import welcome from "../../../../assets/animated-pictograms/Welcome.json";
import waiting from "../../../../assets/animated-pictograms/Waiting.json";

export const DSAnimatedPictograms = () => {
  const insets = useSafeAreaInsets();
  const theme = useIOTheme();

  const scrollGradientHeight: number = 32;
  const pictogramSize: IOPictogramSizeScale = 180;

  const pictogramsRefs = [
    { name: welcome, label: "Welcome", loop: false },
    { name: empty, label: "Empty", loop: true },
    { name: scanCardiOS, label: "Scan Card (iOS)", loop: true },
    { name: scanCardAndroid, label: "Scan Card (Android)", loop: true },
    { name: umbrella, label: "Umbrella", loop: true },
    { name: error, label: "Error", loop: true },
    { name: fatalError, label: "Fatal Error", loop: true },
    { name: lock, label: "Lock", loop: true },
    { name: search, label: "Search", loop: true },
    { name: success, label: "Success", loop: true },
    { name: warning, label: "Warning", loop: true },
    { name: waiting, label: "Waiting", loop: true }
  ];

  const renderedPictogramsRefs: Array<{
    value: string;
    id: string;
  }> = pictogramsRefs.map(item => ({
    value: item.label,
    id: item.label
  }));

  const [selectedPictogram, setSelectedPictogram] = useState(
    pictogramsRefs[0].label
  );

  const onPictogramSelected = useCallback(
    (item: string) => {
      setSelectedPictogram(item);
    },
    [setSelectedPictogram]
  );

  const getCurrentPictogram = () =>
    pictogramsRefs.find(ref => ref.label === selectedPictogram);

  const pictogramAreaHeight =
    pictogramSize +
    IOVisualCostants.appMarginDefault * 2 -
    scrollGradientHeight;

  return (
    <>
      <View
        style={{
          width: "100%",
          zIndex: 1,
          minHeight: pictogramAreaHeight,
          backgroundColor: IOColors[theme["appBackground-primary"]],
          position: "absolute",
          alignItems: "center"
        }}
      >
        <LottieView
          autoPlay={true}
          style={{
            width: pictogramSize,
            height: pictogramSize,
            marginVertical: IOVisualCostants.appMarginDefault
          }}
          source={getCurrentPictogram()?.name || pictogramsRefs[0].name}
          loop={getCurrentPictogram()?.loop || pictogramsRefs[0].loop}
        />
        <LinearGradient
          style={{
            height: scrollGradientHeight,
            position: "absolute",
            left: -IOVisualCostants.appMarginDefault,
            right: -IOVisualCostants.appMarginDefault,
            bottom: -scrollGradientHeight
          }}
          colors={[
            IOColors[theme["appBackground-primary"]],
            hexToRgba(IOColors[theme["appBackground-primary"]], 0)
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: pictogramAreaHeight + scrollGradientHeight * 2,
          paddingBottom: 32 + insets.bottom
        }}
      >
        <ContentWrapper>
          <RadioGroup<string>
            type="radioListItem"
            items={renderedPictogramsRefs}
            selectedItem={selectedPictogram}
            onPress={onPictogramSelected}
          />
        </ContentWrapper>
      </ScrollView>
    </>
  );
};
