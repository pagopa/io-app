import {
  Body,
  ContentWrapper,
  FooterActionsInline,
  H1,
  useFooterActionsInlineMeasurements
} from "@pagopa/io-app-design-system";
import { Alert, ScrollView, View } from "react-native";

export const DSFooterActionsInline = () => {
  const {
    footerActionsInlineMeasurements,
    handleFooterActionsInlineMeasurements
  } = useFooterActionsInlineMeasurements();

  return (
    <View>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: footerActionsInlineMeasurements.safeBottomAreaHeight
        }}
      >
        <ContentWrapper>
          <H1>Footer Actions (inline)</H1>
          {[...Array(50)].map((_el, i) => (
            <Body key={`body-${i + 1}`}>{`Repeated text ${i + 1}`}</Body>
          ))}
        </ContentWrapper>
      </ScrollView>
      <FooterActionsInline
        onMeasure={handleFooterActionsInlineMeasurements}
        startAction={{
          color: "primary",
          label: "Outline button",
          onPress: () => Alert.alert("Button pressed")
        }}
        endAction={{
          color: "primary",
          onPress: () => Alert.alert("Button pressed"),
          label: "Solid button"
        }}
      />
    </View>
  );
};
