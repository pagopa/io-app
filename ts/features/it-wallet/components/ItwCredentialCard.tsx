import * as React from "react";
import { View, Dimensions, Image, StyleSheet } from "react-native";
import { Body, H6, IOColors, Label } from "@pagopa/io-app-design-system";
import customVariables from "../../../theme/variables";
import { CredentialCatalogDisplay } from "../utils/mocks";

/**
 * Props for the component.
 */
type Props = {
  name?: string;
  fiscalCode?: string;
  display: CredentialCatalogDisplay;
};

/**
 * Background standard dimension.
 */
const BACKGROUND_WIDTH = 820;
const BACKGROUND_HEIGTH = 518;

const CARD_WIDTH =
  Dimensions.get("screen").width - 2 * customVariables.contentPadding;

const SCALE_FACTOR = CARD_WIDTH / BACKGROUND_WIDTH;

const TEXT_LEFT_MARGIN = 50 * SCALE_FACTOR;

const CARD_HEIGHT = BACKGROUND_HEIGTH * SCALE_FACTOR;

const NAME_MARGIN_TOP = 380 * SCALE_FACTOR;

const FISCAL_CODE_MARGIN_TOP = NAME_MARGIN_TOP + 55 * SCALE_FACTOR;

const TITLE_MARGIN_TOP = 50 * SCALE_FACTOR;

const styles = StyleSheet.create({
  cardBackground: {
    resizeMode: "contain",
    height: CARD_HEIGHT,
    width: CARD_WIDTH
  },
  text: {
    position: "absolute",
    marginLeft: TEXT_LEFT_MARGIN,
    color: IOColors.white,
    fontWeight: "700"
  },
  fiscalCodeText: {
    marginTop: FISCAL_CODE_MARGIN_TOP,
    color: IOColors.white
  },
  nameText: {
    marginTop: NAME_MARGIN_TOP,
    color: IOColors.white
  },
  titleText: {
    marginTop: TITLE_MARGIN_TOP,
    colors: IOColors.white
  }
});

/**
 * Renders a card for the PID credential with the name and fiscal code of the owner.
 * @param title - the credential title.
 * @param name - the name of the owner.
 * @param fiscalCode - the fiscal code of the owner.
 * @param backgroundImage - the background image of the card.
 */
const ItwCredentialCard = ({
  name,
  fiscalCode,
  display: { image, title, textColor }
}: Props) => (
  <View>
    <Image source={image} style={styles.cardBackground} />
    <H6
      color={textColor}
      accessibilityLabel={name}
      style={[styles.text, styles.titleText]}
    >
      {title}
    </H6>
    {name && (
      <Label
        weight="Regular"
        color={textColor}
        style={[styles.text, styles.nameText]}
        accessibilityLabel={name}
      >
        {name}
      </Label>
    )}
    {fiscalCode && (
      <Body
        weight="SemiBold"
        color={textColor}
        style={[styles.text, styles.fiscalCodeText]}
        accessibilityLabel={name}
      >
        {fiscalCode}
      </Body>
    )}
  </View>
);

export default ItwCredentialCard;
