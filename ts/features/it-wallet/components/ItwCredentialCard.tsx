import * as React from "react";
import {
  View,
  Dimensions,
  Image,
  StyleSheet,
  ImageSourcePropType
} from "react-native";
import { H3, H6, IOColors } from "@pagopa/io-app-design-system";
import customVariables from "../../../theme/variables";

/**
 * Props for the component.
 */
type Props = {
  title: string;
  name: string;
  fiscalCode: string;
  backgroundImage: ImageSourcePropType;
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

const TITLE_MARGIN_TOP = 40 * SCALE_FACTOR;

const styles = StyleSheet.create({
  cardBackground: {
    resizeMode: "contain",
    height: CARD_HEIGHT,
    width: CARD_WIDTH
  },
  text: {
    position: "absolute",
    marginLeft: TEXT_LEFT_MARGIN,
    color: IOColors.white
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
  title,
  name,
  fiscalCode,
  backgroundImage
}: Props) => (
  <View>
    <Image source={backgroundImage} style={styles.cardBackground} />
    <H3
      color="white"
      accessibilityLabel={name}
      style={[styles.text, styles.titleText]}
    >
      {title}
    </H3>
    <H6
      style={[styles.text, styles.nameText]}
      color="white"
      accessibilityLabel={name}
    >
      {name}
    </H6>
    <H6
      style={[styles.text, styles.fiscalCodeText]}
      color="white"
      accessibilityLabel={name}
    >
      {fiscalCode}
    </H6>
  </View>
);

export default ItwCredentialCard;
