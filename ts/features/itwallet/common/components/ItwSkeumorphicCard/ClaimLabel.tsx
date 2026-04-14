import {
  IOColors,
  IOFontWeight,
  makeFontStyleObject
} from "@pagopa/io-app-design-system";
import { FunctionComponent, PropsWithChildren, useContext } from "react";
import { Text, TextStyle, useWindowDimensions } from "react-native";
import { HIDDEN_CLAIM_TEXT } from "../../utils/constants.ts";
import { CardWidthContext } from "./CardWidthContext";

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
  const cardWidth = useContext(CardWidthContext);
  const { width: screenWidth } = useWindowDimensions();

  // REFERENCE_CARD_WIDTH is the card width at the 360 px baseline screen (360 − 32 px padding).
  // We scale font size relative to the actual card width for pixel-accurate text positioning.
  // Fall back to the screen-width heuristic before the card has been measured (first render).
  const REFERENCE_CARD_WIDTH = 328;
  const fontScale =
    cardWidth > 0 ? cardWidth / REFERENCE_CARD_WIDTH : screenWidth / 360;

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
