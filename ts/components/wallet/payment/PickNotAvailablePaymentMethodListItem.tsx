import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { ImageSourcePropType } from "react-native";
import { connect } from "react-redux";
import pagoBancomatLogo from "../../../../img/wallet/cards-icons/pagobancomat.png";
import satispayLogo from "../../../../img/wallet/cards-icons/satispay.png";
import bancomatPayLogo from "../../../../img/wallet/payment-methods/bancomatpay-logo.png";
import I18n from "../../../i18n";
import { profileNameSurnameSelector } from "../../../store/reducers/profile";
import { GlobalState } from "../../../store/reducers/types";
import { getFavoriteWalletId } from "../../../store/reducers/wallet/wallets";
import { PaymentMethod } from "../../../types/pagopa";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { getPickPaymentMethodDescription } from "../../../utils/payment";
import { getPaypalAccountEmail } from "../../../utils/paypal";
import { VSpacer } from "../../core/spacer/Spacer";
import { H4 } from "../../core/typography/H4";
import { getCardIconFromBrandLogo } from "../card/Logo";
import { Icon } from "../../core/icons/Icon";
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
    <VSpacer size={24} />
    <H4 weight={"Regular"}>
      {I18n.t(
        "wallet.payWith.pickPaymentMethod.notAvailable.unaccepted.bottomSheetDescription"
      )}
    </H4>
    <VSpacer size={24} />
  </>
);

const paymentDisabledBottomSheetTitle = () =>
  I18n.t(
    "wallet.payWith.pickPaymentMethod.notAvailable.payment_disabled.bottomSheetTitle"
  );
const paymentDisabledBottomSheetBody = () => (
  <>
    <VSpacer size={24} />
    <H4 weight={"Regular"}>
      {I18n.t(
        "wallet.payWith.pickPaymentMethod.notAvailable.payment_disabled.bottomSheetDescription"
      )}
    </H4>
    <VSpacer size={24} />
  </>
);

const arrivingBottomSheetTitle = () =>
  I18n.t(
    "wallet.payWith.pickPaymentMethod.notAvailable.arriving.bottomSheetTitle"
  );
const arrivingBottomSheetBody = () => (
  <>
    <VSpacer size={24} />
    <H4 weight={"Regular"}>
      {I18n.t(
        "wallet.payWith.pickPaymentMethod.notAvailable.arriving.bottomSheetDescription"
      )}
    </H4>
    <VSpacer size={24} />
  </>
);

type PaymentMethodInformation = {
  logo: ImageSourcePropType;
  title: string;
  description: string;
  bottomSheetTitle: string;
  bottomSheetBody: JSX.Element;
  snapPoint?: number;
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
        bottomSheetTitle: paymentDisabledBottomSheetTitle(),
        bottomSheetBody: paymentDisabledBottomSheetBody(),
        snapPoint: 360
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
        bottomSheetTitle: paymentDisabledBottomSheetTitle(),
        bottomSheetBody: paymentDisabledBottomSheetBody(),
        snapPoint: 360
      };
    case "Satispay":
      return {
        logo: satispayLogo,
        title: paymentMethod.kind,
        description: nameSurname,
        bottomSheetTitle: arrivingBottomSheetTitle(),
        bottomSheetBody: arrivingBottomSheetBody()
      };
    case "PayPal":
      return {
        logo: paymentMethod.icon,
        title: paymentMethod.kind,
        description: getPaypalAccountEmail(paymentMethod.info),
        bottomSheetTitle: paymentDisabledBottomSheetTitle(),
        bottomSheetBody: paymentDisabledBottomSheetBody(),
        snapPoint: 360
      };
  }
};

const PickNotAvailablePaymentMethodListItem: React.FC<Props> = (
  props: Props
) => {
  const {
    logo,
    title,
    description,
    bottomSheetTitle,
    bottomSheetBody,
    snapPoint
  } = extractInfoFromPaymentMethod(
    props.paymentMethod,
    props.nameSurname ?? ""
  );

  const { present, bottomSheet } = useIOBottomSheetModal(
    bottomSheetBody,
    bottomSheetTitle,
    snapPoint ?? 300
  );
  return (
    <>
      {bottomSheet}
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
        rightElement={<Icon name="info" color="blue" size={24} />}
        onPress={present}
      />
    </>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  favoriteWalletId: getFavoriteWalletId(state),
  nameSurname: profileNameSurnameSelector(state)
});
export default connect(mapStateToProps)(PickNotAvailablePaymentMethodListItem);
