/**
 * A component to show a representation
 * of the fiscal code card of the user profile
 */
import { Text, View } from "native-base";
import * as React from "react";
import { Dimensions, Image, StyleSheet } from "react-native";

import { UserProfile } from "../../definitions/backend/UserProfile";
import customVariables from "../theme/variables";

type Props = {
  profile: UserProfile;
};

// fiscal card fac-simile dimensions: 546 x 870
const cardWidth2 =
  Dimensions.get("screen").width - 2 * customVariables.contentPadding;
const scaleFactor = cardWidth2 / 870;

const cardHeigth2 = 546 * scaleFactor;
const cardHeaderHeight = 155 * scaleFactor;
const cardSpacer = 16 * scaleFactor;
const cardLargeSpacer = 24 * scaleFactor;
const cardLineHeight = 26 * scaleFactor;
const textdLineHeight = 15;
const textFontSize = 11;
const textLeftMargin = 140 * scaleFactor + 6;


const styles = StyleSheet.create({
  cardBackground: {
    resizeMode: "contain",
    height: cardHeigth2,
    width: cardWidth2
  },
  text: {
    position: "absolute",
    fontSize: textFontSize,
    marginLeft: textLeftMargin,
    color: customVariables.brandDarkestGray
  }
});

export default class FiscalCodeComponent extends React.Component<Props> {
  public render(): React.ReactNode {
    return (
      <View>
        <Image
          source={require("./../../img/fiscalCode/fiscalCodeFront.png")}
          style={styles.cardBackground}
        />

        <Text
          bold={true}
          style={[
            styles.text,
            {
              lineHeight: cardLineHeight * 2,
              marginTop: cardHeaderHeight + cardLargeSpacer
            }
          ]}
        >
          {this.props.profile.fiscal_code.toUpperCase()}
        </Text>

        <Text
          bold={true}
          style={[
            styles.text,
            {
              lineHeight: textdLineHeight,
              marginTop:
                cardHeaderHeight +
                cardLargeSpacer +
                cardLineHeight * 2 +
                cardSpacer
            }
          ]}
        >
          {this.props.profile.family_name.toUpperCase()}
        </Text>

        <Text
          bold={true}
          style={[
            styles.text,
            {
              lineHeight: textdLineHeight,
              marginTop:
                cardHeaderHeight +
                cardLargeSpacer +
                cardLineHeight * 2 +
                cardSpacer +
                cardLineHeight +
                cardSpacer
            }
          ]}
        >
          {this.props.profile.name.toUpperCase()}
        </Text>
      </View>
    );
  }
}
