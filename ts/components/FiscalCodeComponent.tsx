/**
 * A component to show the profile fiscal code fac-simile.
 * It can be displayed as:
 * - Preview: it renders only the header of the fac-simile, rotated on the perspective direction
 * - Full: it renders the fac-simile in the horizontal position
 * - Landscape: it renders the fac-simile in the vertical position (rotated of 90 degrees)
 * The fac-simile back side can be rendered for both full and landscape modes,
 * and it includes the barcode of the fiscal code with the code 128 format
 */
import I18n from "i18n-js";
import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import * as React from "react";
import {
  Dimensions,
  Image,
  StyleProp,
  StyleSheet,
  ViewStyle
} from "react-native";
import Barcode from "react-native-barcode-builder";
import { FiscalCode } from "../../definitions/backend/FiscalCode";
import { InitializedProfile } from "../../definitions/backend/InitializedProfile";
import { Municipality } from "../../definitions/content/Municipality";
import customVariables from "../theme/variables";
import { extractFiscalCodeData } from "../utils/profile";

interface BaseProps {
  profile: InitializedProfile;
  municipality: pot.Pot<Municipality, Error>;
  getBackSide: boolean;
  type: "Full" | "Landscape";
}

interface PreviewProps {
  type: "Preview";
}

type Props = PreviewProps | BaseProps;

// fiscal card fac-simile dimensions: 546 x 870
const contentWidth =
  Dimensions.get("screen").width - 2 * customVariables.contentPadding;

/**
 * Full dimensions (card horizontal position)
 */
const fullScaleFactor = contentWidth / 870;

const textdLineHeightF = 16;
const textFontSizeF = 13;
const textLeftMarginF = 140 * fullScaleFactor + 6;
const textGenderLeftMarginF = 800 * fullScaleFactor + 6;

const cardHeightF = 546 * fullScaleFactor;
const cardHeaderHeightF = 154 * fullScaleFactor;
const cardSpacerF = 16 * fullScaleFactor;
const cardLargeSpacerF = 24 * fullScaleFactor;
const cardLineHeightF = 26 * fullScaleFactor;

const barCodeHeightF = 107 * fullScaleFactor;
const barCodeWidthF = 512 * fullScaleFactor;
const barCodeMarginLeftF = 162 * fullScaleFactor;
const barCodeMarginTopF = 164 * fullScaleFactor;

const fiscalCodeHeightF = cardHeaderHeightF + cardLargeSpacerF;
const lastNameHeightF = fiscalCodeHeightF + cardLineHeightF * 2 + cardSpacerF;
const nameHeightF = lastNameHeightF + cardLineHeightF + cardSpacerF;
const birdPlaceHeightF = nameHeightF + cardLineHeightF + cardSpacerF;
const birthCityHeightF = birdPlaceHeightF + cardLineHeightF * 2 + cardSpacerF;
const dateHeightF = birthCityHeightF + cardLineHeightF + cardSpacerF;

/**
 * Landscape dimensions (card vertical position)
 */
const landscapeScaleFactor = contentWidth / 546;
const textLineHeightL = 28; // to solve misalignment on font, 28 is the fist value that seems to give text centered to line height
const textFontSizeL = 21;
const textLeftMarginL = 140 * landscapeScaleFactor + 8;
const textGenderLeftMarginL = 800 * landscapeScaleFactor + 8;

const cardWidthL = 870 * landscapeScaleFactor;
const cardHeaderHeightL = 154 * landscapeScaleFactor;
const cardSpacerL = 16 * landscapeScaleFactor;
const cardLargeSpacerL = 24 * landscapeScaleFactor;
const cardLineHeightL = 26 * landscapeScaleFactor;

const barCodeHeightL = 107 * landscapeScaleFactor;
const barCodeWidthL = 512 * landscapeScaleFactor;
const barCodeMarginLeftL = 170 * landscapeScaleFactor;
const barCodeMarginTopL = 164 * landscapeScaleFactor;

const fiscalCodeHeightL =
  -94 * landscapeScaleFactor + // rotation correction factor
  cardHeaderHeightL +
  cardLargeSpacerL +
  (cardLineHeightL * 2 - textLineHeightL); // 2-line label correction factor - align 0 char dimension

const lastNameHeightL =
  fiscalCodeHeightL +
  (textLineHeightL - cardLineHeightL) + // overcome 2-line label correction of previous item
  cardSpacerL +
  cardLineHeightL;

const nameHeightL = lastNameHeightL + cardSpacerL + cardLineHeightL;

const birthPlaceHeightL =
  nameHeightL +
  cardSpacerL +
  cardLineHeightL +
  (cardLineHeightL * 2 - textLineHeightL) * 2; // // 2-line label correction factor

const birthCityHeightL =
  birthPlaceHeightL +
  (textLineHeightL - cardLineHeightL) - // overcome 2-line label correction of previous item
  (cardLineHeightL * 2 - textLineHeightL) + // overcome 2-line label correction of previous item
  cardSpacerL +
  cardLineHeightL;

