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
import { ScrollView, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AnimatedPictogram,
  IOAnimatedPictograms
} from "../../../components/ui/AnimatedPictogram";

type AnimatedPictogramType = {
  name: IOAnimatedPictograms;
  label: string;
  loop: AnimatedPictogram["loop"];
};

export const DSAnimatedPictograms = () => {
  const insets = useSafeAreaInsets();
  const theme = useIOTheme();

  const scrollGradientHeight: number = 32;
  const pictogramSize: IOPictogramSizeScale = 180;

  const pictogramsRefs: Array<AnimatedPictogramType> = [
    { name: "welcome", label: "Welcome", loop: false },
    { name: "empty", label: "Empty", loop: true },
    { name: "scanCardiOS", label: "Scan Card (iOS)", loop: true },
    { name: "scanCardAndroid", label: "Scan Card (Android)", loop: true },
    { name: "umbrella", label: "Umbrella", loop: true },
    { name: "accessDenied", label: "Access Denied", loop: true },
    { name: "fatalError", label: "Fatal Error", loop: false },
    { name: "lock", label: "Lock", loop: true },
    { name: "searchLens", label: "Search", loop: true },
    { name: "success", label: "Success", loop: true },
    { name: "attention", label: "Attention", loop: true },
    { name: "waiting", label: "Waiting", loop: true }
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
        <View style={{ marginVertical: IOVisualCostants.appMarginDefault }}>
          <AnimatedPictogram
            key={getCurrentPictogram()?.name || pictogramsRefs[0].name}
            size={pictogramSize}
            name={getCurrentPictogram()?.name || pictogramsRefs[0].name}
            loop={getCurrentPictogram()?.loop || pictogramsRefs[0].loop}
          />
        </View>

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
