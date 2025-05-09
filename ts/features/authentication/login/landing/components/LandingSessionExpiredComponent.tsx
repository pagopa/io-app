/**
 * This component renders the card displayed in the landing page carousel
 */

import {
  Body,
  ContentWrapper,
  H3,
  IOButton,
  IOButtonLinkSpecificProps,
  IOPictograms,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { forwardRef } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";

type Props = {
  pictogramName: IOPictograms;
  title: string;
  content: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  buttonLink?: Pick<
    IOButtonLinkSpecificProps,
    | "color"
    | "testID"
    | "label"
    | "accessibilityHint"
    | "accessibilityLabel"
    | "onPress"
    | "icon"
  >;
};

const PICTOGRAM_VERTICAL_SPACING = 24;
const CONTENT_VERTICAL_SPACING = 8;
const BUTTON_VERTICAL_SPACING = 24;

export const LandingSessionExpiredComponent = forwardRef<View, Props>(
  ({ pictogramName, title, content, buttonLink }, ref) => {
    const { width: screenWidth } = useWindowDimensions();

    return (
      <ScrollView
        accessible={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <ContentWrapper
          style={{
            width: screenWidth,
            alignItems: "center"
          }}
        >
          <Pictogram size={180} name={pictogramName} />
          <VSpacer size={PICTOGRAM_VERTICAL_SPACING} />
          <H3 accessible ref={ref} style={{ textAlign: "center" }}>
            {title}
          </H3>
          <VSpacer size={CONTENT_VERTICAL_SPACING} />
          <Body accessible style={{ textAlign: "center" }}>
            {content}
          </Body>
          {buttonLink && (
            <View style={{ alignSelf: "center" }}>
              <VSpacer size={BUTTON_VERTICAL_SPACING} />
              <IOButton variant="link" {...buttonLink} />
            </View>
          )}
        </ContentWrapper>
      </ScrollView>
    );
  }
);
