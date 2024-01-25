import {
  H3,
  IOSpacingScale,
  LoadingSpinner,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { AmountEuroCents } from "../../../../../definitions/pagopa/ecommerce/AmountEuroCents";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { WalletPaymentConfirmContent } from "../components/WalletPaymentConfirmContent";
import { useWalletPaymentAuthorizationModal } from "../hooks/useWalletPaymentAuthorizationModal";
import { WalletPaymentRoutes } from "../navigation/routes";
import {
  walletPaymentDetailsSelector,
  walletPaymentPickedPaymentMethodSelector,
  walletPaymentPickedPspSelector,
  walletPaymentTransactionSelector
} from "../store/selectors";
import {
  WalletPaymentOutcome,
  WalletPaymentOutcomeEnum
} from "../types/PaymentOutcomeEnum";

const WalletPaymentConfirmScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const paymentDetailsPot = useIOSelector(walletPaymentDetailsSelector);
  const transactionPot = useIOSelector(walletPaymentTransactionSelector);
  const selectedMethodOption = useIOSelector(
    walletPaymentPickedPaymentMethodSelector
  );
  const selectedPspOption = useIOSelector(walletPaymentPickedPspSelector);

  useHeaderSecondLevel({
    title: "",
    contextualHelp: emptyContextualHelp,
    faqCategories: ["payment"],
    supportRequest: true
  });

  const handleStartPaymentAuthorization = () =>
    pipe(
      sequenceS(O.Monad)({
        paymentDetail: pot.toOption(paymentDetailsPot),
        transaction: pot.toOption(transactionPot),
        selectedPsp: selectedPspOption,
        selectedMethod: selectedMethodOption
      }),
      O.map(({ paymentDetail, selectedMethod, selectedPsp, transaction }) =>
        startPaymentAuthorizaton({
          paymentAmount: paymentDetail.amount as AmountEuroCents,
          paymentFees: (selectedPsp.taxPayerFee ?? 0) as AmountEuroCents,
          pspId: selectedPsp.idBundle ?? "",
          transactionId: transaction.transactionId,
          walletId: selectedMethod.walletId
        })
      )
    );

  const handleAuthorizationOutcome = React.useCallback(
    (outcome: WalletPaymentOutcome) => {
      navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
        screen: WalletPaymentRoutes.WALLET_PAYMENT_OUTCOME,
        params: {
          outcome
        }
      });
    },
    [navigation]
  );

  const {
    isLoading: isAuthUrlLoading,
    isError: isAuthUrlError,
    isPendingAuthorization,
    startPaymentAuthorizaton
  } = useWalletPaymentAuthorizationModal({
    onAuthorizationOutcome: handleAuthorizationOutcome,
    onDismiss: () =>
      handleAuthorizationOutcome(WalletPaymentOutcomeEnum.CANCELED_BY_USER)
  });

  const isLoading = isAuthUrlLoading || isPendingAuthorization;
  const isError = isAuthUrlError;

  React.useEffect(() => {
    if (isError) {
      handleAuthorizationOutcome(WalletPaymentOutcomeEnum.GENERIC_ERROR);
    }
  }, [isError, handleAuthorizationOutcome]);

  const LoadingContent = () => (
    <SafeAreaView style={styles.loadingContainer}>
      <LoadingSpinner size={48} />
      <VSpacer size={24} />
      <H3 style={{ textAlign: "center" }}>
        {I18n.t("payment.confirm.loading.title")}
      </H3>
    </SafeAreaView>
  );

  return pipe(
    sequenceS(O.Monad)({
      paymentMethodDetails: pipe(
        selectedMethodOption,
        O.chainNullableK(method => method.details)
      ),
      selectedPsp: selectedPspOption,
      paymentDetails: pipe(paymentDetailsPot, pot.toOption)
    }),
    O.fold(
      () => <LoadingContent />,
      props => (
        <WalletPaymentConfirmContent
          isLoading={isLoading}
          onConfirm={handleStartPaymentAuthorization}
          {...props}
        />
      )
    )
  );
};

const loadingContainerHorizontalMargin: IOSpacingScale = 48;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: loadingContainerHorizontalMargin
  }
});

export { WalletPaymentConfirmScreen };
