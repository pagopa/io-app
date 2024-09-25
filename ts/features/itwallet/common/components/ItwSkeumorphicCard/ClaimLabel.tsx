import {
  IOFontWeight,
  useTypographyFactory
} from "@pagopa/io-app-design-system";
import React from "react";
import { useWindowDimensions } from "react-native";

const defaultFontSize = 11;
const defaultFontWeight: IOFontWeight = "Semibold";

export type ClaimLabelProps = {
  fontSize?: number;
  fontWeight?: IOFontWeight;
};

/**
 * Custom component to display text claim components on skeumorphic credential cards
 */
export const ClaimLabel: React.FunctionComponent<
  React.PropsWithChildren<ClaimLabelProps>
> = ({
  fontSize = defaultFontSize,
  fontWeight = defaultFontWeight,
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
    fontStyle: { fontSize: fontSize * fontScale },
    lineBreakMode: "head",
    numberOfLines: 1
  });
};
