/**
 * A component to show the profile fiscal code fac-simile.
 * It can be displayed as:
 * - Preview: it renders only the header of the fac-simile, rotated on the perspective direction
 * - Full: it renders the fac-simile in the horiontal position
 * - Landscape: it renders the fac-simile in the vertical position (rotated of 90 degrees)
 * The fac-simile back side can be rendered for both full and lansdscape modes,
 * and it includes the barcode of the fiscal code with the code 128 format
 */
import I18n from "i18n-js";
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
  getBackSide: boolean;
}

interface LandscapeProps extends BaseProps {
  type: "Landscape";
  getBackSide: boolean;
}

type Props = PreviewProps | FullProps | LandscapeProps;

// fiscal card fac-simile dimensions: 546 x 870
const contentWidth =
  Dimensions.get("screen").width - 2 * customVariables.contentPadding;

// Full (card horizontal position)
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

// Landscape (card vertical position)
const landscapeScaleFactor = contentWidth / 546;
const textLineHeightL = 28; // to solve misalignment on font, 28 is the fist value that seems to give text centered to line height
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
  -// rotation correction factor
  (2 * customVariables.contentPadding + textLineHeightL / 4) +
  cardHeaderHeightL +
  cardLargeSpacerL;

const lastNameHeightL =
  fiscalCodeHeightL +
  (textLineHeightL - cardLineHeightL) + // overcome 2-line label correction of previous item
  cardSpacerL +
  cardLineHeightL;

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
        translateY: fiscalCodeHeightL
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
      { translateY: lastNameHeightL },
      {
        translateX: (cardWidthL - customVariables.contentPadding) / 2
      }
    ]
  },

  fullNameText: {
    lineHeight: textdLineHeightF,
    marginTop: nameHeightF
  },

  landscapeNameText: {
    transform: [
      { rotateZ: "90deg" },
      { translateY: nameHeightL },
      {
        translateX: (cardWidthL - customVariables.contentPadding) / 2
      }
    ]
  },

  fullFacSimile: {
    marginTop: 280 * fullScaleFactor,
    position: "absolute",
    fontSize: textFontSizeF,
    color: customVariables.brandDarkestGray,
    width: barCodeWidthF
  },

  landscapeFacSimile: {
    marginTop: 280 * landscapeScaleFactor,
    position: "absolute",
    color: customVariables.brandDarkestGray,
    fontSize: textFontSizeL,
    lineHeight: textLineHeightL,
    width: barCodeWidthL
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
              : [styles.fullText, styles.fullNameText]
          ]}
        >
          {profile.name.toUpperCase()}
        </Text>
      </React.Fragment>
    );
  }

  private renderBarCode(fiscalCode: FiscalCode, isLandscape: boolean) {
    return isLandscape ? (
      <View
        style={[
          styles.landscapeBarCode,
          {
            position: "absolute",
            height: barCodeHeightL,
            width: cardWidthL,
            alignItems: "flex-start"
          }
        ]}
      >
        <Barcode
          value={fiscalCode}
          format={"CODE128"}
          height={barCodeHeightL - 20} // 20: horizontal default padding of the barcode component
          width={(barCodeWidthL - 20) / 211} // 211= 16*11 + 35: number of characters in the fiscal code barcode with CODE128
        />
        <Text bold={true} alignCenter={true} style={styles.landscapeFacSimile}>
          {I18n.t("profile.facSimile")}
        </Text>
      </View>
    ) : (
      <View style={styles.fullBareCode}>
        <Barcode
          value={fiscalCode}
          format={"CODE128"}
          height={barCodeHeightF - 20}
          width={(barCodeWidthF - 20) / 211}
        />
        <Text bold={true} alignCenter={true} style={styles.fullFacSimile}>
          {I18n.t("profile.facSimile")}
        </Text>
      </View>
    );
  }

  public render(): React.ReactNode {
    return (
      <View>
        <Image
          source={
            this.props.type !== "Preview" && this.props.getBackSide
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
          !this.props.getBackSide &&
          this.renderFrontContent(
            this.props.profile,
            this.props.type === "Landscape"
          )}

        {this.props.type !== "Preview" &&
          this.props.getBackSide &&
          this.renderBarCode(
            this.props.profile.fiscal_code,
            this.props.type === "Landscape"
          )}
      </View>
    );
  }
}
