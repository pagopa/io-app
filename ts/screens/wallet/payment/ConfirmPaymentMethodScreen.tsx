import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import {
  AmountInEuroCents,
  AmountInEuroCentsFromNumber,
  RptId
} from "italia-ts-commons/lib/pagopa";
import {
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
import { withErrorModal } from "../../../components/helpers/withErrorModal";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import { InstabugButtons } from "../../../components/InstabugButtons";
import { WalletStyles } from "../../../components/styles/wallet";
import AppHeader from "../../../components/ui/AppHeader";
import CardComponent from "../../../components/wallet/card/CardComponent";
import PaymentBannerComponent from "../../../components/wallet/PaymentBannerComponent";
import I18n from "../../../i18n";
import { identificationRequest } from "../../../store/actions/identification";
import {
  navigateToPaymentPickPaymentMethodScreen,
  navigateToPaymentPickPspScreen,
  navigateToPaymentTransactionSummaryScreen,
  navigateToTransactionDetailsScreen
} from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import { paymentExecutePaymentRequest } from "../../../store/actions/wallet/payment";
import { fetchTransactionsRequest } from "../../../store/actions/wallet/transactions";
import { GlobalState } from "../../../store/reducers/types";
import { Psp, Wallet } from "../../../types/pagopa";
import * as pot from "../../../types/pot";
import { UNKNOWN_RECIPIENT } from "../../../types/unknown";
import { AmountToImporto } from "../../../utils/amounts";
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

type Props = ReduxMappedStateProps & ReduxMappedDispatchProps & OwnProps;

const styles = StyleSheet.create({
  child: {
    flex: 1,
    alignContent: "center"
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
            <CardComponent
              wallet={wallet}
              type="Full"
              hideMenu={true}
              hideFavoriteIcon={true}
            />
            <View spacer={true} large={true} />
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
                      <Text link={true}>
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
              light={true}
              bordered={true}
              onPress={_ => this.props.pickPaymentMethod()}
            >
              <Text>{I18n.t("wallet.ConfirmPayment.change")}</Text>
            </Button>
            <View hspacer={true} />
            <Button
              style={styles.child}
              block={true}
              cancel={true}
              onPress={this.props.onCancel}
            >
              <Text>{I18n.t("global.buttons.cancel")}</Text>
            </Button>
          </View>
        </View>
      </Container>
    );
  }
}

const mapStateToProps = ({ wallet }: GlobalState): ReduxMappedStateProps => ({
  isLoading: pot.isLoading(wallet.payment.transaction),
  error: pot.isError(wallet.payment.transaction)
    ? some(wallet.payment.transaction.error.message)
    : none
});

const mapDispatchToProps = (
  dispatch: Dispatch,
  props: OwnProps
): ReduxMappedDispatchProps => {
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
          onSuccess: () => {
            dispatch(
              paymentExecutePaymentRequest({
                wallet: props.navigation.getParam("wallet"),
                idPayment: props.navigation.getParam("idPayment"),
                onSuccess: action => {
                  // on success, update the transactions and navigate to
                  // the resulting transaciton details
                  dispatch(fetchTransactionsRequest());
                  dispatch(
                    navigateToTransactionDetailsScreen({
                      isPaymentCompletedTransaction: true,
                      transaction: action.payload
                    })
                  );
                }
              })
            );
          }
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
    onCancel: () =>
      dispatch(
        navigateToPaymentTransactionSummaryScreen({
          rptId: props.navigation.getParam("rptId"),
          initialAmount: props.navigation.getParam("initialAmount")
        })
      ),
    runAuthorizationAndPayment,
    onRetry: runAuthorizationAndPayment
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withErrorModal(
    withLoadingSpinner(ConfirmPaymentMethodScreen),
    (_: string) => _
  )
);
