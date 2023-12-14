import * as React from "react";
import { SafeAreaView } from "react-native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";

import { Body, H2, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";

import I18n from "../../../../i18n";
import {
  WalletOnboardingRoutes,
  WalletOnboardingStackNavigation
} from "../navigation/navigator";
import TopScreenComponent from "../../../../components/screens/TopScreenComponent";
import WalletOnboardingPaymentMethodsList from "../components/WalletOnboardingPaymentMethodsList";
import { PaymentMethodResponse } from "../../../../../definitions/pagopa/walletv3/PaymentMethodResponse";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { walletGetPaymentMethods } from "../store/actions";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  isLoadingPaymentMethodsSelector,
  walletOnboardingPaymentMethodsSelector
} from "../store";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { PaymentMethodStatusEnum } from "../../../../../definitions/pagopa/walletv3/PaymentMethodStatus";
import { useWalletOnboardingWebView } from "../hooks/useWalletOnboardingWebView";
import { OnboardingOutcomeEnum, OnboardingResult } from "../types";

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

  const { startOnboarding } = useWalletOnboardingWebView({
    onSuccess: (outcome, walletId) =>
      navigateToFeedbackPage({ status: "SUCCESS", outcome, walletId }),
    onFailure: outcome =>
      navigateToFeedbackPage({ status: "FAILURE", outcome }),
    onError: () =>
      navigateToFeedbackPage({
        status: "ERROR",
        outcome: OnboardingOutcomeEnum.GENERIC_ERROR
      })
  });

  useOnFirstRender(() => {
    dispatch(walletGetPaymentMethods.request());
  });

  const handleSelectedPaymentMethod = (
    selectedPaymentMethod: PaymentMethodResponse
  ) => {
    startOnboarding(selectedPaymentMethod.id);
  };

  const navigateToFeedbackPage = (onboardingResult: OnboardingResult) => {
    navigation.navigate(
      WalletOnboardingRoutes.WALLET_ONBOARDING_RESULT_FEEDBACK,
      {
        onboardingResult
      }
    );
  };

  return (
    <TopScreenComponent goBack>
      {pot.isError(paymentMethodsPot) ? (
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
      ) : (
        <SafeAreaView style={IOStyles.flex}>
          <WalletOnboardingPaymentMethodsList
            header={<PaymentMethodsHeading />}
            isLoading={isLoadingPaymentMethods}
            onSelectPaymentMethod={handleSelectedPaymentMethod}
            paymentMethods={availablePaymentMethods}
          />
        </SafeAreaView>
      )}
    </TopScreenComponent>
  );
};

const PaymentMethodsHeading = () => (
  <>
    <H2>{I18n.t("wallet.onboarding.paymentMethodsList.header.title")}</H2>
    <VSpacer />
    <Body>
      {I18n.t("wallet.onboarding.paymentMethodsList.header.subtitle")}
    </Body>
    <VSpacer size={32} />
  </>
);

export default WalletOnboardingSelectPaymentMethodScreen;
