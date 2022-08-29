import React, { useEffect } from "react";
import { CompatNavigationProp } from "@react-navigation/compat";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import * as pot from "italia-ts-commons/lib/pot";
import { connect } from "react-redux";
import {
  PaymentNoticeNumberFromString,
  RptIdFromString
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import { ActionSheet } from "native-base";
import { IOStackNavigationProp } from "../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../navigation/params/WalletParamsList";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { GlobalState } from "../../../store/reducers/types";
import { Dispatch } from "../../../store/actions/types";
import { fetchWalletsRequestWithExpBackoff } from "../../../store/actions/wallet/wallets";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import {
  abortRunningPayment,
  backToEntrypointPayment,
  paymentAttiva,
  paymentCompletedSuccess,
  paymentIdPolling,
  paymentInitializeState,
  paymentVerifica,
  runDeleteActivePaymentSaga,
  runStartOrResumePaymentActivationSaga
} from "../../../store/actions/wallet/payment";
import { PayloadForAction } from "../../../types/utils";
import {
  navigateToPaymentPickPaymentMethodScreen,
  navigateToPaymentTransactionErrorScreen,
  navigateToWalletAddPaymentMethod
} from "../../../store/actions/navigation";
import {
  isError,
  isLoading as isRemoteLoading,
  isUndefined
} from "../../../features/bonus/bpd/model/RemoteValue";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import {
  getFavoriteWallet,
  withPaymentFeatureSelector
} from "../../../store/reducers/wallet/wallets";
import {
  bancomatPayConfigSelector,
  isPaypalEnabledSelector
} from "../../../store/reducers/backendStatus";
import { alertNoPayablePaymentMethods } from "../../../utils/paymentMethod";
import { showToast } from "../../../utils/showToast";
import {
  DetailV2Keys,
  getV2ErrorMainType,
  isDuplicatedPayment
} from "../../../utils/payment";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../../features/zendesk/store/actions";
import {
  addTicketCustomField,
  appendLog,
  resetCustomFields,
  zendeskBlockedPaymentRptIdId,
  zendeskCategoryId,
  zendeskPaymentCategory
} from "../../../utils/supportAssistance";
import customVariables from "../../../theme/variables";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { TransactionSummary } from "./components/TransactionSummary";
import { TransactionSummaryStatus } from "./components/TransactionSummaryStatus";
import { dispatchPickPspOrConfirm } from "./common";
import { TransactionSummaryErrorDetails } from "./components/TransactionSummaryErrorDetails";
import {
  continueButtonProps,
  helpButtonProps,
  loadingButtonProps
} from "./components/TransactionSummaryButtonConfigurations";

export type TransactionSummaryError = Option<
  PayloadForAction<
    | typeof paymentVerifica["failure"]
    | typeof paymentAttiva["failure"]
    | typeof paymentIdPolling["failure"]
  >
>;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: customVariables.contentPadding
  }
});

const renderFooter = (
  isLoading: boolean,
  error: TransactionSummaryError,
  continueWithPayment: () => void,
  help: () => void
) => {
  if (error.isSome()) {
    const errorOrUndefined = error.toUndefined();
    const errorType = getV2ErrorMainType(errorOrUndefined as DetailV2Keys);
    switch (errorType) {
      case "TECHNICAL":
      case "DATA":
      case "UNCOVERED":
        return (
          <FooterWithButtons
            type="SingleButton"
            leftButton={helpButtonProps(help)}
          />
        );
      // There's a strange case where error is 'some' but
      // its value is undefined (e.g. network error).
      // In this case we fallback to the 'continue' CTA
      // so that the user can eventually retry.
      case undefined:
        break;
      default:
        return <></>;
    }
  }
  if (isLoading) {
    return (
      <FooterWithButtons
        type="SingleButton"
        leftButton={loadingButtonProps()}
      />
    );
  }

  return (
    <FooterWithButtons
      type="SingleButton"
      leftButton={continueButtonProps(continueWithPayment)}
    />
  );
};

type OwnProps = {
  navigation: CompatNavigationProp<
    IOStackNavigationProp<WalletParamsList, "PAYMENT_TRANSACTION_SUMMARY">
  >;
};

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps;

