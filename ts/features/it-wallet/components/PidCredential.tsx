import * as React from "react";
import {
  Text,
  View,
  Dimensions,
  Image,
  StyleProp,
  StyleSheet,
  ViewStyle
} from "react-native";
import I18n from "../../../i18n";
import customVariables from "../../../theme/variables";
import { IOColors } from "../../../components/core/variables/IOColors";

/**
 * Props for the component which consists of the name and fiscal code to be render on the card.
 */
type Props = {
  name: string;
  fiscalCode: string;
};

// pid card dimensions: 498 x 858
const contentWidth =
  Dimensions.get("screen").width - 2 * customVariables.contentPadding;

/**
 * Full dimensions (card horizontal position)
 */
const fullScaleFactor = contentWidth / 858;

const textdLineHeightF = 25;
const textFontSizeF = 15;
const textLeftMarginF = 30 * fullScaleFactor + 6;
const titleTopMarginF = 30 * fullScaleFactor;

const cardHeightF = 498 * fullScaleFactor;
const cardHeaderHeightF = 154 * fullScaleFactor;
const cardSpacerF = 2 * fullScaleFactor;
const cardLargeSpacerF = 150 * fullScaleFactor;
const cardLineHeightF = 40 * fullScaleFactor;

const titleHeightF = titleTopMarginF + cardLineHeightF + cardSpacerF;
const lastNameHeightF = cardHeaderHeightF + cardLargeSpacerF;
const fiscalCodeHeightF = lastNameHeightF + cardLineHeightF * 2 + cardSpacerF;
const nameHeightF = lastNameHeightF + cardLineHeightF + cardSpacerF;

const styles = StyleSheet.create({
  fullCardBackground: {
    resizeMode: "contain",
    height: cardHeightF,
    width: contentWidth
  },

  fullText: {
    position: "absolute",
    fontSize: textFontSizeF,
    marginLeft: textLeftMarginF,
    color: IOColors.white
  },

  fullFiscalCodeText: {
    lineHeight: cardLineHeightF * 2,
    marginTop: fiscalCodeHeightF,
    color: IOColors.white
  },

  fullNameText: {
    lineHeight: textdLineHeightF,
    marginTop: nameHeightF,
    color: IOColors.white
  },

  fullTitleText: {
    lineHeight: textdLineHeightF,
    marginTop: titleHeightF,
    colors: IOColors.white,
    fontSize: 20
  }
});

/**
 * Renders a card for the PID credential with the name and fiscal code of the owner.
 * @param props - props of the screen containg name and fiscal code.
 */
const PidCredential = (props: Props) => {
  const renderItem = (content: string, fullStyle: StyleProp<ViewStyle>) => (
    <Text
      accessible={true}
      accessibilityElementsHidden={true}
      importantForAccessibility={"no-hide-descendants"}
      style={[styles.fullText, fullStyle]}
    >
      {content}
    </Text>
  );

  const renderFrontContent = (name: string, fiscalCode: string) => (
    <>
      {renderItem(
        I18n.t(
          "features.itWallet.verifiableCredentials.type.digitalCredential"
        ),
        styles.fullTitleText
      )}

      {renderItem(name, styles.fullNameText)}

      {renderItem(fiscalCode, styles.fullFiscalCodeText)}
    </>
  );

  return (
    <View>
      <Image
        source={require("./../assets/img/pidCard/pidCardFront.png")}
        style={styles.fullCardBackground}
      />
      {renderFrontContent(props.name, props.fiscalCode)}
    </View>
  );
};

export default PidCredential;
