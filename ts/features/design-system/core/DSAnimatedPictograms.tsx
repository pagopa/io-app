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
};

export const DSAnimatedPictograms = () => {
  const insets = useSafeAreaInsets();
  const theme = useIOTheme();

  const scrollGradientHeight: number = 32;
  const pictogramSize: IOPictogramSizeScale = 180;

  const pictogramsRefs: Array<AnimatedPictogramType> = [
    { name: "welcome", label: "Welcome" },
    { name: "empty", label: "Empty" },
    { name: "scanCardiOS", label: "Scan Card (iOS)" },
    { name: "scanCardAndroid", label: "Scan Card (Android)" },
    { name: "umbrella", label: "Umbrella" },
    { name: "accessDenied", label: "Access Denied" },
    { name: "fatalError", label: "Fatal Error" },
    { name: "lock", label: "Lock" },
    { name: "searchLens", label: "Search" },
    { name: "success", label: "Success" },
    { name: "attention", label: "Attention" },
    { name: "waiting", label: "Waiting" }
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
