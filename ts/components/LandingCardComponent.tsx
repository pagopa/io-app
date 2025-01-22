/**
 * This component renders the card displayed in the landing page carousel
 */

import { forwardRef } from "react";
import { View, ScrollView, useWindowDimensions } from "react-native";
import {
  Body,
  H3,
  IOPictograms,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";

type Props = {
  id: number;
  pictogramName: IOPictograms;
  title: string;
  content: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

const VERTICAL_SPACING = 16;

export const LandingCardComponent = forwardRef<View, Props>((props, ref) => {
  const screenDimension = useWindowDimensions();
  const screenWidth = screenDimension.width;
  const {
    accessibilityLabel,
    accessibilityHint,
    pictogramName,
    title,
    content
  } = props;

  return (
    <ScrollView
      accessible={false}
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
    >
      <View
        ref={ref}
        style={[
          {
            width: screenWidth
          },
          IOStyles.horizontalContentPadding,
          IOStyles.alignCenter
        ]}
        accessible={true}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        <Pictogram size={180} name={pictogramName} />
        <VSpacer size={VERTICAL_SPACING} />
        <H3 importantForAccessibility="no" style={{ textAlign: "center" }}>
          {title}
        </H3>
        <VSpacer size={VERTICAL_SPACING} />
        <Body importantForAccessibility="no" style={{ textAlign: "center" }}>
          {content}
        </Body>
        <VSpacer size={VERTICAL_SPACING} />
      </View>
    </ScrollView>
  );
});
