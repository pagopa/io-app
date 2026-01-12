import { FooterActions } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { isPaymentMethodExpired } from "../../common/utils";
import { useWalletOnboardingWebView } from "../../onboarding/hooks/useWalletOnboardingWebView";
import { PaymentsOnboardingRoutes } from "../../onboarding/navigation/routes";

type PaymentsDetailsDeleteMethodButtonProps = {
  paymentMethod?: WalletInfo;
};

const PaymentsMethodDetailsUpdateDataButton = ({
  paymentMethod
}: PaymentsDetailsDeleteMethodButtonProps) => {
  const navigation = useIONavigation();

  const { startOnboarding } = useWalletOnboardingWebView({
    onOnboardingOutcome: ({ outcome, walletId }) => {
      navigation.replace(
        PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_NAVIGATOR,
        {
          screen: PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_RESULT_FEEDBACK,
          params: {
            outcome,
            walletId
          }
        }
      );
    }
  });

  const handleUpdatePress = () => {
    if (paymentMethod?.paymentMethodId) {
      startOnboarding(paymentMethod.paymentMethodId);
    }
  };

  return (
    isPaymentMethodExpired(paymentMethod?.details) && (
      <FooterActions
        fixed
        actions={{
          type: "SingleButton",
          primary: {
            label: I18n.t("wallet.methodDetails.update.primaryButton"),
            onPress: handleUpdatePress
          }
        }}
      />
    )
  );
};

export { PaymentsMethodDetailsUpdateDataButton };
