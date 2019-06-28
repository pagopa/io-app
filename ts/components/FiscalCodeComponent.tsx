/**
 * A component to show the user fiscal code fac-simile
 *
 * TODO:
 * - add shadow to component
 * - extract missing data from fiscal code
 * - evaluate if the barcode padding give issues
 * - evaluate orientation library usage
 */
import { Text, View } from "native-base";
import * as React from "react";
import { Dimensions, Image, StyleSheet } from "react-native";
import Barcode from "react-native-barcode-builder";
import { FiscalCode } from "../../definitions/backend/FiscalCode";
import { UserProfile } from "../../definitions/backend/UserProfile";
import customVariables from "../theme/variables";

interface BaseProps {
  profile: UserProfile;
}

interface PreviewProps {
  type: "Preview";
}

interface FullProps extends BaseProps {
  type: "Full";
  getCardBack: boolean;
}

interface LandscapeProps extends BaseProps {
  type: "Landscape";
  getCardBack: boolean;
}

type Props = PreviewProps | FullProps | LandscapeProps;

// fiscal card fac-simile dimensions: 546 x 870
const contentWidth =
  Dimensions.get("screen").width - 2 * customVariables.contentPadding;

// Full (horizontal position)
const fullScaleFactor = contentWidth / 870;

const textdLineHeightF = 15;
const textFontSizeF = 11;
const textLeftMarginF = 140 * fullScaleFactor + 6;

const cardHeightF = 546 * fullScaleFactor;
const cardHeaderHeightF = 154 * fullScaleFactor;
const cardSpacerF = 16 * fullScaleFactor;
const cardLargeSpacerF = 24 * fullScaleFactor;
const cardLineHeightF = 26 * fullScaleFactor;

const barCodeHeightF = 107 * fullScaleFactor;
const barCodeWidthF = 512 * fullScaleFactor;
const barCodeMarginLeftF = 181 * fullScaleFactor;
const barCodeMarginTopF = 179 * fullScaleFactor;

const fiscalCodeHeightF = cardHeaderHeightF + cardLargeSpacerF;
const lastNameHeightF =
  cardHeaderHeightF + cardLargeSpacerF + cardLineHeightF * 2 + cardSpacerF;
const nameHeightF = lastNameHeightF + cardLineHeightF + cardSpacerF;

// Landscape (vertical position)
const landscapeScaleFactor = contentWidth / 546;
const textLineHeightL = 28; // to solve misalignment on font, 28 is the fist value that seems to give text centered to line
const textFontSizeL = 18;
const textLeftMarginL = 140 * landscapeScaleFactor + 8;

const cardWidthL = 870 * landscapeScaleFactor;
const cardHeaderHeightL = 154 * landscapeScaleFactor;
const cardSpacerL = 16 * landscapeScaleFactor;
const cardLargeSpacerL = 24 * landscapeScaleFactor;
const cardLineHeightL = 26 * landscapeScaleFactor;

const barCodeHeightL = 107 * landscapeScaleFactor;
const barCodeWidthL = 512 * landscapeScaleFactor;
const barCodeMarginLeftL = 181 * landscapeScaleFactor;
const barCodeMarginTopL = 179 * landscapeScaleFactor;
const fiscalCodeHeightL =
  cardHeaderHeightL +
  cardLargeSpacerL -
  (cardLineHeightL * 2 - textLineHeightL);
const lastNameHeightL =
  fiscalCodeHeightL +
  cardSpacerL +
  cardLineHeightL -
  (cardLineHeightL - textLineHeightL);
const nameHeightL = lastNameHeightL + cardSpacerL + cardLineHeightL;

