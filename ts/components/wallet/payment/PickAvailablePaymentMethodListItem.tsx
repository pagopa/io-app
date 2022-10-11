import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { ImageSourcePropType } from "react-native";
import { connect } from "react-redux";
import pagoBancomatLogo from "../../../../img/wallet/cards-icons/pagobancomat.png";
import satispayLogo from "../../../../img/wallet/cards-icons/satispay.png";
import bancomatPayLogo from "../../../../img/wallet/payment-methods/bpay.png";
import paypalLogo from "../../../../img/wallet/payment-methods/paypal.png";
import I18n from "../../../i18n";
import { profileNameSurnameSelector } from "../../../store/reducers/profile";
import { GlobalState } from "../../../store/reducers/types";
import { getFavoriteWalletId } from "../../../store/reducers/wallet/wallets";
import { PaymentMethod } from "../../../types/pagopa";
import { getPickPaymentMethodDescription } from "../../../utils/payment";
import { IOColors } from "../../core/variables/IOColors";
import IconFont from "../../ui/IconFont";
import { getCardIconFromBrandLogo } from "../card/Logo";
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
        description: pipe(
          paymentMethod.info.numberObfuscated,
          O.fromNullable,
          O.map(numb =>
            pipe(
              paymentMethod.info.bankName,
              O.fromNullable,
              O.map(bn => `${numb} · ${bn}`),
              O.getOrElse(() => numb)
            )
          ),
          O.getOrElse(() => paymentMethod.info.bankName ?? "")
        )
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
