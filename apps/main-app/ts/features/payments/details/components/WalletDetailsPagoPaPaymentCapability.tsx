import { IOToast, ListItemSwitch } from "@pagopa/io-app-design-system";

import { FC, useState } from "react";
import I18n from "i18next";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import { useIODispatch } from "../../../../store/hooks";
import { hasPaymentFeature } from "../../common/utils";
import { paymentsTogglePagoPaCapabilityAction } from "../../details/store/actions";

type Props = { paymentMethod: WalletInfo };

/**
 * Represent the capability to pay in PagoPa of a payment method.
 * @param props
 */
const WalletDetailsPagoPaPaymentCapability: FC<Props> = props => {
  const dispatch = useIODispatch();
  const [loading, setLoading] = useState(false);

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
      paymentsTogglePagoPaCapabilityAction.request({
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
