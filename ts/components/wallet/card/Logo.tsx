/**
 * Component representing the appropriate
 * credit card logo based on its pan
 */
import * as React from "react";
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native";
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
  UNIONPAY: require("../../../../img/wallet/cards-icons/unionpay.png"),
  DISCOVER: require("../../../../img/wallet/cards-icons/discover.png"),
  JCB: require("../../../../img/wallet/cards-icons/jcb.png"),
  JCB15: require("../../../../img/wallet/cards-icons/jcb.png"),
  UNKNOWN: require("../../../../img/wallet/cards-icons/unknown.png")
};

const cardMapIcon: { [key in string]: any } = {
  carta_mc: require("../../../../img/wallet/cards-icons/mastercard.png"),
  carta_visa: require("../../../../img/wallet/cards-icons/visa.png"),
  carta_amex: require("../../../../img/wallet/cards-icons/amex.png"),
  carta_diners: require("../../../../img/wallet/cards-icons/diners.png"),
  carta_visaelectron: require("../../../../img/wallet/cards-icons/visa-electron.png"),
  carta_poste: require("../../../../img/wallet/cards-icons/postepay.png"),
  carta_maestro: require("../../../../img/wallet/cards-icons/maestro.png"),
  carta_vpay: require("../../../../img/wallet/cards-icons/vPay.png")
};

import defaultCardIcon from "../../../../img/wallet/cards-icons/unknown.png";
import { CardInfo } from "../../../../definitions/pagopa/walletv2/CardInfo";
/**
 * pagoPA's "brandLogo" field contains an url to an image
 * From the given url it will check if there is a matching and an icon will be returned
 * If there is NO matching a default card icon will be returned
 * Consider to evaluate the field "brand" instead of "brandLogo"
 * because it should contain only the name of the credit card type
 * @param cardInfo
 */
export const getCardIconFromBrandLogo = (cardInfo: CardInfo) => {
  if (!cardInfo.brandLogo) {
    return defaultCardIcon;
  }
  const imageName = getResourceNameFromUrl(cardInfo.brandLogo);
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
  item?: CardInfo;
  imageStyle?: StyleProp<ImageStyle>;
  pspLogo?: string;
}>;

const Logo: React.SFC<Props> = props => {
  const getSource = () => {
    if (props.pspLogo && props.pspLogo.trim().length > 0) {
      return { uri: props.pspLogo };
    }

    if (props.item) {
      return getCardIconFromBrandLogo(props.item);
    }
    return defaultCardIcon;
  };

  return (
    <Image
      style={props.imageStyle ? props.imageStyle : styles.issuerLogo}
      source={getSource()}
    />
  );
};

export default Logo;