const styles = StyleSheet.create({
  previewCardBackground: {
    marginBottom: -(cardHeightF - cardHeaderHeightF),
    transform: [{ perspective: 700 }, { rotateX: "-20deg" }, { scaleX: 0.95 }]
  },

  fullCardBackground: {
    resizeMode: "contain",
    height: cardHeightF,
    width: contentWidth
  },

  landscapeCardBackground: {
    resizeMode: "contain",
    width: cardWidthL,
    height: contentWidth
  },

  landscapeCardRotation: {
    transform: [
      { rotateZ: "90deg" },
      { translateY: (cardWidthL - contentWidth) / 2 }
    ],
    marginVertical: (cardWidthL - contentWidth) / 2
  },

  fullText: {
    position: "absolute",
    fontSize: textFontSizeF,
    marginLeft: textLeftMarginF,
    color: customVariables.brandDarkestGray
  },

  landscapeText: {
    position: "absolute",
    color: customVariables.brandDarkestGray,
    fontSize: textFontSizeL,
    width: cardWidthL,
    paddingLeft: textLeftMarginL,
    lineHeight: textLineHeightL
  },

  fullFiscalCodeText: {
    lineHeight: cardLineHeightF * 2,
    marginTop: fiscalCodeHeightF
  },

  landscapeFiscalCodeText: {
    transform: [
      { rotateZ: "90deg" },
      {
        translateY:
          -(2 * customVariables.contentPadding) +
          fiscalCodeHeightL +
          (28 - 15 * landscapeScaleFactor) / 4
      },
      {
        translateX: (cardWidthL - customVariables.contentPadding) / 2
      }
    ]
  },

  fullLastNameText: {
    lineHeight: textdLineHeightF,
    marginTop: lastNameHeightF
  },

  landscapeLastNameText: {
    transform: [
      { rotateZ: "90deg" },
      { translateY: -(2 * customVariables.contentPadding) + lastNameHeightL },
      {
        translateX: (cardWidthL - customVariables.contentPadding) / 2
      }
    ]
  },

  fulleNameText: {
    lineHeight: textdLineHeightF,
    marginTop: nameHeightF
  },

  landscapeNameText: {
    transform: [
      { rotateZ: "90deg" },
      { translateY: -(2 * customVariables.contentPadding) + nameHeightL },
      {
        translateX: (cardWidthL - customVariables.contentPadding) / 2
      }
    ]
  },

  fullBareCode: {
    marginTop: barCodeMarginTopF,
    marginLeft: barCodeMarginLeftF,
    position: "absolute"
  },

  landscapeBarCode: {
    transform: [
      { rotateZ: "90deg" },
      { translateY: -barCodeHeightL / 2 + barCodeMarginTopL },
      { translateX: cardWidthL / 2 + barCodeMarginLeftL - barCodeHeightL / 2 }
    ]
  }
});

export default class FiscalCodeComponent extends React.Component<Props> {
  private renderFrontContent(profile: UserProfile, isLandscape: boolean) {
    return (
      <React.Fragment>
        <Text
          bold={true}
          style={[
            isLandscape
              ? [styles.landscapeText, styles.landscapeFiscalCodeText]
              : [styles.fullText, styles.fullFiscalCodeText]
          ]}
        >
          {profile.fiscal_code.toUpperCase()}
        </Text>

        <Text
          bold={true}
          style={[
            isLandscape
              ? [styles.landscapeText, styles.landscapeLastNameText]
              : [styles.fullText, styles.fullLastNameText]
          ]}
        >
          {profile.family_name.toUpperCase()}
        </Text>

        <Text
          bold={true}
          style={[
            isLandscape
              ? [styles.landscapeText, styles.landscapeNameText]
              : [styles.fullText, styles.fulleNameText]
          ]}
        >
          {profile.name.toUpperCase()}
        </Text>
      </React.Fragment>
    );
  }

  // TODO: add real barcode
  private renderBarCode(fiscalCode: FiscalCode, isLandscape: boolean) {
    return isLandscape ? (
      <View
        style={[
          styles.landscapeBarCode,
          {
            position: "absolute",
            height: barCodeHeightL,
            width: 870 * landscapeScaleFactor,
            alignItems: "flex-start"
          }
        ]}
      >
        <Barcode
          value={fiscalCode}
          format={"CODE128"}
          height={barCodeHeightL - 20} // 20: horizontal default padding of the barcode component
          width={(barCodeWidthL - 20) / 211} // 211: number of characters in the fiscal code barcode with CODE128
        />
      </View>
    ) : (
      <View style={styles.fullBareCode}>
        <Barcode
          value={fiscalCode}
          format={"CODE128"}
          height={barCodeHeightF - 20}
          width={(barCodeWidthF - 20) / 211}
        />
      </View>
    );
  }

  public render(): React.ReactNode {
    return (
      <View>
        <Image
          source={
            this.props.type !== "Preview" && this.props.getCardBack
              ? require("./../../img/fiscalCode/fiscalCodeBack.png")
              : require("./../../img/fiscalCode/fiscalCodeFront.png")
          }
          style={[
            this.props.type === "Preview" && styles.previewCardBackground,
            this.props.type === "Landscape"
              ? [styles.landscapeCardBackground, styles.landscapeCardRotation]
              : styles.fullCardBackground
          ]}
        />
        {this.props.type !== "Preview" &&
          !this.props.getCardBack &&
          this.renderFrontContent(
            this.props.profile,
            this.props.type === "Landscape"
          )}

        {this.props.type !== "Preview" &&
          this.props.getCardBack &&
          this.renderBarCode(
            this.props.profile.fiscal_code,
            this.props.type === "Landscape"
          )}
      </View>
    );
  }
}
