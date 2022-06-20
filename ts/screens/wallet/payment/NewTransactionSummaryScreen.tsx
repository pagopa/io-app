import {
  PaymentNoticeNumberFromString,
  RptIdFromString
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import { CompatNavigationProp } from "@react-navigation/compat";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { ActionSheet } from "native-base";
import React, { useEffect } from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import {
  isError,
  isLoading as isRemoteLoading,
  isUndefined
} from "../../../features/bonus/bpd/model/RemoteValue";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../../features/zendesk/store/actions";
import I18n from "../../../i18n";
import { IOStackNavigationProp } from "../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../navigation/params/WalletParamsList";
import {
  navigateToPaymentPickPaymentMethodScreen,
  navigateToPaymentTransactionErrorScreen,
  navigateToWalletAddPaymentMethod
} from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
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
import { fetchWalletsRequestWithExpBackoff } from "../../../store/actions/wallet/wallets";
import {
  bancomatPayConfigSelector,
  isPaypalEnabledSelector
} from "../../../store/reducers/backendStatus";
import { GlobalState } from "../../../store/reducers/types";
import {
  getFavoriteWallet,
  withPaymentFeatureSelector
} from "../../../store/reducers/wallet/wallets";
import { PayloadForAction } from "../../../types/utils";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { DetailV2Keys, getV2ErrorMainType } from "../../../utils/payment";
import { alertNoPayablePaymentMethods } from "../../../utils/paymentMethod";
import { showToast } from "../../../utils/showToast";
import {
  addTicketCustomField,
  appendLog,
  resetCustomFields,
  zendeskBlockedPaymentRptIdId,
  zendeskCategoryId,
  zendeskPaymentCategory
} from "../../../utils/supportAssistance";
import { dispatchPickPspOrConfirm } from "./common";
import { TransactionSummary } from "./components/TransactionSummary";
import {
  continueButtonProps,
  helpButtonProps,
  loadingButtonProps
} from "./components/TransactionSummaryButtonConfigurations";
import { TransactionSummaryErrorDetails } from "./components/TransactionSummaryErrorDetails";
import { TransactionSummaryStatus } from "./components/TransactionSummaryStatus";

export type TransactionSummaryError = O.Option<
  PayloadForAction<
    | typeof paymentVerifica["failure"]
    | typeof paymentAttiva["failure"]
    | typeof paymentIdPolling["failure"]
  >
>;

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

const renderFooter = (
  isLoading: boolean,
  error: TransactionSummaryError,
  continueWithPayment: () => void,
  help: () => void
) => {
  if (O.isSome(error)) {
    const errorOrUndefined = O.toUndefined(error);
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

  const errorOrUndefined = O.toUndefined(error);
  useEffect(() => {
    if (errorOrUndefined === undefined) {
      return;
    }
    if (errorOrUndefined === "PAA_PAGAMENTO_DUPLICATO") {
      onDuplicatedPayment();
    }
    if (pot.isError(paymentVerification) && !showsInlineError) {
      navigateToPaymentTransactionError(O.fromNullable(errorOrUndefined));
    }
  }, [
    errorOrUndefined,
    onDuplicatedPayment,
    navigateToPaymentTransactionError,
    showsInlineError,
    paymentVerification
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
  )
    .replace(/(\d{4})/g, "$1  ")
    .trim();

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
      headerTitle={I18n.t("wallet.ConfirmPayment.paymentInformations")}
    >
      <SafeAreaView style={styles.container}>
        {showsInlineError && <TransactionSummaryStatus error={error} />}
        <ScrollView>
          <TransactionSummary
            paymentVerification={paymentVerification}
            paymentNoticeNumber={paymentNoticeNumber}
            organizationFiscalCode={organizationFiscalCode}
            isPaid={errorOrUndefined === "PAA_PAGAMENTO_DUPLICATO"}
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
    ? O.some(verifica.error)
    : pot.isError(attiva)
    ? O.some(attiva.error)
    : pot.isError(paymentId)
    ? O.some(paymentId.error)
    : pot.isError(check) || isError(pspsV2.psps)
    ? O.some(undefined)
    : O.none;

  const walletById = state.wallet.wallets.walletById;

  const isPaypalEnabled = isPaypalEnabledSelector(state);
  const isBPayPaymentEnabled = bancomatPayConfigSelector(state).payment;
  const favouriteWallet = pot.toUndefined(getFavoriteWallet(state));
  /**
   * the favourite will be undefined if one of these condition is true
   * - payment method is PayPal & the relative feature flag is not enabled
   * - payment method is BPay & the relative feature flag is not enabled
   */
  const maybeFavoriteWallet = pipe(
    favouriteWallet,
    O.fromNullable,
    O.filter(fw => {
      switch (fw.paymentMethod?.kind) {
        case "PayPal":
          return isPaypalEnabled;
        case "BPay":
          return isBPayPaymentEnabled;
        default:
          return true;
      }
    })
  );

  const hasPayableMethods = withPaymentFeatureSelector(state).length > 0;

  const isLoading =
    pot.isLoading(walletById) ||
    pot.isLoading(verifica) ||
    pot.isLoading(attiva) ||
    (O.isNone(error) && pot.isSome(attiva) && pot.isNone(paymentId)) ||
    pot.isLoading(paymentId) ||
    (O.isNone(error) && pot.isSome(paymentId) && pot.isNone(check)) ||
    pot.isLoading(check) ||
    (O.isSome(maybeFavoriteWallet) &&
      O.isNone(error) &&
      pot.isSome(check) &&
      isUndefined(pspsV2.psps)) ||
    (O.isSome(maybeFavoriteWallet) && isRemoteLoading(pspsV2.psps));

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
        inPayment: O.none,
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
