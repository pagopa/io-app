import { fromNullable, none } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-pagopa-commons/lib/pagopa";
import { ActionSheet, Content, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { ImportoEuroCents } from "../../../../definitions/backend/ImportoEuroCents";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { ContextualHelp } from "../../../components/ContextualHelp";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { withErrorModal } from "../../../components/helpers/withErrorModal";
import { withLightModalContext } from "../../../components/helpers/withLightModalContext";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import IconFont from "../../../components/ui/IconFont";
import { LightModalContextInterface } from "../../../components/ui/LightModal";
import Markdown from "../../../components/ui/Markdown";
import CardComponent from "../../../components/wallet/card/CardComponent";
import PaymentBannerComponent from "../../../components/wallet/PaymentBannerComponent";
import { shufflePinPadOnPayment } from "../../../config";
import I18n from "../../../i18n";
import { identificationRequest } from "../../../store/actions/identification";
import {
  navigateToPaymentPickPaymentMethodScreen,
  navigateToPaymentPickPspScreen,
  navigateToTransactionSuccessScreen
} from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import {
  backToEntrypointPayment,
  paymentCompletedFailure,
  paymentCompletedSuccess,
  PaymentStartPayload,
  paymentExecuteStart,
  paymentInitializeState,
  runDeleteActivePaymentSaga
} from "../../../store/actions/wallet/payment";
import { fetchTransactionsRequest } from "../../../store/actions/wallet/transactions";
import { GlobalState } from "../../../store/reducers/types";
import variables from "../../../theme/variables";
import customVariables from "../../../theme/variables";
import {
  isSuccessTransaction,
  Psp,
  Transaction,
  Wallet
} from "../../../types/pagopa";
import { showToast } from "../../../utils/showToast";
import { getLocalePrimaryWithFallback } from "../../../utils/locale";

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
  alert: {
    backgroundColor: customVariables.brandHighLighter,
    paddingHorizontal: customVariables.contentPadding,
    paddingVertical: 11,
    flexDirection: "row"
  },
  alertIcon: {
    alignSelf: "center",
    paddingRight: 18
  },
  flex: { flex: 1 },
  textColor: { color: customVariables.brandDarkGray }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.whyAFee.title",
  body: "wallet.whyAFee.text"
};

const ConfirmPaymentMethodScreen: React.FC<Props> = (props: Props) => {
  const showHelp = () => {
    props.showModal(
      <ContextualHelp
        onClose={props.hideModal}
        title={I18n.t("wallet.whyAFee.title")}
        body={() => <Markdown>{I18n.t("wallet.whyAFee.text")}</Markdown>}
      />
    );
  };

  const askAuthorizationAndStartPayment = () => {
    const onIdentificationSuccess = async () => {
      const paymentPayload: PaymentStartPayload = {
        idWallet: props.navigation.getParam("wallet").idWallet,
        idPayment: props.navigation.getParam("idPayment"),
        language: getLocalePrimaryWithFallback()
      };
      props.dispathPaymentExecuteStart(paymentPayload);
    };
    props.dispatchIdentificationRequestToStartPayment(onIdentificationSuccess);
  };

  const verifica: PaymentRequestsGetResponse = props.navigation.getParam(
    "verifica"
  );

  const wallet: Wallet = props.navigation.getParam("wallet");

  const paymentReason = verifica.causaleVersamento;

  const fee = fromNullable(wallet.psp).fold(
    undefined,
    psp => psp.fixedCost.amount
  );

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
          <CardComponent
            type={"Full"}
            wallet={wallet}
            hideMenu={true}
            hideFavoriteIcon={true}
          />
          <View spacer={true} />
          {wallet.psp === undefined ? (
            <Text>{I18n.t("payment.noPsp")}</Text>
          ) : (
            <Text>
              {I18n.t("payment.currentPsp")}
              <Text bold={true}>{` ${wallet.psp.businessName}`}</Text>
            </Text>
          )}
          <TouchableDefaultOpacity onPress={props.pickPsp}>
            <Text link={true} bold={true}>
              {I18n.t("payment.changePsp")}
            </Text>
          </TouchableDefaultOpacity>
          <View spacer={true} large={true} />
          <TouchableDefaultOpacity testID="why-a-fee" onPress={showHelp}>
            <Text link={true}>{I18n.t("wallet.whyAFee.title")}</Text>
          </TouchableDefaultOpacity>
        </View>
      </Content>

      <View style={styles.alert}>
        <IconFont
          style={styles.alertIcon}
          name={"io-notice"}
          size={24}
          color={customVariables.brandDarkGray}
        />
        <Text style={[styles.flex, styles.textColor]}>
          <Text bold={true}>{I18n.t("global.genericAlert")}</Text>
          {` ${I18n.t("wallet.ConfirmPayment.info")}`}
        </Text>
      </View>

      <View footer={true}>
        <ButtonDefaultOpacity
          block={true}
          primary={true}
          onPress={askAuthorizationAndStartPayment}
        >
          <Text>{I18n.t("wallet.ConfirmPayment.goToPay")}</Text>
        </ButtonDefaultOpacity>
        <View spacer={true} />
        <View style={styles.parent}>
          <ButtonDefaultOpacity
            style={styles.child}
            block={true}
            cancel={true}
            onPress={props.onCancel}
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
    </BaseScreenComponent>
  );
};

