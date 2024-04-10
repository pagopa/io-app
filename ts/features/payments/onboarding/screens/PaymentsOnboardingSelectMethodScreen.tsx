import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { PaymentMethodResponse } from "../../../../../definitions/pagopa/walletv3/PaymentMethodResponse";
import { PaymentMethodStatusEnum } from "../../../../../definitions/pagopa/walletv3/PaymentMethodStatus";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { RNavScreenWithLargeHeader } from "../../../../components/ui/RNavScreenWithLargeHeader";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import WalletOnboardingPaymentMethodsList from "../components/WalletOnboardingPaymentMethodsList";
import { useWalletOnboardingWebView } from "../hooks/useWalletOnboardingWebView";
import { PaymentsOnboardingRoutes } from "../navigation/routes";
import { paymentsOnboardingGetMethodsAction } from "../store/actions";
import { selectPaymentOnboardingMethods } from "../store/selectors";

const PaymentsOnboardingSelectMethodScreen = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const paymentMethodsPot = useIOSelector(selectPaymentOnboardingMethods);
  const isLoadingPaymentMethods = pot.isLoading(paymentMethodsPot);

  const availablePaymentMethods = pipe(
    pot.getOrElse(
      pot.map(paymentMethodsPot, el => el.paymentMethods),
      null
    ),
    O.fromNullable,
    O.map(el => el.filter(el => el.status === PaymentMethodStatusEnum.ENABLED)),
    O.getOrElseW(() => [])
  );

  const { startOnboarding, isLoading, isPendingOnboarding } =
    useWalletOnboardingWebView({
      onOnboardingOutcome: (outcome, walletId) => {
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
        pictogram="umbrellaNew"
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
    <RNavScreenWithLargeHeader
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
        paymentMethods={availablePaymentMethods}
        isLoadingWebView={isLoading || isPendingOnboarding}
      />
    </RNavScreenWithLargeHeader>
  );
};

export { PaymentsOnboardingSelectMethodScreen };
