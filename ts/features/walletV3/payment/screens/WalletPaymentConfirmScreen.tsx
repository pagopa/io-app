import {
  H3,
  IOSpacingScale,
  LoadingSpinner,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
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
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { WalletPaymentConfirmContent } from "../components/WalletPaymentConfirmContent";
import { useWalletPaymentAuthorizationModal } from "../hooks/useWalletPaymentAuthorizationModal";
import { WalletPaymentRoutes } from "../navigation/routes";
import { walletPaymentCreateTransaction } from "../store/actions/networking";
import {
  walletPaymentDetailsSelector,
  walletPaymentPickedPaymentMethodSelector,
  walletPaymentPickedPspSelector,
  walletPaymentTransactionSelector
} from "../store/selectors";
import { WalletPaymentOutcome } from "../types/PaymentOutcomeEnum";

const WalletPaymentConfirmScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const paymentDetailsPot = useIOSelector(walletPaymentDetailsSelector);
  const transactionPot = useIOSelector(walletPaymentTransactionSelector);
  const selectedMethodOption = useIOSelector(
    walletPaymentPickedPaymentMethodSelector
  );
  const selectedPspOption = useIOSelector(walletPaymentPickedPspSelector);

  const isTransactionLoading = pot.isLoading(transactionPot);
  const isTransactionError = pot.isError(transactionPot);

  useHeaderSecondLevel({
    title: "",
    contextualHelp: emptyContextualHelp,
    faqCategories: ["payment"],
    supportRequest: true
  });

  useFocusEffect(
    React.useCallback(() => {
      dispatch(walletPaymentCreateTransaction.request({ paymentNotices: [] }));
    }, [dispatch])
  );

  const handleStartPaymentAuthorization = () => {
    if (selectedMethod && selectedPsp && pot.isSome(transactionPot)) {
      startPaymentAuthorizaton({
        paymentAmount: paymentAmount as AmountEuroCents,
        paymentFees: taxFee as AmountEuroCents,
        pspId: selectedPsp.idBundle ?? "",
        transactionId: transactionPot.value.transactionId,
        walletId: selectedMethod.walletId
      });
    }
  };

  const handleAuthorizationOutcome = (outcome: WalletPaymentOutcome) => {
    navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
      screen: WalletPaymentRoutes.WALLET_PAYMENT_OUTCOME,
      params: {
        outcome
      }
    });
  };

  const {
    isLoading: isAuthLoading,
    isError: isAuthError,
    startPaymentAuthorizaton
  } = useWalletPaymentAuthorizationModal({
    onAuthorizationOutcome: handleAuthorizationOutcome
  });

  const isLoading = isTransactionLoading || isAuthLoading;
  const isError = isTransactionError || isAuthError;

  const taxFee = pipe(
    selectedPspOption,
    O.chain(psp => O.fromNullable(psp.taxPayerFee)),
    O.getOrElse(() => 0)
  );

  const paymentAmount = pipe(
    pot.toUndefined(paymentDetailsPot),
    O.fromNullable,
    O.chain(paymentDetails => O.fromNullable(paymentDetails.amount)),
    O.getOrElse(() => 0)
  );

  const selectedMethod = O.toUndefined(selectedMethodOption);
  const selectedPsp = O.toUndefined(selectedPspOption);

  if (isError) {
    // TODO: Failure handling (https://pagopa.atlassian.net/browse/IOBP-471)
    return <></>;
  }

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
      selectedMethod: selectedMethodOption,
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
