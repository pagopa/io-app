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
// @https://www.pivotaltracker.com/story/show/157769361
export const WalletStyles = StyleSheet.create({
  header: {
    backgroundColor: variables.brandDarkGray
  },
  white: {
    color: variables.brandPrimaryInverted
  },

  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: variables.brandGray
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
    color: variables.brandGray
  },
  payLayoutTitle: {
    fontSize: variables.fontSize6,
    color: variables.brandGray
  },
  payLayoutSubtitleLeft: {
    fontWeight: "bold",
    fontSize: variables.fontSize4,
    color: variables.brandGray
  },
  whyLink: {
    fontWeight: "bold",
    color: variables.textLinkColor
  },
  backContent: {
    backgroundColor: variables.brandDarkGray
  },
  whiteContent: {
    backgroundColor: variables.colorWhite,
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
    bottom: -10,
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
    fontWeight: "bold",
    color: color(variables.colorWhite)
      .darken(0.38)
      .string()
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
  },
  paddedLR: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: variables.brandGray
  },
  textRight: {
    textAlign: "right"
  },
  textCenter: {
    textAlign: "center"
  },
  walletBannerText: {
    height: 50,
    alignItems: "flex-end",
    flexDirection: "row"
  }
});
