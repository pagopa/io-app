import * as React from "react";
import { connect } from "react-redux";
import * as pot from "italia-ts-commons/lib/pot";
import { ImageSourcePropType } from "react-native";
import { GlobalState } from "../../../store/reducers/types";
import { profileNameSurnameSelector } from "../../../store/reducers/profile";
import { getFavoriteWalletId } from "../../../store/reducers/wallet/wallets";
import { PaymentMethod } from "../../../types/pagopa";
import pagoBancomatLogo from "../../../../img/wallet/cards-icons/pagobancomat.png";
import bancomatPayLogo from "../../../../img/wallet/payment-methods/bancomatpay-logo.png";
import satispayLogo from "../../../../img/wallet/cards-icons/satispay.png";
import IconFont from "../../ui/IconFont";
import { IOColors } from "../../core/variables/IOColors";
import { getCardIconFromBrandLogo } from "../card/Logo";
import PickPaymentMethodBaseListItem from "./PickPaymentMethodBaseListItem";
import { getBancomatOrCreditCardPickMethodDescription } from "../../../utils/payment";

type Props = {
  isFirst: boolean;
  paymentMethod: PaymentMethod;
  onPress: () => void;
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
        description: getBancomatOrCreditCardPickMethodDescription(paymentMethod)
      };
    case "Bancomat":
      return {
        logo: pagoBancomatLogo,
        title: paymentMethod.kind,
        description: getBancomatOrCreditCardPickMethodDescription(paymentMethod)
      };
    case "BPay":
      return {
        logo: bancomatPayLogo,
        title: paymentMethod.kind,
        description: paymentMethod.info.numberObfuscated ?? ""
      };
    case "Satispay":
      return {
        logo: satispayLogo,
        title: paymentMethod.kind,
        description: nameSurname
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
        <IconFont name={"io-right"} color={IOColors.blue} size={24} />
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
