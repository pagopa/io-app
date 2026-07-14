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
} from "@io-app/design-system";
import { Ref } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";

type Props = {
  accessibilityHint?: string;
  accessibilityLabel?: string;
  content: string;
  id: number;
  pictogramName: IOPictograms;
  ref?: Ref<View>;
  title: string;
};

const VERTICAL_SPACING = 16;

export const LandingCardComponent = ({
  ref,
  accessibilityLabel,
  accessibilityHint,
  pictogramName,
  title,
  content
}: Props) => {
  const { width: screenWidth } = useWindowDimensions();

  return (
    <ScrollView
      accessible={false}
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
    >
      <ContentWrapper
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        accessible={true}
        ref={ref}
        style={{ width: screenWidth }}
      >
        <VStack space={VERTICAL_SPACING} style={{ alignItems: "center" }}>
          <Pictogram name={pictogramName} size={180} />
          <H3 importantForAccessibility="no" style={{ textAlign: "center" }}>
            {title}
          </H3>
          <Body importantForAccessibility="no" style={{ textAlign: "center" }}>
            {content}
          </Body>
        </VStack>
      </ContentWrapper>
    </ScrollView>
  );
};
