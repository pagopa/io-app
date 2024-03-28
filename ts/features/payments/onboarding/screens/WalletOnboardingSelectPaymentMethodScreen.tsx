import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";

import { useNavigation } from "@react-navigation/native";

import { PaymentMethodResponse } from "../../../../../definitions/pagopa/walletv3/PaymentMethodResponse";
import { PaymentMethodStatusEnum } from "../../../../../definitions/pagopa/walletv3/PaymentMethodStatus";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { RNavScreenWithLargeHeader } from "../../../../components/ui/RNavScreenWithLargeHeader";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import WalletOnboardingPaymentMethodsList from "../components/WalletOnboardingPaymentMethodsList";
import { useWalletOnboardingWebView } from "../hooks/useWalletOnboardingWebView";
import {
  WalletOnboardingRoutes,
  WalletOnboardingStackNavigation
} from "../navigation/navigator";
import {
  isLoadingPaymentMethodsSelector,
  walletOnboardingPaymentMethodsSelector
} from "../store";
import { walletGetPaymentMethods } from "../store/actions";

const WalletOnboardingSelectPaymentMethodScreen = () => {
  const navigation = useNavigation<WalletOnboardingStackNavigation>();
  const dispatch = useIODispatch();
  const isLoadingPaymentMethods = useIOSelector(
    isLoadingPaymentMethodsSelector
  );
  const paymentMethodsPot = useIOSelector(
    walletOnboardingPaymentMethodsSelector
  );

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
          WalletOnboardingRoutes.WALLET_ONBOARDING_RESULT_FEEDBACK,
          {
            outcome,
            walletId
          }
        );
      }
    });

  useOnFirstRender(() => {
    dispatch(walletGetPaymentMethods.request());
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
          onPress: () => dispatch(walletGetPaymentMethods.request())
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

export default WalletOnboardingSelectPaymentMethodScreen;
