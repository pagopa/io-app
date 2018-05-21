/**
 * Common styles used across the components
 */

import { StyleSheet } from "react-native";

import color from "color";
import variables from "../../theme/variables";

// TODO: when all the required screens are added,
// this style will be refactored to get rid of useless
// styles and aggregate repeated ones to improve
// readability and maintenability
export const WalletStyles = StyleSheet.create({
  header: {
    backgroundColor: variables.brandDarkGray
  },
  white: {
    color: variables.brandPrimaryInverted
  },
  addCardItem: {
    borderBottomWidth: variables.headerBorderBottomWidth,
    marginTop: 5,
    marginRight: 5,
    marginLeft: 5
  },
  addCardBoldedBorderItem: {
    borderBottomWidth: variables.borderRadiusBase,
    borderBottomColor: variables.brandDarkGray,
    marginRight: 5,
    marginLeft: 5
  },
  addCardBordedItem: {
    borderBottomWidth: 1,
    marginRight: 5,
    marginLeft: 5
  },
  addCardLastItem: {
    borderBottomWidth: variables.modalMargin,
    marginRight: 5,
    marginLeft: 5,
    marginBottom: 30
  },
  addCardIcon: {
    marginTop: 3,
    marginRight: 3,
    marginBottom: 3
  },
  addCardImage: {
    width: 60,
    height: 45,
    resizeMode: "contain",
    margin: 5
  },
  addCardfooterButtons: {
    borderBottomWidth: 0,
    marginRight: 5,
    marginLeft: 5,
    marginTop: 15,
    marginBottom: 30
  },
  standardText: {
    fontFamily: variables.fontFamily,
    color: variables.brandGray
  },
  payLayoutTitle: {
    fontFamily: variables.fontFamily,
    fontSize: variables.fontSize6,
    color: variables.brandGray
  },
  payLayoutSubtitleLeft: {
    fontFamily: variables.fontFamily,
    fontWeight: "bold",
    fontSize: variables.fontSize4,
    color: variables.brandGray
  },

  textBold: {
    fontFamily: variables.fontFamily,
    fontWeight: "bold"
  },
  whyLink: {
    fontFamily: variables.fontFamily,
    fontWeight: "bold",
    color: variables.textLinkColor
  },
  backContent: {
    backgroundColor: variables.brandDarkGray
  },
  whiteContent: {
    backgroundColor: variables.brandGray,
    flex: 1
  },
  pfImage: {
    height: "100%",
    width: "100%",
    resizeMode: "contain"
  },
  pfCards: {
    // temporary -- will be updated with actual component in future version
    height: 120,
    marginLeft: -200,
    resizeMode: "contain"
  },
  pfTabCard: {
    // temporary
    height: 120,
    marginLeft: -170,
    resizeMode: "contain"
  },
  pfSingle: {
    // temporary
    height: 60,
    marginLeft: -190,
    marginTop: 45,
    resizeMode: "contain"
  },
  titleStyle: {
    fontFamily: variables.fontFamily,
    fontWeight: "bold",
    color: color(variables.colorWhite)
      .darken(0.38)
      .string()
  },
  boldStyle: {
    fontFamily: variables.fontFamily,
    fontWeight: "bold"
  },
  container: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "transparent"
  },
  image: {
    height: 150,
    marginLeft: -120,
    resizeMode: "contain"
  },
  payList: {
    padding: 0,
    margin: 0
  },
  payListItem: {
    marginLeft: 0,
    flex: 1,
    paddingRight: 0
  },
  payCancelButton: {
    backgroundColor: variables.brandDarkGray,
    marginTop: 5
  },
  payCancelButtonText: {
    color: variables.brandPrimaryInverted
  },
  payBoldStyle: {
    fontFamily: variables.fontFamily,
    fontWeight: "bold"
  },
  payLightStyle: {
    fontFamily: variables.fontFamily,
    fontSize: variables.fontSize1,
    color: color(variables.colorWhite)
      .darken(0.38)
      .string()
  },
  linkStyle: {
    marginTop: 20,
    marginBottom: 40,
    marginLeft: 10,
    marginRight: 10,
    fontFamily: variables.fontFamily,
    fontWeight: "bold",
    color: variables.textLinkColor
  },
  addPaymentMethodButton: {
    borderColor: variables.brandGray
  },
  addPaymentMethodText: {
    fontWeight: "bold",
    color: variables.brandGray
  },
  topContainer: {
    backgroundColor: variables.brandDarkGray
  },
  newIconStyle: {
    marginTop: 6,
    fontSize: variables.fontSize1,
    color: variables.brandPrimary
  }
});
