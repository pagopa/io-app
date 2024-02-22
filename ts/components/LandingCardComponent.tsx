/**
 * This component renders the card displayed in the landing page carousel
 */

import * as React from "react";
import { View, ScrollView, ScaledSize } from "react-native";
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
  screenDimensions: ScaledSize;
};

export const LandingCardComponent = (card: Props) => {
  const { width: screenWidth, height: screenHeight } = card.screenDimensions;
  const LARGE_SCREEN_TRESHOLD = 600;

  return (
    <ScrollView
      contentContainerStyle={
        screenHeight > LARGE_SCREEN_TRESHOLD
          ? { flex: 1, justifyContent: "center" }
          : {}
      }
    >
      <View
        style={[
          {
            width: screenWidth
          },
          IOStyles.horizontalContentPadding,
          IOStyles.alignCenter
        ]}
        accessible={true}
        accessibilityLabel={card.accessibilityLabel}
        accessibilityHint={card.accessibilityHint}
      >
        <Pictogram size={180} name={card.pictogramName} />
        <VSpacer size={16} />
        <H3 style={{ textAlign: "center" }}>{card.title}</H3>
        <VSpacer size={16} />
        <Body style={{ textAlign: "center" }}>{card.content}</Body>
        <VSpacer size={16} />
      </View>
    </ScrollView>
  );
};
