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
import { Ref } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";

type Props = {
  accessibilityHint?: string;
  accessibilityLabel?: string;
  buttonLink?: Pick<
    IOButtonLinkSpecificProps,
    | "accessibilityHint"
    | "accessibilityLabel"
    | "color"
    | "icon"
    | "label"
    | "onPress"
    | "testID"
  >;
  content: string;
  pictogramName: IOPictograms;
  ref?: Ref<View>;
  title: string;
};

const PICTOGRAM_VERTICAL_SPACING = 24;
const CONTENT_VERTICAL_SPACING = 8;
const BUTTON_VERTICAL_SPACING = 24;

export const LandingSessionExpiredComponent = ({
  pictogramName,
  title,
  content,
  buttonLink,
  ref
}: Props) => {
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
        <Pictogram name={pictogramName} size={180} />
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
};
