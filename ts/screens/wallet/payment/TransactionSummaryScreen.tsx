import { ContentWrapper, IOToast } from "@pagopa/io-app-design-system";
import {
  AmountInEuroCents,
  PaymentNoticeNumberFromString,
  RptId
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React, { useCallback, useEffect } from "react";
import { Alert, ScrollView } from "react-native";
import {
  isError as isRemoteError,
  isLoading as isRemoteLoading,
  isUndefined
} from "../../../common/model/RemoteValue";
import {
  FooterActions,
  FooterActionsMeasurements
} from "../../../components/ui/FooterActions";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../../features/zendesk/store/actions";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import I18n from "../../../i18n";
import { WalletParamsList } from "../../../navigation/params/WalletParamsList";
import { navigateToPaymentTransactionErrorScreen } from "../../../store/actions/navigation";
import {
  PaymentStartOrigin,
  abortRunningPayment,
  backToEntrypointPayment,
  paymentAttiva,
  paymentCompletedSuccess,
  paymentIdPolling,
  paymentInitializeState,
  paymentVerifica,
  runDeleteActivePaymentSaga
} from "../../../store/actions/wallet/payment";
import { fetchWalletsRequestWithExpBackoff } from "../../../store/actions/wallet/wallets";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import {
  bancomatPayConfigSelector,
  isPaypalEnabledSelector
} from "../../../store/reducers/backendStatus/remoteConfig";
import { getFavoriteWallet } from "../../../store/reducers/wallet/wallets";
import { PayloadForAction } from "../../../types/utils";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import {
  DetailV2Keys,
  getCodiceAvviso,
  getV2ErrorMainType,
  isDuplicatedPayment
} from "../../../utils/payment";
import {
  addTicketCustomField,
  appendLog,
  resetCustomFields,
  zendeskCategoryId,
  zendeskPaymentCategory,
  zendeskPaymentFailure,
  zendeskPaymentNav,
  zendeskPaymentOrgFiscalCode,
  zendeskPaymentStartOrigin
} from "../../../utils/supportAssistance";
import { useFooterActionsMeasurements } from "../../../hooks/useFooterActionsMeasurements";
import { TransactionSummary } from "./components/TransactionSummary";
import { TransactionSummaryStatus } from "./components/TransactionSummaryStatus";
import { useStartOrResumePayment } from "./hooks/useStartOrResumePayment";

export type TransactionSummaryScreenNavigationParams = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
  paymentStartOrigin: PaymentStartOrigin;
  messageId?: string;
}>;

export type TransactionSummaryErrorContent = PayloadForAction<
  | (typeof paymentVerifica)["failure"]
  | (typeof paymentAttiva)["failure"]
  | (typeof paymentIdPolling)["failure"]
>;

export type TransactionSummaryError = O.Option<TransactionSummaryErrorContent>;

