import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import {
  AmountInEuroCents,
  AmountInEuroCentsFromNumber,
  RptId
} from "italia-pagopa-commons/lib/pagopa";
import * as pot from "italia-ts-commons/lib/pot";
import {
  ActionSheet,
  Body,
  Button,
  Container,
  Content,
  H1,
  Left,
  Right,
  Text,
  View
} from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import GoBackButton from "../../../components/GoBackButton";
import {
  ContextualHelpInjectedProps,
  withContextualHelp
} from "../../../components/helpers/withContextualHelp";
import { withErrorModal } from "../../../components/helpers/withErrorModal";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import { InstabugButtons } from "../../../components/InstabugButtons";
import { WalletStyles } from "../../../components/styles/wallet";
import AppHeader from "../../../components/ui/AppHeader";
import Markdown from "../../../components/ui/Markdown";
import CardComponent from "../../../components/wallet/card/CardComponent";
import PaymentBannerComponent from "../../../components/wallet/PaymentBannerComponent";
import I18n from "../../../i18n";
import { identificationRequest } from "../../../store/actions/identification";
import {
  navigateToPaymentPickPaymentMethodScreen,
  navigateToPaymentPickPspScreen,
  navigateToTransactionDetailsScreen,
  navigateToWalletHome
} from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import {
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
import {
  isCompletedTransaction,
  isSuccessTransaction,
  Psp,
  Transaction,
  Wallet
} from "../../../types/pagopa";
import { UNKNOWN_RECIPIENT } from "../../../types/unknown";
import { AmountToImporto } from "../../../utils/amounts";
import { showToast } from "../../../utils/showToast";
import { formatNumberAmount } from "../../../utils/stringBuilder";

type NavigationParams = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
  verifica: PaymentRequestsGetResponse;
  idPayment: string;
  wallet: Wallet;
  psps: ReadonlyArray<Psp>;
}>;

type ReduxMappedStateProps = Readonly<{
  isLoading: boolean;
  error: Option<string>;
}>;

type ReduxMappedDispatchProps = Readonly<{
  pickPaymentMethod: () => void;
  pickPsp: () => void;
  onCancel: () => void;
  onRetry: () => void;
  runAuthorizationAndPayment: () => void;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = ReduxMappedStateProps &
  ReduxMappedDispatchProps &
  ContextualHelpInjectedProps &
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
  }
});

/**
 * Returns the fee for a wallet that has a preferred psp
 */
const feeForWallet = (w: Wallet): Option<AmountInEuroCents> =>
  fromNullable(w.psp).map(
    psp => ("0".repeat(10) + `${psp.fixedCost.amount}`) as AmountInEuroCents
  );