const NewTransactionSummaryScreen = ({
  isLoading,
  error,
  paymentVerification,
  verifyPayment,
  onDuplicatedPayment,
  navigateToPaymentTransactionError,
  walletById,
  loadWallets,
  navigation,
  continueWithPayment,
  maybeFavoriteWallet,
  hasPayableMethods,
  paymentId,
  backToEntrypointPayment,
  resetPayment,
  startAssistanceRequest
}: Props): React.ReactElement => {
  useOnFirstRender(() => {
    if (pot.isNone(paymentVerification)) {
      verifyPayment();
    }
    if (!pot.isSome(walletById)) {
      loadWallets();
    }
  });

  // We show inline error status only if the payment starts
  // from a message and the verification fails. In all the other
  // cases we present the fullscreen error message.
  const paymentStartOrigin = navigation.getParam("paymentStartOrigin");
  const showsInlineError = paymentStartOrigin === "message";

  const errorOrUndefined = error.toUndefined();
  const isPaid = isDuplicatedPayment(error);

  const isError = error.isSome();
  useEffect(() => {
    if (!isError) {
      return;
    }
    if (isPaid) {
      onDuplicatedPayment();
    }
    // in case of a payment verification error we should navigate
    // to the error screen only if showsInlineError is false
    // in any other case we should always navigate to the error screen
    if (
      (pot.isError(paymentVerification) && !showsInlineError) ||
      (!pot.isError(paymentVerification) && isError)
    ) {
      navigateToPaymentTransactionError(fromNullable(errorOrUndefined));
    }
  }, [
    isError,
    errorOrUndefined,
    onDuplicatedPayment,
    navigateToPaymentTransactionError,
    showsInlineError,
    paymentVerification,
    isPaid
  ]);

  const goBack = () => {
    if (pot.isSome(paymentId)) {
      // If we have a paymentId (payment check already done) we need to
      // ask the user to cancel the payment and in case reset it
      ActionSheet.show(
        {
          options: [
            I18n.t("wallet.ConfirmPayment.confirmCancelPayment"),
            I18n.t("wallet.ConfirmPayment.confirmContinuePayment")
          ],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
          title: I18n.t("wallet.ConfirmPayment.confirmCancelTitle")
        },
        buttonIndex => {
          if (buttonIndex === 0) {
            backToEntrypointPayment();
            resetPayment();
            showToast(
              I18n.t("wallet.ConfirmPayment.cancelPaymentSuccess"),
              "success"
            );
          }
        }
      );
    } else {
      navigation.goBack();
    }
  };

  const rptId = navigation.getParam("rptId");
  const messageId = navigation.getParam("messageId");

  const paymentNoticeNumber = PaymentNoticeNumberFromString.encode(
    rptId.paymentNoticeNumber
  );

  /**
   * try to show the fiscal code coming from the 'verification' API
   * otherwise (it could be an issue with the API) use the rptID coming from
   * static data (e.g. message, qrcode, manual insertion, etc.)
   */
  const organizationFiscalCode = pot
    .toOption(paymentVerification)
    .mapNullable(_ => _.enteBeneficiario?.identificativoUnivocoBeneficiario)
    .getOrElse(rptId.organizationFiscalCode);

  return (
    <BaseScreenComponent
      backButtonTestID={"back-button-transaction-summary"}
      goBack={goBack}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("wallet.ConfirmPayment.paymentInformations")}>
      <SafeAreaView style={IOStyles.flex}>
        {showsInlineError && <TransactionSummaryStatus error={error} />}
        <ScrollView style={styles.container}>
          <TransactionSummary
            paymentVerification={paymentVerification}
            paymentNoticeNumber={paymentNoticeNumber}
            organizationFiscalCode={organizationFiscalCode}
            isPaid={isPaid}
          />
          {showsInlineError && pot.isError(paymentVerification) && (
            <TransactionSummaryErrorDetails
              error={error}
              paymentNoticeNumber={paymentNoticeNumber}
              organizationFiscalCode={organizationFiscalCode}
              messageId={messageId}
            />
          )}
        </ScrollView>
        {renderFooter(
          isLoading,
          error,
          () =>
            continueWithPayment(
              paymentVerification,
              maybeFavoriteWallet,
              hasPayableMethods
            ),
          () => startAssistanceRequest(error, messageId)
        )}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

// eslint-disable-next-line complexity,sonarjs/cognitive-complexity
const mapStateToProps = (state: GlobalState) => {
  const { verifica, attiva, paymentId, check, pspsV2 } = state.wallet.payment;

  const error: TransactionSummaryError = pot.isError(verifica)
    ? some(verifica.error)
    : pot.isError(attiva)
    ? some(attiva.error)
    : pot.isError(paymentId)
    ? some(paymentId.error)
    : pot.isError(check) || isError(pspsV2.psps)
    ? some(undefined)
    : none;

  const walletById = state.wallet.wallets.walletById;

  const isPaypalEnabled = isPaypalEnabledSelector(state);
  const isBPayPaymentEnabled = bancomatPayConfigSelector(state).payment;
  const favouriteWallet = pot.toUndefined(getFavoriteWallet(state));
  /**
   * the favourite will be undefined if one of these condition is true
   * - payment method is PayPal & the relative feature flag is not enabled
   * - payment method is BPay & the relative feature flag is not enabled
   */
  const maybeFavoriteWallet = fromNullable(favouriteWallet).filter(fw => {
    switch (fw.paymentMethod?.kind) {
      case "PayPal":
        return isPaypalEnabled;
      case "BPay":
        return isBPayPaymentEnabled;
      default:
        return true;
    }
  });

  const hasPayableMethods = withPaymentFeatureSelector(state).length > 0;

  const isLoading =
    pot.isLoading(walletById) ||
    pot.isLoading(verifica) ||
    pot.isLoading(attiva) ||
    (error.isNone() && pot.isSome(attiva) && pot.isNone(paymentId)) ||
    pot.isLoading(paymentId) ||
    (error.isNone() && pot.isSome(paymentId) && pot.isNone(check)) ||
    pot.isLoading(check) ||
    (maybeFavoriteWallet.isSome() &&
      error.isNone() &&
      pot.isSome(check) &&
      isUndefined(pspsV2.psps)) ||
    (maybeFavoriteWallet.isSome() && isRemoteLoading(pspsV2.psps));

  return {
    paymentVerification: verifica,
    isLoading,
    error,
    walletById,
    maybeFavoriteWallet,
    hasPayableMethods,
    paymentId
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => {
  const rptId = props.navigation.getParam("rptId");
  const paymentStartOrigin = props.navigation.getParam("paymentStartOrigin");
  const initialAmount = props.navigation.getParam("initialAmount");

  const verifyPayment = () =>
    dispatch(
      paymentVerifica.request({ rptId, startOrigin: paymentStartOrigin })
    );

  const onDuplicatedPayment = () =>
    dispatch(
      paymentCompletedSuccess({
        rptId,
        kind: "DUPLICATED"
      })
    );

  const onCancel = () => {
    dispatch(abortRunningPayment());
  };

  const navigateToPaymentTransactionError = (error: TransactionSummaryError) =>
    navigateToPaymentTransactionErrorScreen({
      error,
      onCancel,
      rptId
    });

  const startOrResumePayment = (
    paymentVerification: PaymentRequestsGetResponse,
    maybeFavoriteWallet: ReturnType<
      typeof mapStateToProps
    >["maybeFavoriteWallet"],
    hasPayableMethods: ReturnType<typeof mapStateToProps>["hasPayableMethods"]
  ) =>
    dispatch(
      runStartOrResumePaymentActivationSaga({
        rptId,
        verifica: paymentVerification,
        onSuccess: idPayment =>
          dispatchPickPspOrConfirm(dispatch)(
            rptId,
            initialAmount,
            paymentVerification,
            idPayment,
            maybeFavoriteWallet,
            () => {
              // either we cannot use the default payment method for this
              // payment, or fetching the PSPs for this payment and the
              // default wallet has failed, ask the user to pick a wallet

              navigateToPaymentPickPaymentMethodScreen({
                rptId,
                initialAmount,
                verifica: paymentVerification,
                idPayment
              });
            },
            hasPayableMethods
          )
      })
    );

  const continueWithPayment = (
    paymentVerification: ReturnType<
      typeof mapStateToProps
    >["paymentVerification"],
    maybeFavoriteWallet: ReturnType<
      typeof mapStateToProps
    >["maybeFavoriteWallet"],
    hasPayableMethods: ReturnType<typeof mapStateToProps>["hasPayableMethods"]
  ) => {
    if (!pot.isSome(paymentVerification)) {
      return;
    }
    if (hasPayableMethods) {
      startOrResumePayment(
        paymentVerification.value,
        maybeFavoriteWallet,
        hasPayableMethods
      );
      return;
    }
    alertNoPayablePaymentMethods(() =>
      navigateToWalletAddPaymentMethod({
        inPayment: none,
        showOnlyPayablePaymentMethods: true
      })
    );
  };

  const resetPayment = () => {
    dispatch(runDeleteActivePaymentSaga());
    dispatch(paymentInitializeState());
  };

  const startAssistanceRequest = (
    error: TransactionSummaryError,
    messageId: string | undefined
  ) => {
    resetCustomFields();
    addTicketCustomField(zendeskCategoryId, zendeskPaymentCategory.value);
    addTicketCustomField(
      zendeskBlockedPaymentRptIdId,
      RptIdFromString.encode(rptId)
    );
    appendLog(
      JSON.stringify({
        error,
        messageId
      })
    );
    dispatch(
      zendeskSupportStart({ startingRoute: "n/a", assistanceForPayment: true })
    );
    dispatch(zendeskSelectedCategory(zendeskPaymentCategory));
  };

  return {
    loadWallets: () => dispatch(fetchWalletsRequestWithExpBackoff()),
    verifyPayment,
    onDuplicatedPayment,
    navigateToPaymentTransactionError,
    continueWithPayment,
    resetPayment,
    backToEntrypointPayment: () => dispatch(backToEntrypointPayment()),
    startAssistanceRequest
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewTransactionSummaryScreen);
