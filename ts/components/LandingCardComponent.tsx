/**
 * This component renders the card displayed in the landing page carousel
 */

import {
  Body,
  ContentWrapper,
  H3,
  IOPictograms,
  Pictogram,
  VStack
} from "@pagopa/io-app-design-system";
import { forwardRef } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";

type Props = {
  id: number;
  pictogramName: IOPictograms;
  title: string;
  content: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

const VERTICAL_SPACING = 16;

export const LandingCardComponent = forwardRef<View, Props>(
  (
    { accessibilityLabel, accessibilityHint, pictogramName, title, content },
    ref
  ) => {
    const { width: screenWidth } = useWindowDimensions();

    return (
      <ScrollView
        accessible={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <ContentWrapper
          ref={ref}
          style={{ width: screenWidth }}
          accessible={true}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
        >
          <VStack space={VERTICAL_SPACING} style={{ alignItems: "center" }}>
            <Pictogram size={180} name={pictogramName} />
            <H3 importantForAccessibility="no" style={{ textAlign: "center" }}>
              {title}
            </H3>
            <Body
              importantForAccessibility="no"
              style={{ textAlign: "center" }}
            >
              {content}
            </Body>
          </VStack>
        </ContentWrapper>
      </ScrollView>
    );
  }
);
