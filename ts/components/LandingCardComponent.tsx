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

export const LandingCardComponent = React.forwardRef<View, Props>(
  (props, ref) => {
    const { width: screenWidth } = props.screenDimensions;
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
          <VSpacer size={16} />
          <H3 style={{ textAlign: "center" }}>{title}</H3>
          <VSpacer size={16} />
          <Body style={{ textAlign: "center" }}>{content}</Body>
          <VSpacer size={16} />
        </View>
      </ScrollView>
    );
  }
);
