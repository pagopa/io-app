import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "i18next";
import { PaymentMethodResponse } from "../../../../../definitions/pagopa/walletv3/PaymentMethodResponse";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import WalletOnboardingPaymentMethodsList from "../components/WalletOnboardingPaymentMethodsList";
import { useWalletOnboardingWebView } from "../hooks/useWalletOnboardingWebView";
import { PaymentsOnboardingRoutes } from "../navigation/routes";
import { paymentsOnboardingGetMethodsAction } from "../store/actions";
import { selectPaymentOnboardingMethods } from "../store/selectors";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { usePreventScreenCapture } from "../../../../utils/hooks/usePreventScreenCapture";

const PaymentsOnboardingSelectMethodScreen = () => {
  usePreventScreenCapture();

  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const paymentMethodsPot = useIOSelector(selectPaymentOnboardingMethods);
  const isLoadingPaymentMethods = pot.isLoading(paymentMethodsPot);
  const availablePaymentMethods = pot.toUndefined(paymentMethodsPot);

  const { startOnboarding, isLoading, isPendingOnboarding } =
    useWalletOnboardingWebView({
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

  useOnFirstRender(() => {
    dispatch(paymentsOnboardingGetMethodsAction.request());
  });

  const handleSelectedPaymentMethod = (
    selectedPaymentMethod: PaymentMethodResponse
  ) => {
    startOnboarding(selectedPaymentMethod.id);
  };

  if (pot.isError(paymentMethodsPot)) {
    return (
      <OperationResultScreenContent
        pictogram="umbrella"
        title={I18n.t("genericError")}
        subtitle={I18n.t("global.genericError")}
        action={{
          label: I18n.t("global.genericRetry"),
          accessibilityLabel: I18n.t("global.genericRetry"),
          onPress: () => dispatch(paymentsOnboardingGetMethodsAction.request())
        }}
      />
    );
  }

  return (
    <IOScrollViewWithLargeHeader
      headerActionsProp={{
        showHelp: true
      }}
      faqCategories={["wallet", "wallet_methods"]}
      title={{
        label: I18n.t("wallet.onboarding.paymentMethodsList.header.title")
      }}
      description={I18n.t(
        "wallet.onboarding.paymentMethodsList.header.subtitle"
      )}
    >
      <WalletOnboardingPaymentMethodsList
        isLoadingMethods={isLoadingPaymentMethods}
        onSelectPaymentMethod={handleSelectedPaymentMethod}
        paymentMethods={availablePaymentMethods ?? []}
        isLoadingWebView={isLoading || isPendingOnboarding}
      />
    </IOScrollViewWithLargeHeader>
  );
};

export { PaymentsOnboardingSelectMethodScreen };
