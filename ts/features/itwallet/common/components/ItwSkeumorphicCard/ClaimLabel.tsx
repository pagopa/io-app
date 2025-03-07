import {
  IOFontWeight,
  makeFontStyleObject
} from "@pagopa/io-app-design-system";
import { FunctionComponent, PropsWithChildren } from "react";

import { Text, TextStyle, useWindowDimensions } from "react-native";
import { HIDDEN_CLAIM_TEXT } from "../../utils/constants.ts";

export type ClaimLabelProps = {
  fontSize?: number;
  fontWeight?: IOFontWeight;
  textTransform?: TextStyle["textTransform"];
  valuesHidden?: boolean;
};

/**
 * Custom component to display text claim components on skeumorphic credential cards
 */
export const ClaimLabel: FunctionComponent<
  PropsWithChildren<ClaimLabelProps>
> = ({
  fontSize = 11,
  fontWeight = "Semibold",
  textTransform = "none",
  valuesHidden,
  ...props
}) => {
  const { width } = useWindowDimensions();

  // 360 is the width of the screen in the smallest device
  // We calculated the optimal font size for a 360px screen
  // and then we scale it to the current screen width
  const fontScale = width / 360;

  return (
    <Text
      {...props}
      allowFontScaling={false}
      lineBreakMode="head"
      numberOfLines={1}
      // This text should not be read by the voiceover.
      // If you want to make it accessible use the parent components
      accessible={false}
      style={{
        ...makeFontStyleObject(
          fontSize * fontScale,
          "TitilliumSansPro",
          undefined,
          fontWeight,
          undefined,
          false
        ),
        textTransform
      }}
    >
      {valuesHidden ? HIDDEN_CLAIM_TEXT : props.children}
    </Text>
  );
};
