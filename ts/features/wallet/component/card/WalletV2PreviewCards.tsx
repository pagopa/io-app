import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../store/reducers/types";
import { paymentMethodListVisibleInWalletSelector } from "../../../../store/reducers/wallet/wallets";
import { PaymentMethod } from "../../../../types/pagopa";
import { isCobadge } from "../../../../utils/paymentMethodCapabilities";
import BancomatWalletPreview from "../../bancomat/component/BancomatWalletPreview";
import BPayWalletPreview from "../../bancomatpay/component/BPayWalletPreview";
import CobadgeWalletPreview from "../../cobadge/component/CobadgeWalletPreview";
import CreditCardWalletPreview from "../../creditCard/component/CreditCardWalletPreview";
import PrivativeWalletPreview from "../../privative/component/PrivativeWalletPreview";
import SatispayWalletPreview from "../../satispay/SatispayWalletPreview";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const paymentMethodPreview = (pm: PaymentMethod): React.ReactElement | null => {
  switch (pm.kind) {
    case "Satispay":
      return <SatispayWalletPreview key={pm.idWallet} satispay={pm} />;
    case "Bancomat":
      return <BancomatWalletPreview key={pm.idWallet} bancomat={pm} />;
    case "CreditCard":
      // We should distinguish between a plain credit card and a cobadge credit card.
      // Unfortunately, the cobadge card doesn't have a own type but is a CreditCard that has an issuerAbiCode
      return isCobadge(pm) ? (
        <CobadgeWalletPreview key={pm.idWallet} cobadge={pm} />
      ) : (
        <CreditCardWalletPreview key={pm.idWallet} creditCard={pm} />
      );
    case "BPay":
      return <BPayWalletPreview key={pm.idWallet} bPay={pm} />;
    case "Privative":
      return <PrivativeWalletPreview key={pm.idWallet} privative={pm} />;
  }
};

/**
 * The new wallet preview that renders all the new v2 methods as folded card preview
 * @constructor
 */
const WalletV2PreviewCards: React.FunctionComponent<Props> = props => (
  <>
    {pot.toUndefined(
      pot.mapNullable(props.paymentMethods, pm => (
        <>{pm.map(paymentMethodPreview)}</>
      ))
    )}
  </>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  paymentMethods: paymentMethodListVisibleInWalletSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletV2PreviewCards);
