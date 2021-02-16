import * as React from "react";
import { connect } from "react-redux";
import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { ImageSourcePropType } from "react-native";
import { GlobalState } from "../../../store/reducers/types";
import { profileNameSurnameSelector } from "../../../store/reducers/profile";
import { getFavoriteWalletId } from "../../../store/reducers/wallet/wallets";
import {
  BancomatPaymentMethod,
  CreditCardPaymentMethod,
  PaymentMethod
} from "../../../types/pagopa";
import pagoBancomatLogo from "../../../../img/wallet/cards-icons/pagobancomat.png";
import bancomatPayLogo from "../../../../img/wallet/payment-methods/bancomatpay-logo.png";
import satispayLogo from "../../../../img/wallet/cards-icons/satispay.png";
import IconFont from "../../ui/IconFont";
import I18n from "../../../i18n";
import { localeDateFormat } from "../../../utils/locale";
import { IOColors } from "../../core/variables/IOColors";
import { getCardIconFromBrandLogo } from "../card/Logo";
import PickPaymentMethodBaseListItem from "./PickPaymentMethodBaseListItem";

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

const getTranslatedExpireDate = (
  fullYear?: string,
  month?: string
): string | undefined => {
  if (!fullYear || !month) {
    return undefined;
  }
  const year = parseInt(fullYear, 10);
  const indexedMonth = parseInt(month, 10);
  if (isNaN(year) || isNaN(indexedMonth)) {
    return undefined;
  }
  return localeDateFormat(
    new Date(year, indexedMonth - 1),
    I18n.t("global.dateFormats.shortNumericMonthYear")
  );
};

const getBancomatOrCreditCardDescription = (
  bancomatOrCreditCard: CreditCardPaymentMethod | BancomatPaymentMethod
) => {
  const translatedExpiryDate = getTranslatedExpireDate(
    bancomatOrCreditCard.info.expireYear,
    bancomatOrCreditCard.info.expireMonth
  );
  return translatedExpiryDate
    ? I18n.t("wallet.payWith.pickPaymentMethod.description", {
        firstElement: translatedExpiryDate,
        secondElement: bancomatOrCreditCard.info.holder
      })
    : fromNullable(bancomatOrCreditCard.info.holder).getOrElse("");
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
        description: getBancomatOrCreditCardDescription(paymentMethod)
      };
    case "Bancomat":
      return {
        logo: pagoBancomatLogo,
        title: paymentMethod.kind,
        description: getBancomatOrCreditCardDescription(paymentMethod)
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