const renderFooter = (
  isLoading: boolean,
  error: TransactionSummaryError,
  continueWithPayment: () => void,
  help: () => void,
  onMeasure?: (values: FooterActionsMeasurements) => void
) => {
  if (O.isSome(error)) {
    const errorOrUndefined = O.toUndefined(error);
    const errorType = getV2ErrorMainType(errorOrUndefined as DetailV2Keys);
    switch (errorType) {
      case "TECHNICAL":
      case "DATA":
      case "UNCOVERED":
        return (
          <FooterActions
            onMeasure={onMeasure}
            actions={{
              type: "SingleButton",
              primary: {
                label: I18n.t("payment.details.info.buttons.help"),
                onPress: help
              }
            }}
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

  return (
    <FooterActions
      onMeasure={onMeasure}
      actions={{
        type: "SingleButton",
        primary: {
          loading: isLoading,
          label: I18n.t("wallet.continue"),
          onPress: continueWithPayment
        }
      }}
    />
  );
};

// eslint-disable-next-line complexity,sonarjs/cognitive-complexity
const TransactionSummaryScreen = (): React.ReactElement => {
  const route =
    useRoute<RouteProp<WalletParamsList, "PAYMENT_TRANSACTION_SUMMARY">>();
  const navigation = useNavigation();
  const { rptId, paymentStartOrigin, initialAmount, messageId } = route.params;

  const dispatch = useIODispatch();
  const {
    verifica: paymentVerification,
    attiva,
    paymentId,
    check,
    pspsV2
  } = useIOSelector(state => state.wallet.payment);

  /* Get `FooterActions` measurements */
  const { footerActionsMeasurements, handleFooterActionsMeasurements } =
    useFooterActionsMeasurements();

  const error: TransactionSummaryError = pot.isError(paymentVerification)
    ? O.some(paymentVerification.error)
    : pot.isError(attiva)
    ? O.some(attiva.error)
    : pot.isError(paymentId)
    ? O.some(paymentId.error)
    : pot.isError(check) || isRemoteError(pspsV2.psps)
    ? O.some(undefined)
    : O.none;

  const { walletById } = useIOSelector(state => state.wallet.wallets);

  const isPaypalEnabled = useIOSelector(isPaypalEnabledSelector);
  const { payment: isBPayPaymentEnabled } = useIOSelector(
    bancomatPayConfigSelector
  );
  const favouriteWallet = pot.toUndefined(useIOSelector(getFavoriteWallet));
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

  const isLoading =
    pot.isLoading(walletById) ||
    pot.isLoading(paymentVerification) ||
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

  useOnFirstRender(() => {
    if (pot.isNone(paymentVerification)) {
      verifyPayment();
    }
    if (!pot.isSome(walletById)) {
      dispatch(fetchWalletsRequestWithExpBackoff());
    }
  });

  const onCancel = useCallback(() => {
    dispatch(abortRunningPayment());
  }, [dispatch]);

  const navigateToPaymentTransactionError = useCallback(
    (error: TransactionSummaryError) =>
      navigateToPaymentTransactionErrorScreen({
        error,
        onCancel,
        rptId
      }),
    [onCancel, rptId]
  );

  const onDuplicatedPayment = useCallback(
    () =>
      dispatch(
        paymentCompletedSuccess({
          rptId,
          kind: "DUPLICATED"
        })
      ),
    [dispatch, rptId]
  );

  // We show inline error status only if the payment starts
  // from a message and the verification fails. In all the other
  // cases we present the fullscreen error message.
  const showsInlineError = paymentStartOrigin === "message";

  const errorOrUndefined = O.toUndefined(error);
  const isError = O.isSome(error);

  const isPaid = isDuplicatedPayment(error);

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
      navigateToPaymentTransactionError(O.fromNullable(errorOrUndefined));
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
      Alert.alert(
        I18n.t("wallet.ConfirmPayment.confirmCancelTitle"),
        undefined,
        [
          {
            text: I18n.t("wallet.ConfirmPayment.confirmCancelPayment"),
            style: "destructive",
            onPress: () => {
              dispatch(backToEntrypointPayment());
              resetPayment();
              IOToast.success(
                I18n.t("wallet.ConfirmPayment.cancelPaymentSuccess")
              );
            }
          },
          {
            text: I18n.t("wallet.ConfirmPayment.confirmContinuePayment"),
            style: "cancel"
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const verifyPayment = () =>
    dispatch(
      paymentVerifica.request({ rptId, startOrigin: paymentStartOrigin })
    );

  const continueWithPayment = useStartOrResumePayment(
    rptId,
    pot.toOption(paymentVerification),
    initialAmount,
    maybeFavoriteWallet
  );

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
    // Add organization fiscal code custom field
    addTicketCustomField(
      zendeskPaymentOrgFiscalCode,
      rptId.organizationFiscalCode
    );
    if (O.isSome(error) && error.value) {
      // Add failure custom field
      addTicketCustomField(zendeskPaymentFailure, error.value);
    }
    // Add start origin custom field
    addTicketCustomField(zendeskPaymentStartOrigin, paymentStartOrigin);
    // Add rptId custom field
    addTicketCustomField(zendeskPaymentNav, getCodiceAvviso(rptId));
    appendLog(
      JSON.stringify({
        error,
        messageId
      })
    );
    dispatch(
      zendeskSupportStart({
        startingRoute: "n/a",
        assistanceForPayment: true,
        assistanceForCard: false,
        assistanceForFci: false
      })
    );
    dispatch(zendeskSelectedCategory(zendeskPaymentCategory));
  };

  const paymentNoticeNumber = PaymentNoticeNumberFromString.encode(
    rptId.paymentNoticeNumber
  );

  /**
   * try to show the fiscal code coming from the 'verification' API
   * otherwise (it could be an issue with the API) use the rptID coming from
   * static data (e.g. message, qrcode, manual insertion, etc.)
   */
  const organizationFiscalCode = pipe(
    pot.toOption(paymentVerification),
    O.chainNullableK(
      _ => _.enteBeneficiario?.identificativoUnivocoBeneficiario
    ),
    O.getOrElse(() => rptId.organizationFiscalCode)
  );

  useHeaderSecondLevel({
    title: I18n.t("wallet.ConfirmPayment.paymentInformations"),
    supportRequest: true,
    contextualHelp: emptyContextualHelp,
    goBack,
    backTestID: "back-button-transaction-summary"
  });

  return (
    <>
      <ScrollView
        style={{ flexGrow: 1 }}
        contentContainerStyle={{
          paddingBottom: footerActionsMeasurements.safeBottomAreaHeight
        }}
      >
        {showsInlineError && <TransactionSummaryStatus error={error} />}
        <ContentWrapper>
          <TransactionSummary
            paymentVerification={paymentVerification}
            paymentNoticeNumber={paymentNoticeNumber}
            organizationFiscalCode={organizationFiscalCode}
            isPaid={isPaid}
          />
        </ContentWrapper>
      </ScrollView>

      {renderFooter(
        isLoading,
        error,
        () => continueWithPayment(),
        () => startAssistanceRequest(error, messageId),
        handleFooterActionsMeasurements
      )}
    </>
  );
};

export default TransactionSummaryScreen;
