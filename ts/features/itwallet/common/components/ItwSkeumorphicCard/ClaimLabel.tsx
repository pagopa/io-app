import { useTypographyFactory } from "@pagopa/io-app-design-system";
import React from "react";
import { Dimensions, Text } from "react-native";

type ClaimLabelProps = Omit<React.ComponentPropsWithRef<typeof Text>, "style">;

// Since we only support portrait mode, we don't need to listen to changes
// in screen size
const screenDimensions = Dimensions.get("screen");

// Empirical value to scale the font size on small devices
const fontScaleThreshold = 400;

/**
 * Custom component to display text claim components on skeumorphic credential cards
 */
export const ClaimLabel: React.FunctionComponent<ClaimLabelProps> = props => {
  const fontScale = screenDimensions.width < fontScaleThreshold ? 0.9 : 1;

  return useTypographyFactory({
    ...props,
    defaultWeight: "Semibold",
    defaultColor: "black",
    font: "TitilliumSansPro",
    fontStyle: { fontSize: 12 * fontScale },
    lineBreakMode: "head",
    numberOfLines: 1
  });
};
