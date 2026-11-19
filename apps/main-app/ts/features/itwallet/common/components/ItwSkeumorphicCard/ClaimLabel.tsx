import { IOFontWeight, makeFontStyleObject } from "@io-app/design-system";
import { FunctionComponent, PropsWithChildren, useContext } from "react";
import { Text, TextStyle, useWindowDimensions } from "react-native";

import { useFeatureColors } from "../../../../../hooks/useFeatureColors";
import { itwColors } from "../../../colors";
import { HIDDEN_CLAIM_TEXT } from "../../utils/constants.ts";
import { CardWidthContext } from "./CardWidthContext";

export type ClaimLabelProps = {
  fontSize?: number;
  fontWeight?: IOFontWeight;
  hidden?: boolean;
  textTransform?: TextStyle["textTransform"];
};

/**
 * Custom component to display text claim components on skeumorphic credential
 * cards
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
  const { skeumorphicCard: colors } = useFeatureColors(itwColors);
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
      // This text should not be read by the voiceover.
      // If you want to make it accessible use the parent components
      accessible={false}
      allowFontScaling={false}
      numberOfLines={1}
      style={{
        ...makeFontStyleObject(
          fontSize * fontScale,
          "TitilliumSansPro",
          undefined,
          fontWeight,
          undefined,
          false
        ),
        color: colors.label,
        textTransform
      }}
    >
      {hidden ? HIDDEN_CLAIM_TEXT : props.children}
    </Text>
  );
};
