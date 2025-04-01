/**
 * This component renders the card displayed in the landing page carousel
 */

import { forwardRef } from "react";
import { View, ScrollView, useWindowDimensions } from "react-native";
import {
  Body,
  ButtonLink,
  ButtonLinkProps,
  H3,
  IOPictograms,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";

type Props = {
  pictogramName: IOPictograms;
  title: string;
  content: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  buttonLink?: Pick<
    ButtonLinkProps,
    | "color"
    | "testID"
    | "label"
    | "accessibilityHint"
    | "accessibilityLabel"
    | "onPress"
    | "icon"
  >;
};

const VERTICAL_SPACING = 16;
const PICTOGRAM_VERTICAL_SPACING = 24;
const CONTENT_VERTICAL_SPACING = 8;
const BUTTON_VERTICAL_SPACING = 24;

export const LandingSessionExpiredComponent = forwardRef<View, Props>(
  (props, ref) => {
    const screenDimension = useWindowDimensions();
    const screenWidth = screenDimension.width;
    const { pictogramName, title, content, buttonLink } = props;

    return (
      <ScrollView
        accessible={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <View
          style={[
            {
              width: screenWidth
            },
            IOStyles.horizontalContentPadding,
            IOStyles.alignCenter
          ]}
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
            <View style={[IOStyles.alignCenter, IOStyles.selfCenter]}>
              <VSpacer size={BUTTON_VERTICAL_SPACING} />
              <ButtonLink {...buttonLink} />
              <VSpacer size={VERTICAL_SPACING} />
            </View>
          )}
        </View>
      </ScrollView>
    );
  }
);
