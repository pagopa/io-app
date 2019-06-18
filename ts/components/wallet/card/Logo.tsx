/**
 * Component representing the appropriate
 * credit card logo based on its pan
 */
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { CreditCard } from "../../../types/pagopa";
import { CreditCardType } from "../../../types/pagopa";
import { getResourceNameFromUrl } from "../../../utils/url";

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

const defaultCardIcon = require("../../../../img/wallet/cards-icons/unknown.png");
/**
 * PagoPA's "brandLogo" field contains an url to an image
 * From the given url it will check if there is a matching and an icon will be returned
 * If there is NO matching a default card icon will be returned
 * Consider to evaluate the field "brand" instead of "brandLogo"
 * because it should contain only the name of the credit card type
 * for more info check https://www.pivotaltracker.com/story/show/165067615
 * @param creditcard the creditcard objects from which retrieve the icon
 */
const getCardIconFromBrandLogo = (creditcard: CreditCard) => {
  if (!creditcard.brandLogo) {
    return defaultCardIcon;
  }
  const imageName = getResourceNameFromUrl(creditcard.brandLogo);
  return imageName && cardMapIcon[imageName]
    ? cardMapIcon[imageName]
    : defaultCardIcon;
};

const styles = StyleSheet.create({
  issuerLogo: {
    width: "100%",
    height: "100%",
    resizeMode: "contain"
  }
});

type Props = Readonly<{
  item?: CreditCard;
}>;

const Logo: React.SFC<Props> = props => (
  <Image
    style={styles.issuerLogo}
    source={props.item ? getCardIconFromBrandLogo(props.item) : defaultCardIcon}
  />
);

export default Logo;
