import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-pagopa-commons/lib/pagopa";
import * as pot from "italia-ts-commons/lib/pot";
import { ActionSheet, Content, H1, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { ContextualHelp } from "../../../components/ContextualHelp";
import { withErrorModal } from "../../../components/helpers/withErrorModal";
import { withLightModalContext } from "../../../components/helpers/withLightModalContext";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import { LightModalContextInterface } from "../../../components/ui/LightModal";
import Markdown from "../../../components/ui/Markdown";
import CardComponent from "../../../components/wallet/card/CardComponent";
import PaymentBannerComponent from "../../../components/wallet/PaymentBannerComponent";
import I18n from "../../../i18n";
import { identificationRequest } from "../../../store/actions/identification";
import {
  navigateToPaymentPickPaymentMethodScreen,
  navigateToPaymentPickPspScreen,
  navigateToTransactionDetailsScreen
} from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import {
  backToEntrypointPayment,
  paymentCompletedFailure,
  paymentCompletedSuccess,
  paymentExecutePayment,
  paymentInitializeState,
  runDeleteActivePaymentSaga
} from "../../../store/actions/wallet/payment";
import {
  fetchTransactionsRequest,
  runPollTransactionSaga
} from "../../../store/actions/wallet/transactions";
import { GlobalState } from "../../../store/reducers/types";
import variables from "../../../theme/variables";
import {
  isCompletedTransaction,
  isSuccessTransaction,
  Psp,
  Transaction,
  Wallet
} from "../../../types/pagopa";
import { showToast } from "../../../utils/showToast";
import { formatNumberCentsToAmount } from "../../../utils/stringBuilder";

type NavigationParams = Readonly<{
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
    flex: 2
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
  }
});

/**
 * Returns the fee for a wallet that has a preferred psp
 */
const feeForWallet = (w: Wallet): Option<number> =>
  fromNullable(w.psp).map(psp => psp.fixedCost.amount);

class ConfirmPaymentMethodScreen extends React.Component<Props, never> {
  private showHelp = () => {
    this.props.showModal(
      <ContextualHelp
        onClose={this.props.hideModal}
        title={I18n.t("wallet.whyAFee.title")}
        body={() => <Markdown>{I18n.t("wallet.whyAFee.text")}</Markdown>}
      />
    );
  };

