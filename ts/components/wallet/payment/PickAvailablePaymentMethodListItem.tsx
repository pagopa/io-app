import * as pot from "@pagopa/ts-commons/lib/pot";
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
import { getCardIconFromBrandLogo } from "../card/Logo";
import { Icon } from "../../core/icons/Icon";
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
        description: paymentMethod.info.numberObfuscated ?? ""
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

const PickAvailablePaymentMethodListItem: React.FC<Props> = (props: Props) => {
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
          <Icon name="chevronRightListItem" color="blue" size={24} />
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
export default connect(mapStateToProps)(PickAvailablePaymentMethodListItem);
