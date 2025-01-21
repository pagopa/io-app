import { Body, IOVisualCostants } from "@pagopa/io-app-design-system";
import { ScrollView } from "react-native";
import { useScreenEndMargin } from "../../../hooks/useScreenEndMargin";

export const DSScreenEndMargin = () => {
  const { screenEndMargin } = useScreenEndMargin();

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: IOVisualCostants.appMarginDefault,
        paddingBottom: screenEndMargin
      }}
    >
      {[...Array(50)].map((_el, i) => (
        <Body key={`body-${i}`}>Repeated text</Body>
      ))}
    </ScrollView>
  );
};