const birthDayHeightL =
  birthCityHeightL +
  cardSpacerL +
  cardLineHeightL +
  (cardLineHeightL * 2 - textLineHeightL) * 2; // // 2-line label correction factor

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

  fullGenderText: {
    lineHeight: textdLineHeightF,
    marginTop: nameHeightF,
    marginLeft: textGenderLeftMarginF
  },

  landscapeGender: {
    position: "absolute",
    color: customVariables.brandDarkestGray,
    fontSize: textFontSizeL,
    width: cardWidthL,
    paddingLeft: textGenderLeftMarginL,
    lineHeight: textLineHeightL,
    transform: [
      { rotateZ: "90deg" },
      { translateY: nameHeightL },
      {
        translateX: (cardWidthL - customVariables.contentPadding) / 2
      }
    ]
  },

  fullBirthPlaceText: {
    lineHeight: cardLineHeightF * 2,
    marginTop: birdPlaceHeightF
  },

  landscapeBirthPlaceText: {
    transform: [
      { rotateZ: "90deg" },
      { translateY: birthPlaceHeightL },
      {
        translateX: (cardWidthL - customVariables.contentPadding) / 2
      }
    ]
  },

  landscapeBirthCityText: {
    transform: [
      { rotateZ: "90deg" },
      { translateY: birthCityHeightL },
      {
        translateX: (cardWidthL - customVariables.contentPadding) / 2
      }
    ]
  },

  fullBirthCityText: {
    lineHeight: textdLineHeightF,
    marginTop: birthCityHeightF
  },

  fullDateText: {
    lineHeight: cardLineHeightF * 2,
    marginTop: dateHeightF
  },

  landscapeDateText: {
    transform: [
      { rotateZ: "90deg" },
      { translateY: birthDayHeightL },
      {
        translateX: (cardWidthL - customVariables.contentPadding) / 2
      }
    ]
  },

  fullFacSimileText: {
    marginTop: 310 * fullScaleFactor,
    lineHeight: 38 * fullScaleFactor,
    position: "absolute",
    fontSize: textFontSizeF,
    color: customVariables.brandDarkestGray,
    width: barCodeWidthF
  },

  landscapeFacSimile: {
    marginTop: 295 * landscapeScaleFactor,
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
    position: "absolute",
    height: barCodeHeightL,
    width: cardWidthL,
    alignItems: "flex-start",
    transform: [
      { rotateZ: "90deg" },
      { translateY: -barCodeHeightL / 2 + barCodeMarginTopL },
      { translateX: cardWidthL / 2 + barCodeMarginLeftL - barCodeHeightL / 2 }
    ]
  }
});

export default class FiscalCodeComponent extends React.Component<Props> {
  private renderItem(
    content: string,
    fullStyle: StyleProp<ViewStyle>,
    landscapeStyle: StyleProp<ViewStyle>,
    isLandscape: boolean,
    selectable: boolean = false
  ) {
    return (
      <Text
        robotomono={true}
        bold={true}
        style={[
          isLandscape
            ? [styles.landscapeText, landscapeStyle]
            : [styles.fullText, fullStyle]
        ]}
        selectable={selectable}
      >
        {content.toUpperCase()}
      </Text>
    );
  }

  private renderFrontContent(
    profile: InitializedProfile,
    municipality: pot.Pot<Municipality, Error>,
    isLandscape: boolean
  ) {
    const fiscalCode = profile.fiscal_code;
    const fiscalCodeData = extractFiscalCodeData(fiscalCode, municipality);

    return (
      <React.Fragment>
        {this.renderItem(
          fiscalCode,
          styles.fullFiscalCodeText,
          styles.landscapeFiscalCodeText,
          isLandscape,
          true
        )}

        {this.renderItem(
          profile.family_name,
          styles.fullLastNameText,
          styles.landscapeLastNameText,
          isLandscape
        )}

        {this.renderItem(
          profile.name,
          styles.fullNameText,
          styles.landscapeNameText,
          isLandscape
        )}

        {pot.isSome(municipality) &&
          this.renderItem(
            fiscalCodeData.denominazione,
            styles.fullBirthPlaceText,
            styles.landscapeBirthPlaceText,
            isLandscape
          )}

        {fiscalCodeData.gender &&
          this.renderItem(
            fiscalCodeData.gender,
            styles.fullGenderText,
            styles.landscapeGender,
            isLandscape
          )}

        {pot.isSome(municipality) &&
          this.renderItem(
            fiscalCodeData.siglaProvincia,
            styles.fullBirthCityText,
            styles.landscapeBirthCityText,
            isLandscape
          )}

        {fiscalCodeData.birthDate &&
          this.renderItem(
            fiscalCodeData.birthDate,
            styles.fullDateText,
            styles.landscapeDateText,
            isLandscape
          )}
      </React.Fragment>
    );
  }

  private renderBarCode(fiscalCode: FiscalCode, isLandscape: boolean) {
    return isLandscape ? (
      <View style={styles.landscapeBarCode}>
        <Barcode
          value={fiscalCode}
          format={"CODE128"}
          background={"transparent"}
          height={barCodeHeightL - 5}
          width={(barCodeWidthL - 5) / 211} // 211= 16*11 + 35: number of characters in the fiscal code barcode with CODE128
        />
        <Text
          robotomono={true}
          bold={true}
          alignCenter={true}
          style={styles.landscapeFacSimile}
        >
          {I18n.t("profile.fiscalCode.facSimile")}
        </Text>
      </View>
    ) : (
      <View style={styles.fullBareCode}>
        <Barcode
          value={fiscalCode}
          format={"CODE128"}
          background={"transparent"}
          height={barCodeHeightF - 5}
          width={(barCodeWidthF - 5) / 211}
        />
        <Text
          robotomono={true}
          bold={true}
          alignCenter={true}
          style={styles.fullFacSimileText}
        >
          {I18n.t("profile.fiscalCode.facSimile")}
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
            this.props.municipality,
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
