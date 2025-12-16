import {
  IOColors,
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
  hidden?: boolean;
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
  hidden,
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
        // Skeumorphic MUST NOT change appearance based on the current theme (both system and app theme)
        // so it is safe to force the text color and make sure it is readable
        color: IOColors["grey-900"],
        textTransform
      }}
    >
      {hidden ? HIDDEN_CLAIM_TEXT : props.children}
    </Text>
  );
};
