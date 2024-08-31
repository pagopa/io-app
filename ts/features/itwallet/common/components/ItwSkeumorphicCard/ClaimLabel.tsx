import { useTypographyFactory } from "@pagopa/io-app-design-system";
import React from "react";
import { Text, useWindowDimensions } from "react-native";

type ClaimLabelProps = Omit<React.ComponentPropsWithRef<typeof Text>, "style">;

/**
 * Custom component to display text claim components on skeumorphic credential cards
 */
export const ClaimLabel: React.FunctionComponent<ClaimLabelProps> = props => {
  const { width } = useWindowDimensions();

  // 360 is the width of the screen in the smallest device
  // We calculated the optimal font size for a 360px screen
  // and then we scale it to the current screen width
  const fontScale = width / 360;

  return useTypographyFactory({
    ...props,
    defaultWeight: "Semibold",
    defaultColor: "black",
    font: "TitilliumSansPro",
    fontStyle: { fontSize: 11 * fontScale },
    lineBreakMode: "head",
    numberOfLines: 1
  });
};
