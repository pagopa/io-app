import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { ActionSheet, Content, Text, View } from "native-base";
import * as React from "react";
import { Alert, StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { ImportoEuroCents } from "../../../../definitions/backend/ImportoEuroCents";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import ContextualInfo from "../../../components/ContextualInfo";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { withLightModalContext } from "../../../components/helpers/withLightModalContext";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import { LightModalContextInterface } from "../../../components/ui/LightModal";
import Markdown from "../../../components/ui/Markdown";
import PaymentBannerComponent from "../../../components/wallet/PaymentBannerComponent";
import I18n from "../../../i18n";
import {
  navigateToPaymentOutcomeCode,
  navigateToPaymentPickPaymentMethodScreen,
  navigateToPaymentPickPspScreen
} from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import {
  abortRunningPayment,
  paymentCompletedFailure,
  paymentCompletedSuccess,
  paymentExecuteStart,
  paymentWebViewEnd,
  PaymentWebViewEndReason
} from "../../../store/actions/wallet/payment";
import { GlobalState } from "../../../store/reducers/types";
import variables from "../../../theme/variables";
import customVariables from "../../../theme/variables";
import {
  isCreditCard,
  isRawPayPal,
  PaymentMethod,
  Psp,
  Wallet
} from "../../../types/pagopa";
import { showToast } from "../../../utils/showToast";
import { getLocalePrimaryWithFallback } from "../../../utils/locale";
import { PayloadForAction } from "../../../types/utils";
import {
  paymentStartPayloadSelector,
  PaymentStartWebViewPayload,
  pmSessionTokenSelector,
  pspV2Selector
} from "../../../store/reducers/wallet/payment";
import {
  getValueOrElse,
  isError,
  isLoading,
  isReady
} from "../../../features/bonus/bpd/model/RemoteValue";
import { PayWebViewModal } from "../../../components/wallet/PayWebViewModal";
import { formatNumberCentsToAmount } from "../../../utils/stringBuilder";
import {
  pagoPaApiUrlPrefix,
  pagoPaApiUrlPrefixTest,
  payPalEnabled
} from "../../../config";
import { H4 } from "../../../components/core/typography/H4";
import { isPagoPATestEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { paymentOutcomeCode } from "../../../store/actions/wallet/outcomeCode";
import { outcomeCodesSelector } from "../../../store/reducers/wallet/outcomeCode";
import { isPaymentOutcomeCodeSuccessfully } from "../../../utils/payment";
import { fetchTransactionsRequestWithExpBackoff } from "../../../store/actions/wallet/transactions";
import { OutcomeCodesKey } from "../../../types/outcomeCode";
import { getLookUpIdPO } from "../../../utils/pmLookUpId";
import { Link } from "../../../components/core/typography/Link";
import { paymentMethodByIdSelector } from "../../../store/reducers/wallet/wallets";
import CreditCardComponent from "../../../features/wallet/creditCard/component/CreditCardComponent";
import PaypalCard from "../../../features/wallet/paypal/PaypalCard";
import { PayPalCheckoutPspComponent } from "../../../features/wallet/paypal/component/PayPalCheckoutPspComponent";

export type NavigationParams = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
  verifica: PaymentRequestsGetResponse;
  idPayment: string;
  wallet: Wallet;
  psps: ReadonlyArray<Psp>;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  LightModalContextInterface &
  OwnProps;

const styles = StyleSheet.create({
  child: {
    flex: 1,
    alignContent: "center"
  },
  childTwice: {
    flex: 2,
    alignContent: "center"
  },
  parent: {
    flexDirection: "row"
  },
  paddedLR: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  },
  textRight: {
    textAlign: "right"
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: variables.brandGray
  },
  textCenter: {
    textAlign: "center"
  },
  padded: { paddingHorizontal: customVariables.contentPadding },
  flex: { flex: 1 }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.whyAFee.title",
  body: "wallet.whyAFee.text"
};

const payUrlSuffix = "/v3/webview/transactions/pay";
const webViewExitPathName = "/v3/webview/logout/bye";
const webViewOutcomeParamName = "outcome";

const PaymentMethodCard = (props: {
  paymentMethod: PaymentMethod | undefined;
}) => {
  const { paymentMethod } = props;
  switch (paymentMethod?.kind) {
    case "CreditCard":
      return <CreditCardComponent creditCard={paymentMethod} />;
    case "PayPal":
      if (payPalEnabled) {
        return <PaypalCard paypal={paymentMethod} />;
      }
      return null;
    // those methods can't pay
    case "Satispay":
    case "Bancomat":
    case "BPay":
    case "Privative":
    case undefined:
      return null;
  }
};

const ConfirmPaymentMethodScreen: React.FC<Props> = (props: Props) => {
  React.useEffect(() => {
    // show a toast if we got an error while retrieving pm session token
    if (props.retrievingSessionTokenError.isSome()) {
      showToast(I18n.t("global.actions.retry"));
    }
  }, [props.retrievingSessionTokenError]);

  const showHelp = () => {
    props.showModal(
      <ContextualInfo
        onClose={props.hideModal}
        title={I18n.t("wallet.whyAFee.title")}
        body={() => <Markdown>{I18n.t("wallet.whyAFee.text")}</Markdown>}
      />
    );
  };
  const urlPrefix = props.isPagoPATestEnabled
    ? pagoPaApiUrlPrefixTest
    : pagoPaApiUrlPrefix;

  const verifica: PaymentRequestsGetResponse =
    props.navigation.getParam("verifica");
  const wallet: Wallet = props.navigation.getParam("wallet");
  const idPayment: string = props.navigation.getParam("idPayment");
  const paymentReason = verifica.causaleVersamento;
  const maybePsp = fromNullable(wallet.psp);
  const isPayingWithPaypal = isRawPayPal(wallet.paymentMethod);
  // each payment method has its own psp fee
  const fee: number | undefined = isPayingWithPaypal
    ? props.payPalPsp?.fee
    : maybePsp.fold(undefined, psp => psp.fixedCost.amount);

  const totalAmount =
    (verifica.importoSingoloVersamento as number) + (fee ?? 0);

  // emit an event to inform the pay web view finished
  // dispatch the outcome code and navigate to payment outcome code screen
  const handlePaymentOutcome = (maybeOutcomeCode: Option<string>) => {
    // the outcome is a payment done successfully
    if (
      maybeOutcomeCode.isSome() &&
      isPaymentOutcomeCodeSuccessfully(
        maybeOutcomeCode.value,
        props.outcomeCodes
      )
    ) {
      // store the rptid of a payment done
      props.dispatchPaymentCompleteSuccessfully(
        props.navigation.getParam("rptId")
      );
      // refresh transactions list
      props.loadTransactions();
    } else {
      props.dispatchPaymentFailure(
        maybeOutcomeCode.filter(OutcomeCodesKey.is).toUndefined(),
        idPayment
      );
    }
    props.dispatchEndPaymentWebview("EXIT_PATH");
    props.dispatchPaymentOutCome(maybeOutcomeCode);
    props.navigateToOutComePaymentScreen((fee ?? 0) as ImportoEuroCents);
  };

  // the user press back during the pay web view challenge
  const handlePayWebviewGoBack = () => {
    Alert.alert(I18n.t("payment.abortWebView.title"), "", [
      {
        text: I18n.t("payment.abortWebView.confirm"),
        onPress: () => {
          props.dispatchCancelPayment();
          props.dispatchEndPaymentWebview("USER_ABORT");
        },
        style: "cancel"
      },
      {
        text: I18n.t("payment.abortWebView.cancel")
      }
    ]);
  };

  const formData = props.payStartWebviewPayload
    .map<Record<string, string | number>>(payload => ({
      ...payload,
      ...getLookUpIdPO()
    }))
    .getOrElse({});
  const paymentMethod = props.getPaymentMethodById(wallet.idWallet);
  const ispaymentMethodCreditCard =
    paymentMethod !== undefined && isCreditCard(paymentMethod);
  return (
    <BaseScreenComponent
      goBack={props.onCancel}
      headerTitle={I18n.t("wallet.ConfirmPayment.header")}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["payment"]}
    >
      <Content noPadded={true} bounces={false}>
        <PaymentBannerComponent
          currentAmount={verifica.importoSingoloVersamento}
          paymentReason={paymentReason}
          fee={fee as ImportoEuroCents}
        />
        <View style={styles.padded}>
          <View spacer={true} />
          <PaymentMethodCard
            paymentMethod={props.getPaymentMethodById(wallet.idWallet)}
          />
          {/* show the ability to change psp only when the payment method is a credit card */}
          {!isPayingWithPaypal && (
            <>
              <View spacer={true} />
              {maybePsp.isNone() ? (
                <H4 weight={"Regular"}>{I18n.t("payment.noPsp")}</H4>
              ) : (
                <H4 weight={"Regular"}>
                  {I18n.t("payment.currentPsp")}
                  <H4>{` ${maybePsp.value.businessName}`}</H4>
                </H4>
              )}
              <Link onPress={props.pickPsp} weight={"Bold"}>
                {I18n.t("payment.changePsp")}
              </Link>
              <View spacer={true} large={true} />
              <Link onPress={showHelp} testID="why-a-fee">
                {I18n.t("wallet.whyAFee.title")}
              </Link>
            </>
          )}
          {isPayingWithPaypal && (
            <>
              <View spacer={true} />
              <PayPalCheckoutPspComponent
                fee={fee as ImportoEuroCents}
                pspName={props.payPalPsp?.ragioneSociale ?? "-"}
                privacyUrl={props.payPalPsp?.privacyUrl}
              />
            </>
          )}
        </View>
      </Content>

      <View footer={true}>
        <ButtonDefaultOpacity
          block={true}
          primary={true}
          // a payment is running
          disabled={props.payStartWebviewPayload.isSome()}
          onPress={() =>
            props.dispatchPaymentStart({
              idWallet: wallet.idWallet,
              idPayment,
              language: getLocalePrimaryWithFallback()
            })
          }
        >
          <Text>{`${I18n.t(
            "wallet.ConfirmPayment.goToPay"
          )} ${formatNumberCentsToAmount(totalAmount, true)}`}</Text>
        </ButtonDefaultOpacity>
        <View spacer={true} />
        <View style={styles.parent}>
          <ButtonDefaultOpacity
            style={styles.child}
            block={true}
            cancel={true}
            onPress={props.onCancel}
            testID={"cancelPaymentButton"}
          >
            <Text>{I18n.t("global.buttons.cancel")}</Text>
          </ButtonDefaultOpacity>
          <View hspacer={true} />
          <ButtonDefaultOpacity
            style={styles.childTwice}
            block={true}
            bordered={true}
            onPress={props.pickPaymentMethod}
          >
            <Text>{I18n.t("wallet.ConfirmPayment.change")}</Text>
          </ButtonDefaultOpacity>
        </View>
      </View>
      {props.payStartWebviewPayload.isSome() && (
        <PayWebViewModal
          postUri={urlPrefix + payUrlSuffix}
          formData={formData}
          showInfoHeader={ispaymentMethodCreditCard}
          finishPathName={webViewExitPathName}
          onFinish={handlePaymentOutcome}
          outcomeQueryparamName={webViewOutcomeParamName}
          onGoBack={handlePayWebviewGoBack}
          modalHeaderTitle={I18n.t("wallet.challenge3ds.header")}
        />
      )}
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => {
  const pmSessionToken = pmSessionTokenSelector(state);
  const paymentStartPayload = paymentStartPayloadSelector(state);
  const payPalPsp = getValueOrElse(pspV2Selector(state), []).find(
    psp => psp.defaultPsp
  );
  const payStartWebviewPayload: Option<PaymentStartWebViewPayload> =
    isReady(pmSessionToken) && paymentStartPayload
      ? some({ ...paymentStartPayload, sessionToken: pmSessionToken.value })
      : none;
  return {
    payPalPsp,
    getPaymentMethodById: (idWallet: number) =>
      paymentMethodByIdSelector(state, idWallet),
    isPagoPATestEnabled: isPagoPATestEnabledSelector(state),
    outcomeCodes: outcomeCodesSelector(state),
    payStartWebviewPayload,
    isLoading: isLoading(pmSessionToken),
    retrievingSessionTokenError: isError(pmSessionToken)
      ? some(pmSessionToken.error.message)
      : none
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => {
  const dispatchCancelPayment = () => {
    dispatch(abortRunningPayment());
    showToast(I18n.t("wallet.ConfirmPayment.cancelPaymentSuccess"), "success");
  };
  return {
    pickPaymentMethod: () =>
      navigateToPaymentPickPaymentMethodScreen({
        rptId: props.navigation.getParam("rptId"),
        initialAmount: props.navigation.getParam("initialAmount"),
        verifica: props.navigation.getParam("verifica"),
        idPayment: props.navigation.getParam("idPayment")
      }),
    pickPsp: () =>
      navigateToPaymentPickPspScreen({
        rptId: props.navigation.getParam("rptId"),
        initialAmount: props.navigation.getParam("initialAmount"),
        verifica: props.navigation.getParam("verifica"),
        idPayment: props.navigation.getParam("idPayment"),
        psps: props.navigation.getParam("psps"),
        wallet: props.navigation.getParam("wallet"),
        chooseToChange: true
      }),
    onCancel: () => {
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
            dispatchCancelPayment();
          }
        }
      );
    },
    dispatchPaymentStart: (
      payload: PayloadForAction<typeof paymentExecuteStart["request"]>
    ) => dispatch(paymentExecuteStart.request(payload)),
    dispatchEndPaymentWebview: (reason: PaymentWebViewEndReason) => {
      dispatch(paymentWebViewEnd(reason));
    },
    dispatchCancelPayment,
    dispatchPaymentOutCome: (outComeCode: Option<string>) =>
      dispatch(paymentOutcomeCode(outComeCode)),
    navigateToOutComePaymentScreen: (fee: ImportoEuroCents) =>
      navigateToPaymentOutcomeCode({ fee }),
    loadTransactions: () =>
      dispatch(fetchTransactionsRequestWithExpBackoff({ start: 0 })),

    dispatchPaymentCompleteSuccessfully: (rptId: RptId) =>
      dispatch(
        paymentCompletedSuccess({
          kind: "COMPLETED",
          rptId,
          transaction: undefined
        })
      ),
    dispatchPaymentFailure: (
      outcomeCode: OutcomeCodesKey | undefined,
      paymentId: string
    ) => dispatch(paymentCompletedFailure({ outcomeCode, paymentId }))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(withLoadingSpinner(ConfirmPaymentMethodScreen)));
