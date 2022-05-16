import * as React from "react";
import { connect } from "react-redux";
import * as pot from "italia-ts-commons/lib/pot";
import { ImageSourcePropType } from "react-native";
import { fromNullable } from "fp-ts/lib/Option";
import { GlobalState } from "../../../store/reducers/types";
import { profileNameSurnameSelector } from "../../../store/reducers/profile";
import { getFavoriteWalletId } from "../../../store/reducers/wallet/wallets";
import { PaymentMethod } from "../../../types/pagopa";
import pagoBancomatLogo from "../../../../img/wallet/cards-icons/pagobancomat.png";
import bancomatPayLogo from "../../../../img/wallet/payment-methods/bpay.png";
import satispayLogo from "../../../../img/wallet/cards-icons/satispay.png";
import paypalLogo from "../../../../img/wallet/payment-methods/paypal.png";
import IconFont from "../../ui/IconFont";
import { IOColors } from "../../core/variables/IOColors";
import { getPickPaymentMethodDescription } from "../../../utils/payment";
import { getCardIconFromBrandLogo } from "../card/Logo";
import I18n from "../../../i18n";
import PickPaymentMethodBaseListItem from "./PickPaymentMethodBaseListItem";

type Props = {
  isFirst: boolean;
  paymentMethod: PaymentMethod;
  rightElement?: JSX.Element;
  onPress?: () => void;
} & ReturnType<typeof mapStateToProps>;

type PaymentMethodInformation = {
  logo: ImageSourcePropType;
  title: string;
  description: string;
};

const extractInfoFromPaymentMethod = (
  paymentMethod: PaymentMethod,
  nameSurname: string
): PaymentMethodInformation => {
  switch (paymentMethod.kind) {
    case "CreditCard":
      return {
        logo: getCardIconFromBrandLogo(paymentMethod.info),
        title: paymentMethod.caption,
        description: getPickPaymentMethodDescription(paymentMethod, nameSurname)
      };
    case "Bancomat":
      return {
        logo: pagoBancomatLogo,
        title: paymentMethod.caption,
        description: getPickPaymentMethodDescription(paymentMethod, nameSurname)
      };
    case "BPay":
      return {
        logo: bancomatPayLogo,
        title: paymentMethod.caption,
        // phone number + bank name -> if both are defined
        // phone number -> if bank is not defined
        // bank -> if phone number is not defined
        // empty -> if both are not defined
        description: fromNullable(paymentMethod.info.numberObfuscated)
          .map(numb =>
            fromNullable(paymentMethod.info.bankName)
              .map(bn => `${numb} · ${bn}`)
              .getOrElse(numb)
          )
          .getOrElse(paymentMethod.info.bankName ?? "")
      };
    case "Satispay":
      return {
        logo: satispayLogo,
        title: paymentMethod.kind,
        description: nameSurname
      };
    case "PayPal":
      return {
        logo: paypalLogo,
        title: I18n.t("wallet.methods.paypal.name"),
        description: paymentMethod.caption
      };
    case "Privative":
      return {
        logo: paymentMethod.icon,
        title: paymentMethod.caption,
        description: getPickPaymentMethodDescription(paymentMethod, nameSurname)
      };
  }
};

const PickNotAvailablePaymentMethodListItem: React.FC<Props> = (
  props: Props
) => {
  const { logo, title, description } = extractInfoFromPaymentMethod(
    props.paymentMethod,
    props.nameSurname ?? ""
  );
  return (
    <PickPaymentMethodBaseListItem
      testID={`availableMethod-${props.paymentMethod.idWallet}`}
      isFirst={props.isFirst}
      isFavourite={
        pot.isSome(props.favoriteWalletId)
          ? props.favoriteWalletId.value === props.paymentMethod.idWallet
          : false
      }
      logo={logo}
      title={title}
      description={description}
      rightElement={
        props.rightElement ?? (
          <IconFont name={"io-right"} color={IOColors.blue} size={24} />
        )
      }
      onPress={props.onPress}
    />
  );
};

const mapStateToProps = (state: GlobalState) => ({
  favoriteWalletId: getFavoriteWalletId(state),
  nameSurname: profileNameSurnameSelector(state)
});
export default connect(mapStateToProps)(PickNotAvailablePaymentMethodListItem);
