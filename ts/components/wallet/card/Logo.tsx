/**
 * Component representing the appropriate
 * credit card logo based on its pan
 */
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { Wallet } from "../../../types/pagopa";
import { CreditCardType } from "../../../types/pagopa";

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

const cardMapIcon: { [key in string]: any } = {
  carta_mc: require("../../../../img/wallet/cards-icons/mastercard.png"),
  carta_visa: require("../../../../img/wallet/cards-icons/visa.png"),
  carta_amex: require("../../../../img/wallet/cards-icons/amex.png"),
  carta_diners: require("../../../../img/wallet/cards-icons/diners.png"),
  carta_visaelectron: require("../../../../img/wallet/cards-icons/visa-electron.png"),
  carta_poste: require("../../../../img/wallet/cards-icons/postepay.png")
};

/**
 * Return the base name of a remote resource from a give path
 * @param resourceUrl the remote resource Url
 */
const getImageNameFromUrl = (resourceUrl?: string): string | undefined => {
  if (!resourceUrl) return undefined;
  let splitted = resourceUrl.split("/");
  return splitted[splitted.length - 1].toLowerCase().split(".")[0];
};

// PagoPA's "brandLogo" field contains an url to an image
// From the given url it will check if there is a matching and an icon will be returned
// If there is NO matching a default card icon will be returned
// Consider to evaluate the field "brand" instead of "brandLogo"
// because it should be contain only the name of the credit card type
const getCardIconFromBrandLogo = (wallet: Wallet) => {
  let defaultCardIcon = require("../../../../img/wallet/cards-icons/unknown.png");
  let imageName = getImageNameFromUrl(wallet.creditCard.brandLogo);
  if (imageName && cardMapIcon[imageName]) return cardMapIcon[imageName];
  return defaultCardIcon;
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

const Logo: React.SFC<Props> = props => (
  <Image
    style={styles.issuerLogo}
    source={getCardIconFromBrandLogo(props.item)}
  />
);

export default Logo;
