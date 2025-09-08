import { Alert } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import { useIOSelector } from "../../../../store/hooks";
import { isIdPayEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { isPaymentMethodExpired } from "../../common/utils";
import PaymentMethodInitiatives from "./WalletDetailsPaymentMethodInitiatives";
import PaymentMethodSettings from "./WalletDetailsPaymentMethodSettings";

type Props = { paymentMethod: WalletInfo };

/**
 * Display the features available for a payment method:
 * - vertical initiatives (eg: cashback, fa)
 * - global settings (payment capability, favourite, etc.)
 */
const WalletDetailsPaymentMethodFeatures = ({ paymentMethod }: Props) => {
  const isMethodExpired = isPaymentMethodExpired(paymentMethod.details);
  const isIdpayEnabled = useIOSelector(isIdPayEnabledSelector);

  if (isMethodExpired) {
    return (
      <Alert variant="error" content={I18n.t("wallet.methodDetails.expired")} />
    );
  }

  return (
    <>
      {isIdpayEnabled ? (
        <PaymentMethodInitiatives paymentMethod={paymentMethod} />
      ) : null}
      <PaymentMethodSettings paymentMethod={paymentMethod} />
    </>
  );
};

export default WalletDetailsPaymentMethodFeatures;
