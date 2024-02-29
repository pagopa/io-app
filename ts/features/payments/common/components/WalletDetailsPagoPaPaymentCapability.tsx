import * as React from "react";
import { ListItemSwitch, IOToast } from "@pagopa/io-app-design-system";

import { hasPaymentFeature } from "../utils";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import I18n from "../../../../i18n";
import { useIODispatch } from "../../../../store/hooks";
import { walletDetailsPagoPaCapabilityToggle } from "../../details/store/actions";

type Props = { paymentMethod: WalletInfo };

/**
 * Represent the capability to pay in PagoPa of a payment method.
 * @param props
 */
const WalletDetailsPagoPaPaymentCapability: React.FC<Props> = props => {
  const dispatch = useIODispatch();
  const [loading, setLoading] = React.useState(false);

  const handleSwitchSuccess = () => {
    setLoading(false);
    IOToast.success(
      I18n.t("wallet.methods.card.pagoPaCapability.operationCompleted")
    );
  };

  const handleSwitchError = () => {
    setLoading(false);
    IOToast.error(
      I18n.t("wallet.methods.card.pagoPaCapability.operationError")
    );
  };

  const handleSwitchPagoPaCapability = () => {
    setLoading(true);
    dispatch(
      walletDetailsPagoPaCapabilityToggle.request({
        walletId: props.paymentMethod.walletId,
        onSuccess: handleSwitchSuccess,
        onFailure: handleSwitchError
      })
    );
  };

  return (
    <ListItemSwitch
      label={I18n.t("wallet.methods.card.pagoPaCapability.title")}
      description={I18n.t("wallet.methods.card.pagoPaCapability.description")}
      value={hasPaymentFeature(props.paymentMethod)}
      onSwitchValueChange={handleSwitchPagoPaCapability}
      isLoading={loading}
    />
  );
};

export default WalletDetailsPagoPaPaymentCapability;
