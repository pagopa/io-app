import * as React from "react";
import { SafeAreaView } from "react-native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { Body, H2, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import I18n from "../../../../i18n";
import TopScreenComponent from "../../../../components/screens/TopScreenComponent";
import WalletOnboardingPaymentMethodsList from "../components/WalletOnboardingPaymentMethodsList";
import { PaymentMethodResponse } from "../../../../../definitions/pagopa/walletv3/PaymentMethodResponse";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { paymentsOnboardingGetMethodsAction } from "../store/actions";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { selectPaymentOnboardingMethods } from "../store/selectors";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { PaymentMethodStatusEnum } from "../../../../../definitions/pagopa/walletv3/PaymentMethodStatus";
import { useWalletOnboardingWebView } from "../hooks/useWalletOnboardingWebView";
import { PaymentsOnboardingRoutes } from "../navigation/routes";
import { PaymentsOnboardingStackNavigation } from "../navigation/navigator";

const PaymentsOnboardingSelectMethodScreen = () => {
  const navigation = useNavigation<PaymentsOnboardingStackNavigation>();
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
          PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_RESULT_FEEDBACK,
          {
            outcome,
            walletId
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
            onPress: () =>
              dispatch(paymentsOnboardingGetMethodsAction.request())
          }}
        />
      ) : (
        <SafeAreaView style={IOStyles.flex}>
          <WalletOnboardingPaymentMethodsList
            header={<PaymentMethodsHeading />}
            isLoadingMethods={isLoadingPaymentMethods}
            onSelectPaymentMethod={handleSelectedPaymentMethod}
            paymentMethods={availablePaymentMethods}
            isLoadingWebView={isLoading || isPendingOnboarding}
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

export { PaymentsOnboardingSelectMethodScreen };
