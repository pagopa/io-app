import { View } from "native-base";
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
import { useIOBottomSheet } from "../../../utils/bottomSheet";
import { H4 } from "../../core/typography/H4";
import IconFont from "../../ui/IconFont";
import I18n from "../../../i18n";
import { IOColors } from "../../core/variables/IOColors";
import { getCardIconFromBrandLogo } from "../card/Logo";
import { getPickPaymentMethodDescription } from "../../../utils/payment";
import PickPaymentMethodBaseListItem from "./PickPaymentMethodBaseListItem";

type Props = {
  isFirst: boolean;
  paymentMethod: PaymentMethod;
} & ReturnType<typeof mapStateToProps>;

const unacceptedBottomSheetTitle = () =>
  I18n.t(
    "wallet.payWith.pickPaymentMethod.notAvailable.unaccepted.bottomSheetTitle"
  );
const unacceptedBottomSheetBody = () => (
  <>
    <View spacer={true} large={true} />
    <H4 weight={"Regular"}>
      {I18n.t(
        "wallet.payWith.pickPaymentMethod.notAvailable.unaccepted.bottomSheetDescription"
      )}
    </H4>
    <View spacer={true} large={true} />
  </>
);

const arrivingBottomSheetTitle = () =>
  I18n.t(
    "wallet.payWith.pickPaymentMethod.notAvailable.arriving.bottomSheetTitle"
  );
const arrivingBottomSheetBody = () => (
  <>
    <View spacer={true} large={true} />
    <H4 weight={"Regular"}>
      {I18n.t(
        "wallet.payWith.pickPaymentMethod.notAvailable.arriving.bottomSheetDescription"
      )}
    </H4>
    <View spacer={true} large={true} />
  </>
);

type PaymentMethodInformation = {
  logo: ImageSourcePropType;
  title: string;
  description: string;
  bottomSheetTitle: string;
  bottomSheetBody: JSX.Element;
};

const extractInfoFromPaymentMethod = (
  paymentMethod: PaymentMethod,
  nameSurname: string
): PaymentMethodInformation => {
  switch (paymentMethod.kind) {
    case "CreditCard":
      // The only paymentMethod of kind "CreditCard" that will be render in this component
      // will be the co-badge cards.
      return {
        logo: getCardIconFromBrandLogo(paymentMethod.info),
        title: paymentMethod.caption,
        description: getPickPaymentMethodDescription(
          paymentMethod,
          nameSurname
        ),
        bottomSheetTitle: unacceptedBottomSheetTitle(),
        bottomSheetBody: unacceptedBottomSheetBody()
      };
    case "Bancomat":
      return {
        logo: pagoBancomatLogo,
        title: paymentMethod.caption,
        description: getPickPaymentMethodDescription(
          paymentMethod,
          nameSurname
        ),
        bottomSheetTitle: unacceptedBottomSheetTitle(),
        bottomSheetBody: unacceptedBottomSheetBody()
      };
    case "BPay":
      return {
        logo: bancomatPayLogo,
        title: paymentMethod.caption,
        description: paymentMethod.info.numberObfuscated ?? "",
        bottomSheetTitle: arrivingBottomSheetTitle(),
        bottomSheetBody: arrivingBottomSheetBody()
      };
    case "Satispay":
      return {
        logo: satispayLogo,
        title: paymentMethod.kind,
        description: nameSurname,
        bottomSheetTitle: arrivingBottomSheetTitle(),
        bottomSheetBody: arrivingBottomSheetBody()
      };
    case "Privative":
      return {
        logo: paymentMethod.icon,
        title: paymentMethod.caption,
        description: getPickPaymentMethodDescription(
          paymentMethod,
          nameSurname
        ),
        bottomSheetTitle: unacceptedBottomSheetTitle(),
        bottomSheetBody: unacceptedBottomSheetBody()
      };
  }
};

const PickNotAvailablePaymentMethodListItem: React.FC<Props> = (
  props: Props
) => {
  const { logo, title, description, bottomSheetTitle, bottomSheetBody } =
    extractInfoFromPaymentMethod(props.paymentMethod, props.nameSurname ?? "");

  const { present } = useIOBottomSheet(bottomSheetBody, bottomSheetTitle, 300);
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
        <IconFont name={"io-info"} color={IOColors.blue} size={24} />
      }
      onPress={present}
    />
  );
};

const mapStateToProps = (state: GlobalState) => ({
  favoriteWalletId: getFavoriteWalletId(state),
  nameSurname: profileNameSurnameSelector(state)
});
export default connect(mapStateToProps)(PickNotAvailablePaymentMethodListItem);