  public render(): React.ReactNode {
    const verifica = this.props.navigation.getParam("verifica");
    const wallet = this.props.navigation.getParam("wallet");

    const currentAmount = verifica.importoSingoloVersamento;

    // FIXME: it seems like we're converting a number to a string and vice versa
    const maybeWalletFee = feeForWallet(wallet);

    const totalAmount = maybeWalletFee
      // tslint:disable-next-line:restrict-plus-operands
      .map(walletFee => currentAmount + walletFee)
      .getOrElse(currentAmount);

    const paymentReason = verifica.causaleVersamento;

    const recipient = verifica.enteBeneficiario;

    return (
      <BaseScreenComponent
        goBack={this.props.onCancel}
        headerTitle={I18n.t("wallet.ConfirmPayment.header")}
      >
        <Content noPadded={true}>
          <PaymentBannerComponent
            currentAmount={currentAmount}
            paymentReason={paymentReason}
            recipient={recipient}
            onCancel={this.props.onCancel}
          />
          <View style={styles.paddedLR}>
            <View spacer={true} extralarge={true} />
            <H1>{I18n.t("wallet.ConfirmPayment.askConfirm")}</H1>
            <View spacer={true} />
            <Grid>
              <Row>
                <Col>
                  <Text>{I18n.t("wallet.ConfirmPayment.partialAmount")}</Text>
                </Col>
                <Col>
                  <Text bold={true} style={styles.textRight}>
                    {formatNumberCentsToAmount(currentAmount)}
                  </Text>
                </Col>
              </Row>
              {maybeWalletFee.isSome() && (
                <Row>
                  <Col size={4}>
                    <Text>{`${I18n.t("wallet.ConfirmPayment.fee")} `}</Text>
                    <TouchableDefaultOpacity onPress={this.showHelp}>
                      <Text link={true}>
                        {I18n.t("wallet.ConfirmPayment.why")}
                      </Text>
                    </TouchableDefaultOpacity>
                  </Col>

                  <Col size={1}>
                    <Text bold={true} style={styles.textRight}>
                      {formatNumberCentsToAmount(maybeWalletFee.value)}
                    </Text>
                  </Col>
                </Row>
              )}
              <View spacer={true} large={true} />
              <Row style={styles.divider}>
                <Col>
                  <View spacer={true} large={true} />
                  <H1>{I18n.t("wallet.ConfirmPayment.totalAmount")}</H1>
                </Col>
                <Col>
                  <View spacer={true} large={true} />
                  <H1 style={styles.textRight}>
                    {formatNumberCentsToAmount(totalAmount)}
                  </H1>
                </Col>
              </Row>
              <View spacer={true} />
              <Row>
                <Col>
                  <CardComponent
                    type="Full"
                    wallet={wallet}
                    hideMenu={true}
                    hideFavoriteIcon={true}
                  />
                </Col>
              </Row>
              <Row>
                <Col size={1} />
                <Col size={9}>
                  <View spacer={true} large={true} />
                  <Text style={styles.textCenter}>
                    {wallet.psp !== undefined
                      ? `${I18n.t("payment.currentPsp")} ${
                          wallet.psp.businessName
                        } `
                      : I18n.t("payment.noPsp")}
                  </Text>
                  <TouchableDefaultOpacity onPress={this.props.pickPsp}>
                    <Text link={true}>{I18n.t("payment.changePsp")}</Text>
                  </TouchableDefaultOpacity>
                  <View spacer={true} />
                </Col>
                <Col size={1} />
              </Row>
              <Row style={styles.divider}>
                <Col size={1} />
                <Col size={9}>
                  <View spacer={true} />

                  <Text style={styles.textCenter}>
                    {I18n.t("wallet.ConfirmPayment.info")}
                  </Text>
                  <View spacer={true} extralarge={true} />
                </Col>
                <Col size={1} />
              </Row>
            </Grid>
          </View>
        </Content>

        <View footer={true}>
          <ButtonDefaultOpacity
            block={true}
            primary={true}
            onPress={() => this.props.runAuthorizationAndPayment()}
          >
            <Text>{I18n.t("wallet.ConfirmPayment.goToPay")}</Text>
          </ButtonDefaultOpacity>
          <View spacer={true} />
          <View style={styles.parent}>
            <ButtonDefaultOpacity
              style={styles.child}
              block={true}
              cancel={true}
              onPress={this.props.onCancel}
            >
              <Text>{I18n.t("global.buttons.cancel")}</Text>
            </ButtonDefaultOpacity>
            <View hspacer={true} />
            <ButtonDefaultOpacity
              style={[styles.child, styles.childTwice]}
              block={true}
              light={true}
              bordered={true}
              onPress={() => this.props.pickPaymentMethod()}
            >
              <Text>{I18n.t("wallet.ConfirmPayment.change")}</Text>
            </ButtonDefaultOpacity>
          </View>
        </View>
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = ({ wallet }: GlobalState) => ({
  isLoading:
    pot.isLoading(wallet.payment.transaction) ||
    pot.isLoading(wallet.payment.confirmedTransaction),
  error: pot.isError(wallet.payment.transaction)
    ? some(wallet.payment.transaction.error.message)
    : none
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
        navigateToTransactionDetailsScreen({
          isPaymentCompletedTransaction: true,
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
      // reset the payment state
      dispatch(paymentInitializeState());
      // update the transactions state
      dispatch(fetchTransactionsRequest({ start: 0 }));
      // navigate to the resulting transaction details
      showToast(I18n.t("wallet.ConfirmPayment.transactionSuccess"), "success");
    } else {
      // on failure:
      // navigate to entrypoint of payment or wallet home
      dispatch(backToEntrypointPayment());
      // signal faliure
      dispatch(paymentCompletedFailure());
      // delete the active payment from pagoPA
      dispatch(runDeleteActivePaymentSaga());
      // reset the payment state
      dispatch(paymentInitializeState());
      showToast(I18n.t("wallet.ConfirmPayment.transactionFailure"), "danger");
    }
  };

  const onIdentificationSuccess = () => {
    dispatch(
      paymentExecutePayment.request({
        wallet: props.navigation.getParam("wallet"),
        idPayment: props.navigation.getParam("idPayment"),
        onSuccess: action => {
          dispatch(
            runPollTransactionSaga({
              id: action.payload.id,
              isValid: isCompletedTransaction,
              onTimeout: onTransactionTimeout,
              onValid: onTransactionValid
            })
          );
        }
      })
    );
  };

  const runAuthorizationAndPayment = () =>
    dispatch(
      identificationRequest(
        false,
        {
          message: I18n.t("wallet.ConfirmPayment.identificationMessage")
        },
        {
          label: I18n.t("wallet.ConfirmPayment.cancelPayment"),
          onCancel: () => undefined
        },
        {
          onSuccess: onIdentificationSuccess
        }
      )
    );
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
          wallet: props.navigation.getParam("wallet")
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
    runAuthorizationAndPayment,
    onRetry: runAuthorizationAndPayment
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
