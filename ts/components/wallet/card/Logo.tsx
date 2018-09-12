/**
 * Component representing the appropriate
 * credit card logo based on its pan
 */
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { Wallet } from "../../../types/pagopa";
import { CreditCardType } from "../../../types/pagopa";

export enum LogoPosition {
  TOP,
  CENTER
}

export const shouldRenderLogo = (
  current: LogoPosition,
  requested?: LogoPosition
) => {
  return current === requested; // current position is the requested one
};

export const cardIcons: { [key in CreditCardType]: any } = {
  MASTERCARD: require("../../../../img/wallet/cards-icons/mastercard.png"),
  VISA: require("../../../../img/wallet/cards-icons/visa.png"),
  AMEX: require("../../../../img/wallet/cards-icons/amex.png"),
  DINERS: require("../../../../img/wallet/cards-icons/diners.png"),
  MAESTRO: require("../../../../img/wallet/cards-icons/maestro.png"),
  VISAELECTRON: require("../../../../img/wallet/cards-icons/visa-electron.png"),
  POSTEPAY: require("../../../../img/wallet/cards-icons/postepay.png"),
  UNIONPAY: require("../../../../img/wallet/cards-icons/unknown.png"),
  DISCOVER: require("../../../../img/wallet/cards-icons/unknown.png"),
  JCB: require("../../../../img/wallet/cards-icons/unknown.png"),
  UNKNOWN: require("../../../../img/wallet/cards-icons/unknown.png")
};

// PagoPA's "brandLogo" is not a string that
// allows for the identification of a logo,
// but rather a link to the card logo image
// As a temporary fix, the "unknown" card will be
// shown for all cards -- a future story will take
// care of switching the images to the actual logos
// @https://www.pivotaltracker.com/story/show/159651239
const getCardIcon = (_: Wallet) => {
  return require("../../../../img/wallet/cards-icons/unknown.png");
};

const styles = StyleSheet.create({
  issuerLogo: {
    width: "100%",
    height: "100%",
    resizeMode: "contain"
  }
});

type Props = Readonly<{
  item: Wallet;
}>;

export default class Logo extends React.Component<Props> {
  public render() {
    return (
      <Image style={styles.issuerLogo} source={getCardIcon(this.props.item)} />
    );
  }
}
