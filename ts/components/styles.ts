/**
 * Common styles used across the components
 */

import { NativeModules, Platform, StyleSheet } from "react-native";

const { StatusBarManager } = NativeModules;

const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 20 : StatusBarManager.HEIGHT;

import variables from "../theme/variables";

// Due to a bug, the following style must be wrapped
// with a call to StyleSheet.flatten()
// https://github.com/shoutem/ui/issues/51

export const CommonStyles = StyleSheet.create({
  fullContainer: {
    marginTop: STATUSBAR_HEIGHT,
    backgroundColor: variables.brandGray
  },
  errorContainer: {
    padding: 5,
    backgroundColor: "#F23333",
    borderRadius: 4,
    color: "#eee",
    fontSize: 15
  }
});

export const ProfileStyles = StyleSheet.create({
  profileHeader: { backgroundColor: "#0066CC" },
  profileHeaderText: { fontSize: 22, color: "#fff" },
  profileRow: { flexDirection: "row", alignItems: "center" },
  profileRowIcon: { marginLeft: 10, fontSize: 13, color: "#b2d0ed" },
  profileRowText: { fontSize: 15, color: "#b2d0ed" },
  preferenceHeaderText: {
    fontWeight: "bold",
    color: "#555",
    fontSize: 15,
    marginTop: 10
  },
  listItem: { color: "#06C", fontWeight: "bold", marginLeft: 20 },
  version: { textAlign: "right" }
});

export const PortfolioStyles = StyleSheet.create({
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
  pfText: {
    fontFamily: variables.fontFamily,
    color: variables.brandGray
  },
  pftitle: {
    fontFamily: variables.fontFamily,
    fontSize: 30,
    color: variables.brandGray
  },
  pfSubtitleLeft: {
    fontFamily: variables.fontFamily,
    fontWeight: "bold",
    fontSize: 18,
    color: variables.brandGray
  },

  pfbold: {
    fontFamily: variables.fontFamily,
    fontWeight: "bold"
  },
  pfwhy: {
    fontFamily: variables.fontFamily,
    fontWeight: "bold",
    color: "#3a3bfa"
  },
  pfback: {
    backgroundColor: variables.brandDarkGray
  },
  pfwhite: {
    backgroundColor: variables.brandGray,
    flex: 1
  },
  pfImage: {
    height: "100%",
    width: "100%",
    resizeMode: "contain"
  },
  pfcards: {
    height: 120,
    marginLeft: -200,
    resizeMode: "contain"
  },
  pftabcard: {
    height: 120,
    marginLeft: -170,
    resizeMode: "contain"
  },
  pfsingle: {
    height: 60,
    marginLeft: -190,
    marginTop: 45,
    resizeMode: "contain"
  },
  titleStyle: {
    fontFamily: variables.fontFamily,
    fontWeight: "bold",
    color: "rgb(150,150,150)"
  },
  boldStyle: {
    fontFamily: variables.fontFamily,
    fontWeight: "bold"
  },
  container: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0)"
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
    fontSize: 12,
    color: "rgb(166, 166, 166)"
  },
  linkStyle: {
    marginTop: 20,
    marginBottom: 40,
    marginLeft: 10,
    marginRight: 10,
    fontFamily: variables.fontFamily,
    fontWeight: "bold",
    color: "rgb(0, 0, 255)"
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
  }
});

export const CreditCardStyle = StyleSheet.create({
  largeTextStyle: {
    fontSize: variables.fontSize4,
    fontFamily: "Roboto Mono"
  },
  rowStyle: {
    alignItems: "center"
  },
  textStyle: {
    marginLeft: 15,
    color: "rgb(13, 37, 62)",
    fontFamily: variables.fontFamily
  },
  cardStyle: {
    backgroundColor: "rgb(242,242,242)",
    borderRadius: 10,
    marginTop: 10,
    height: 200
  },
  smallTextStyle: {
    fontSize: variables.fontSize2,
    color: "rgb(70,92,113)"
  },
  iconStyle: {
    fontSize: variables.fontSize5,
    color: variables.brandPrimary,
    paddingLeft: 10
  },
  whiteBarStyle: {
    borderWidth: 0,
    borderBottomColor: "white",
    borderBottomWidth: 2,
    paddingBottom: 15,
    width: "100%"
  },
  issuerLogo: {
    width: "100%",
    resizeMode: "contain"
  }
});