const mapStateToProps = ({ wallet }: GlobalState) => ({
  isLoading: false, // pot.isLoading(wallet.payment.transaction),
  // || pot.isLoading(wallet.payment.confirmedTransaction),
  error: none // pot.isError(wallet.payment.transaction)
  // ? some(wallet.payment.transaction.error.message)
  // : none
});

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => {
  const onTransactionTimeout = () => {
    dispatch(backToEntrypointPayment());
    showToast(I18n.t("wallet.ConfirmPayment.transactionTimeout"), "warning");
  };

  const onTransactionValid = (tx: Transaction) => {
    if (isSuccessTransaction(tx)) {
      // on success:
      dispatch(
        navigateToTransactionSuccessScreen({
          transaction: tx
        })
      );
      // signal success
      dispatch(
        paymentCompletedSuccess({
          transaction: tx,
          rptId: props.navigation.getParam("rptId"),
          kind: "COMPLETED"
        })
      );
      // update the transactions state (the first transaction is the most recent)
      dispatch(fetchTransactionsRequest({ start: 0 }));
    } else {
      // on failure:
      // signal faliure
      dispatch(paymentCompletedFailure());
      // delete the active payment from pagoPA
      dispatch(runDeleteActivePaymentSaga());
      // navigate to entrypoint of payment or wallet home
      dispatch(backToEntrypointPayment());
      showToast(I18n.t("wallet.ConfirmPayment.transactionFailure"), "danger");
    }
  };

  return {
    pickPaymentMethod: () =>
      dispatch(
        navigateToPaymentPickPaymentMethodScreen({
          rptId: props.navigation.getParam("rptId"),
          initialAmount: props.navigation.getParam("initialAmount"),
          verifica: props.navigation.getParam("verifica"),
          idPayment: props.navigation.getParam("idPayment")
        })
      ),
    pickPsp: () =>
      dispatch(
        navigateToPaymentPickPspScreen({
          rptId: props.navigation.getParam("rptId"),
          initialAmount: props.navigation.getParam("initialAmount"),
          verifica: props.navigation.getParam("verifica"),
          idPayment: props.navigation.getParam("idPayment"),
          psps: props.navigation.getParam("psps"),
          wallet: props.navigation.getParam("wallet"),
          chooseToChange: true
        })
      ),
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
            // on cancel:
            // navigate to entrypoint of payment or wallet home
            dispatch(backToEntrypointPayment());
            // delete the active payment from pagoPA
            dispatch(runDeleteActivePaymentSaga());
            // reset the payment state
            dispatch(paymentInitializeState());
            showToast(
              I18n.t("wallet.ConfirmPayment.cancelPaymentSuccess"),
              "success"
            );
          }
        }
      );
    },
    dispathPaymentExecuteStart: (payload: PaymentStartPayload) =>
      dispatch(paymentExecuteStart(payload)),
    dispatchIdentificationRequestToStartPayment: (
      onIdentificationSuccess: () => void
    ) =>
      dispatch(
        identificationRequest(
          false,
          true,
          {
            message: I18n.t("wallet.ConfirmPayment.identificationMessage")
          },
          {
            label: I18n.t("wallet.ConfirmPayment.cancelPayment"),
            onCancel: () => undefined
          },
          {
            onSuccess: onIdentificationSuccess
          },
          shufflePinPadOnPayment
        )
      )
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withLightModalContext(
    withErrorModal(
      withLoadingSpinner(ConfirmPaymentMethodScreen),
      (_: string) => _
    )
  )
);
