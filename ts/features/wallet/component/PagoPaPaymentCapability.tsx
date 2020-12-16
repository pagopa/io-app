import { fromNullable, isNone } from "fp-ts/lib/Option";
import { Badge, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { H4 } from "../../../components/core/typography/H4";
import { H5 } from "../../../components/core/typography/H5";
import { IOColors } from "../../../components/core/variables/IOColors";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import I18n from "../../../i18n";
import { CreditCardType, PaymentMethod } from "../../../types/pagopa";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  left: {
    ...IOStyles.flex,
    paddingRight: 8
  },
  badgeInfo: {
    borderWidth: 1,
    borderStyle: "solid",
    height: 25,
    flexDirection: "row"
  },
  badgeAvailable: {
    backgroundColor: IOColors.blue,
    borderColor: IOColors.blue,
    width: 65
  },
  badgeArriving: {
    backgroundColor: IOColors.white,
    borderColor: IOColors.blue,
    width: 65
  },
  badgeNotAvailable: {
    backgroundColor: IOColors.white,
    borderColor: IOColors.blue,
    width: 130
  }
});

type Props = { paymentMethod: PaymentMethod };

type badgeType = "available" | "arriving" | "not_available";

const getLocales = () => ({
  available: I18n.t("wallet.methods.card.pagoPaCapability.active"),
  arriving: I18n.t("wallet.methods.card.pagoPaCapability.arriving"),
  incompatible: I18n.t("wallet.methods.card.pagoPaCapability.incompatible")
});

const availabilityBadge = (badgeType: badgeType) => {
  const { available, arriving, incompatible } = getLocales();
  switch (badgeType) {
    case "available":
      return (
        <Badge style={[styles.badgeInfo, styles.badgeAvailable]}>
          <H5 color="white">{available}</H5>
        </Badge>
      );
    case "arriving":
      return (
        <Badge style={[styles.badgeInfo, styles.badgeArriving]}>
          <H5 color="blue">{arriving}</H5>
        </Badge>
      );
    case "not_available":
      return (
        <Badge style={[styles.badgeNotAvailable, styles.badgeInfo]}>
          <H5 color="blue">{incompatible}</H5>
        </Badge>
      );
  }
};

const extractBadgeType = (paymentMethod: PaymentMethod): badgeType => {
  const badgeType = fromNullable(paymentMethod).map<badgeType>(pM => {
    switch (pM.kind) {
      case "CreditCard":
        return CreditCardType.decode(pM.info.brand).fold(
          () => "not_available",
          b => (b === "MAESTRO" ? "arriving" : "available")
        );
      case "Satispay":
        return "arriving";
      default:
        return "not_available";
    }
  });
  return isNone(badgeType) ? "not_available" : badgeType.value;
};
/**
 * Represent the capability to pay in PagoPa of a payment method.
 *
 * We have 3 possible different cases:
 *   - The card can pay on IO -> pagoPa === true and if is a credit card must be different from MAESTRO
 *   - The card in the future can pay on IO -> Satispay, MAESTRO
 *   - The card is not abilitated to pay on IO
 * @param props
 */
const PagoPaPaymentCapability: React.FunctionComponent<Props> = props => (
  <View style={styles.row}>
    <View style={styles.left}>
      <H4 weight={"SemiBold"} color={"bluegreyDark"}>
        {I18n.t("wallet.methods.card.pagoPaCapability.title")}
      </H4>
      <H5 color={"bluegrey"}>
        {I18n.t("wallet.methods.card.pagoPaCapability.description")}
      </H5>
    </View>
    {availabilityBadge(extractBadgeType(props.paymentMethod))}
  </View>
);

export default PagoPaPaymentCapability;
