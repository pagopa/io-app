import { Platform, StyleSheet } from "react-native";
import { makeFontStyleObject } from "../../../theme/fonts";
import variables from "../../../theme/variables";

export default StyleSheet.create({
  card: {
    // iOS and Andorid card shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 3,

    backgroundColor: variables.brandGray,
    borderRadius: 8,
    marginBottom: -1,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 20
  },
  cardInner: {
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 22
  },
  cardNumber: {
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  row: {
    flexDirection: "row"
  },
  spaced: {
    justifyContent: "space-between"
  },
  columns: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  topRightCornerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  cardLogo: {
    height: 30,
    width: 48
  },
  cardPsp: {
    alignSelf: "flex-end",
    width: 80,
    height: 32
  },
  pspLogo: {
    maxWidth: 80,
    maxHeight: 32,
    width: "100%",
    height: "100%",
    resizeMode: "contain"
  },
  footerButton: {
    borderRadius: 6,
    paddingRight: variables.fontSizeBase,
    justifyContent: "space-between",
    margin: 2
  },
  transactions: {
    backgroundColor: variables.colorWhite
  },
  transactionsText: {
    color: variables.brandPrimary
  },
  pickPayment: {
    backgroundColor: variables.brandPrimary
  },
  pickPaymentText: {
    color: variables.colorWhite
  },
  marginTop: {
    marginTop: variables.fontSizeBase
  },
  flatBottom: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  blueText: {
    color: variables.brandPrimary,
    textAlign: "center",
    ...makeFontStyleObject(Platform.select)
  },
  extraMarginTop: {
    marginTop: 50
  },
  paddedIcon: {
    paddingLeft: 10
  },
  paddedTop: {
    paddingTop: 10
  },
  numberArea: {
    borderWidth: 1,
    borderColor: "transparent",
    width: "82%"
  }
});
