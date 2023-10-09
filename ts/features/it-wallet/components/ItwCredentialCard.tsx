import * as React from "react";
import {
  View,
  Dimensions,
  Image,
  StyleSheet,
  ImageSourcePropType
} from "react-native";
import { H3, H6, IOColors } from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";
import customVariables from "../../../theme/variables";

/**
 * Props for the component which consists of the name and fiscal code to be render on the card.
 */
type Props = {
  name: string;
  fiscalCode: string;
  backgroundImage: ImageSourcePropType;
};

/**
 * Card dimension 498 x 858
 */
const CARD_WIDTH =
  Dimensions.get("screen").width - 2 * customVariables.contentPadding;

const SCALE_FACTOR = CARD_WIDTH / 858;

const TEXT_LEFT_MARGIN = 50 * SCALE_FACTOR;

const CARD_HEIGHT = 498 * SCALE_FACTOR;

const NAME_MARGIN_TOP = 320 * SCALE_FACTOR;

const FISCAL_CODE_MARGIN_TOP = NAME_MARGIN_TOP + 65 * SCALE_FACTOR;

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
 * @param props - props of the screen containg name and fiscal code.
 */
const ItwCredentialCard = ({ name, fiscalCode, backgroundImage }: Props) => (
  <View>
    <Image source={backgroundImage} style={styles.cardBackground} />
    <H3
      color="white"
      accessibilityLabel={name}
      style={[styles.text, styles.titleText]}
    >
      {I18n.t("features.itWallet.verifiableCredentials.type.digitalCredential")}
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