class ConfirmPaymentMethodScreen extends React.Component<Props, never> {
  public render(): React.ReactNode {
    const verifica = this.props.navigation.getParam("verifica");
    const wallet = this.props.navigation.getParam("wallet");

    const currentAmount = AmountToImporto.encode(
      verifica.importoSingoloVersamento
    );

    // FIXME: it seems like we're converting a number to a string and vice versa
    const maybeWalletFee = feeForWallet(wallet).map(
      AmountInEuroCentsFromNumber.encode
    );

    const currentAmountDecoded = AmountInEuroCentsFromNumber.encode(
      currentAmount
    );
    const totalAmount = maybeWalletFee
      // tslint:disable-next-line:restrict-plus-operands
      .map(walletFee => currentAmountDecoded + walletFee)
      .getOrElse(currentAmountDecoded);

    const paymentReason = verifica.causaleVersamento;

    const recipient = verifica.enteBeneficiario;

    return (
      <Container>
        <AppHeader>
          <Left>
            <GoBackButton />
          </Left>
          <Body>
            <Text>{I18n.t("wallet.ConfirmPayment.header")}</Text>
          </Body>
          <Right>
            <InstabugButtons />
          </Right>
        </AppHeader>

        <Content noPadded={true}>
          <PaymentBannerComponent
            currentAmount={currentAmount}
            paymentReason={paymentReason}
            recipient={recipient || UNKNOWN_RECIPIENT}
            onCancel={this.props.onCancel}
          />
          <View style={WalletStyles.paddedLR}>
            <View spacer={true} extralarge={true} />
            <H1>{I18n.t("wallet.ConfirmPayment.askConfirm")}</H1>
            <View spacer={true} />
            <Grid>
              <Row>
                <Col>
                  <Text>{I18n.t("wallet.ConfirmPayment.partialAmount")}</Text>
                </Col>
                <Col>
                  <Text bold={true} style={WalletStyles.textRight}>
                    {formatNumberAmount(
                      AmountInEuroCentsFromNumber.encode(currentAmount)
                    )}
                  </Text>
                </Col>
              </Row>
              {maybeWalletFee.isSome() && (
                <Row>
                  <Col size={4}>
                    <Text>
                      {`${I18n.t("wallet.ConfirmPayment.fee")} `}
                      <Text link={true} onPress={this.props.showHelp}>
                        {I18n.t("wallet.ConfirmPayment.why")}
                      </Text>
                    </Text>
                  </Col>

                  <Col size={1}>
                    <Text bold={true} style={WalletStyles.textRight}>
                      {formatNumberAmount(maybeWalletFee.value)}
                    </Text>
                  </Col>
                </Row>
              )}
              <View spacer={true} large={true} />
              <Row style={WalletStyles.divider}>
                <Col>
                  <View spacer={true} large={true} />
                  <H1>{I18n.t("wallet.ConfirmPayment.totalAmount")}</H1>
                </Col>
                <Col>
                  <View spacer={true} large={true} />
                  <H1 style={WalletStyles.textRight}>
                    {formatNumberAmount(totalAmount)}
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
                  <Text style={WalletStyles.textCenter}>
                    {wallet.psp !== undefined
                      ? `${I18n.t("payment.currentPsp")} ${
                          wallet.psp.businessName
                        } `
                      : I18n.t("payment.noPsp")}
                    <Text link={true} onPress={() => this.props.pickPsp()}>
                      {I18n.t("payment.changePsp")}
                    </Text>
                  </Text>
                  <View spacer={true} />
                </Col>
                <Col size={1} />
              </Row>
              <Row style={WalletStyles.divider}>
                <Col size={1} />
                <Col size={9}>
                  <View spacer={true} />

                  <Text style={WalletStyles.textCenter}>
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
          <Button
            block={true}
            primary={true}
            onPress={() => this.props.runAuthorizationAndPayment()}
          >
            <Text>{I18n.t("wallet.ConfirmPayment.goToPay")}</Text>
          </Button>
          <View spacer={true} />
          <View style={styles.parent}>
            <Button
              style={styles.child}
              block={true}
              cancel={true}
              onPress={this.props.onCancel}
            >
              <Text>{I18n.t("global.buttons.cancel")}</Text>
            </Button>
            <View hspacer={true} />
            <Button
              style={[styles.child, styles.childTwice]}
              block={true}
              light={true}
              bordered={true}
              onPress={_ => this.props.pickPaymentMethod()}
            >
              <Text>{I18n.t("wallet.ConfirmPayment.change")}</Text>
            </Button>
          </View>
        </View>
      </Container>
    );
  }
}

const mapStateToProps = ({ wallet }: GlobalState): ReduxMappedStateProps => ({
  isLoading:
    pot.isLoading(wallet.payment.transaction) ||
    pot.isLoading(wallet.payment.confirmedTransaction),
  error: pot.isError(wallet.payment.transaction)
    ? some(wallet.payment.transaction.error.message)
    : none
});

const mapDispatchToProps = (
  dispatch: Dispatch,
  props: OwnProps
): ReduxMappedDispatchProps => {
  const onTransactionTimeout = () => {
    dispatch(navigateToWalletHome());
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
      dispatch(fetchTransactionsRequest());
      // navigate to the resulting transaction details
      showToast(I18n.t("wallet.ConfirmPayment.transactionSuccess"), "success");
    } else {
      // on failure:
      // navigate to the wallet home
      dispatch(navigateToWalletHome());
      // signal faliure
      dispatch(paymentCompletedFailure());
      // delete the active payment from PagoPA
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
            // navigate to the wallet home
            dispatch(navigateToWalletHome());
            // delete the active payment from PagoPA
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
  withContextualHelp(
    withErrorModal(
      withLoadingSpinner(ConfirmPaymentMethodScreen),
      (_: string) => _
    ),
    I18n.t("wallet.whyAFee.title"),
    () => (
      <Markdown lazyOptions={{ lazy: true }}>
        {I18n.t("wallet.whyAFee.text")}
      </Markdown>
    )
  )
);
