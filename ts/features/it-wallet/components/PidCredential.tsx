/**
 * A component to show the profile fiscal code fac-simile.
 * It can be displayed as:
 * - Preview: it renders only the header of the fac-simile, rotated on the perspective direction
 * - Full: it renders the fac-simile in the horizontal position
 * - Landscape: it renders the fac-simile in the vertical position (rotated of 90 degrees)
 * The fac-simile back side can be rendered for both full and landscape modes,
 * and it includes the barcode of the fiscal code with the code 128 format
 */
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

type Props = {
  name: string;
  fiscalCode: string;
};

// fiscal card fac-simile dimensions: 546 x 870
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
