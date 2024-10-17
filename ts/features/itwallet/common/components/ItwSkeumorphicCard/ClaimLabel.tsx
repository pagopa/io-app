import {
  IOFontWeight,
  useTypographyFactory
} from "@pagopa/io-app-design-system";
import React from "react";
import { TextStyle, useWindowDimensions } from "react-native";

const defaultFontSize = 11;
const defaultFontWeight: IOFontWeight = "Semibold";

export type ClaimLabelProps = {
  fontSize?: number;
  fontWeight?: IOFontWeight;
  textTransform?: TextStyle["textTransform"];
};

/**
 * Custom component to display text claim components on skeumorphic credential cards
 */
export const ClaimLabel: React.FunctionComponent<
  React.PropsWithChildren<ClaimLabelProps>
> = ({
  fontSize = defaultFontSize,
  fontWeight = defaultFontWeight,
  textTransform = "none",
  ...props
}) => {
  const { width } = useWindowDimensions();

  // 360 is the width of the screen in the smallest device
  // We calculated the optimal font size for a 360px screen
  // and then we scale it to the current screen width
  const fontScale = width / 360;

  return useTypographyFactory({
    ...props,
    defaultWeight: fontWeight,
    defaultColor: "black",
    font: "TitilliumSansPro",
    fontStyle: { fontSize: fontSize * fontScale, textTransform },
    lineBreakMode: "head",
    numberOfLines: 1,
    // This text should not be read by the voiceover.
    // If you want to make it accessible use the parent components
    accessible: false
  });
};
