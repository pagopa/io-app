/**
 * A component to show a representation
 * of the fiscal code card of the user profile
 *
 * TODO:
 * - add shadow to component
 * - extract missing data from fiscal code
 */
import { Text, View } from "native-base";
import * as React from "react";
import { Dimensions, Image, StyleSheet } from "react-native";

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
const cardHeightF = 546 * fullScaleFactor;
const cardHeaderHeightF = 154 * fullScaleFactor;
const cardSpacerF = 16 * fullScaleFactor;
const cardLargeSpacerF = 24 * fullScaleFactor;
const cardLineHeightF = 26 * fullScaleFactor;
const textdLineHeightF = 15;
const textFontSizeF = 11;
const textLeftMarginF = 140 * fullScaleFactor + 6;

const fiscalCodeHeight = cardHeaderHeightF + cardLargeSpacerF;
const lastNameHeightFull =
  cardHeaderHeightF + cardLargeSpacerF + cardLineHeightF * 2 + cardSpacerF;
const nameHeightFull = lastNameHeightFull + cardLineHeightF + cardSpacerF;

// Landscape (vertical position)
const landscapeScaleFactor = contentWidth / 546;
const textLineHeightL = 28; // to solve misalignment on font, 28 is the fist value that seems to give text centered to line
const textLeftMarginL = 140 * landscapeScaleFactor + 8;
const cardHeaderHeightL = 154 * landscapeScaleFactor;
const cardSpacerL = 16 * landscapeScaleFactor;
const cardLargeSpacerL = 24 * landscapeScaleFactor;
const cardLineHeightL = 26 * landscapeScaleFactor;

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
    width: 870 * landscapeScaleFactor,
    height: contentWidth
  },

  landscapeCardRotation: {
    transform: [
      { rotateZ: "90deg" },
      { translateY: (870 * landscapeScaleFactor - contentWidth) / 2 }
    ],
    marginVertical: (870 * landscapeScaleFactor - contentWidth) / 2
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
    fontSize: 18,
    width: 870 * landscapeScaleFactor,
    paddingLeft: textLeftMarginL,
    lineHeight: textLineHeightL
  },

  fullFiscalCodeText: {
    lineHeight: cardLineHeightF * 2,
    marginTop: fiscalCodeHeight
  },

  landscapeFiscalCodeText: {
    transform: [
      { rotateZ: "90deg" },
      { translateY: -(2 * customVariables.contentPadding) + fiscalCodeHeightL },
      {
        translateX:
          (870 * landscapeScaleFactor - customVariables.contentPadding) / 2
      }
    ]
  },

  fullLastNameText: {
    lineHeight: textdLineHeightF,
    marginTop: lastNameHeightFull
  },

  landscapeLastNameText: {
    transform: [
      { rotateZ: "90deg" },
      { translateY: -(2 * customVariables.contentPadding) + lastNameHeightL },
      {
        translateX:
          (870 * landscapeScaleFactor - customVariables.contentPadding) / 2
      }
    ]
  },

  fulleNameText: {
    lineHeight: textdLineHeightF,
    marginTop: nameHeightFull
  },

  landscapeNameText: {
    transform: [
      { rotateZ: "90deg" },
      { translateY: -(2 * customVariables.contentPadding) + nameHeightL },
      {
        translateX:
          (870 * landscapeScaleFactor - customVariables.contentPadding) / 2
      }
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
            // TODO: renderBarcode if getCardBack
          )}
      </View>
    );
  }
}
