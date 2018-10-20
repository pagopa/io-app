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
import { InstabugButtons } from "../../../components/InstabugButtons";
import { WalletStyles } from "../../../components/styles/wallet";
import AppHeader from "../../../components/ui/AppHeader";
import CardComponent from "../../../components/wallet/card/CardComponent";
import PaymentBannerComponent from "../../../components/wallet/PaymentBannerComponent";
import I18n from "../../../i18n";
import { identificationRequest } from "../../../store/actions/identification";
import { navigateToWalletTransactionsScreen } from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import {
  paymentRequestCancel,
  paymentRequestCompletion,
  paymentRequestGoBack,
  paymentRequestPickPaymentMethod,
  paymentRequestPickPsp,
  paymentRequestTransactionSummaryFromBanner
} from "../../../store/actions/wallet/payment";
import { feeForWallet } from "../../../store/reducers/wallet/wallets";
import { Psp, Wallet } from "../../../types/pagopa";
import { UNKNOWN_AMOUNT } from "../../../types/unknown";
import { AmountToImporto } from "../../../utils/amounts";
import { formatNumberAmount } from "../../../utils/stringBuilder";

type NavigationParams = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
  verifica: PaymentRequestsGetResponse;
  paymentId: string;
  wallet: Wallet;
  psps: ReadonlyArray<Psp>;
}>;

type ReduxMappedDispatchProps = Readonly<{
  pickPaymentMethod: () => void;
  pickPsp: (
    wallet: Wallet,
    pspList: ReadonlyArray<Psp>,
    paymentId: string
  ) => void;
  goBack: () => void;
  showSummary: () => void;
  onCancel: () => void;
  requestIdentification: (wallet: Wallet, paymentId: string) => void;
}>;

type Props = ReduxMappedDispatchProps &
  NavigationInjectedProps<NavigationParams>;

const styles = StyleSheet.create({
  child: {
    flex: 1,
    alignContent: "center"
  },
  parent: {
    flexDirection: "row"
  }
});

class ConfirmPaymentMethodScreen extends React.Component<Props, never> {
  public render(): React.ReactNode {
    const verifica = this.props.navigation.getParam("verifica");
    const paymentId = this.props.navigation.getParam("paymentId");
    const wallet = this.props.navigation.getParam("wallet");
    const psps = this.props.navigation.getParam("psps");

    const currentAmount = AmountToImporto.encode(
      verifica.importoSingoloVersamento
    );

    const walletFee = AmountInEuroCentsFromNumber.encode(
      feeForWallet(wallet).getOrElse(UNKNOWN_AMOUNT)
    );

    const totalAmount =
      AmountInEuroCentsFromNumber.encode(currentAmount) + walletFee;

    const paymentReason = verifica.causaleVersamento;

    const recipient = verifica.enteBeneficiario;

    return (
      <Container>
        <AppHeader>
          <Left>
            <GoBackButton onPress={this.props.goBack} />
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
            recipient={recipient}
          />
          <View style={WalletStyles.paddedLR}>
            <View spacer={true} extralarge={true} />
            <H1>{I18n.t("wallet.ConfirmPayment.askConfirm")}</H1>
            <View spacer={true} />
            <CardComponent
              wallet={wallet}
              menu={false}
              showFavoriteIcon={false}
              lastUsage={false}
              navigateToWalletTransactions={(selectedWallet: Wallet) =>
                this.props.navigation.dispatch(
                  navigateToWalletTransactionsScreen({ selectedWallet })
                )
              }
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
                    {formatNumberAmount(walletFee)}
                  </Text>
                </Col>
              </Row>
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
                    {/* TODO: the proper UI needs to be defined for changing PSP */}
                    {wallet.psp !== undefined
                      ? `${I18n.t("payment.currentPsp")} ${
                          wallet.psp.businessName
                        } `
                      : I18n.t("payment.noPsp")}
                    <Text
                      link={true}
                      onPress={() =>
                        this.props.pickPsp(wallet, psps, paymentId)
                      }
                    >
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
            onPress={() => this.props.requestIdentification(wallet, paymentId)}
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
              onPress={this.props.showSummary}
            >
              <Text>{I18n.t("global.buttons.cancel")}</Text>
            </Button>
          </View>
        </View>
      </Container>
    );
  }
}

const mapDispatchToProps = (
  dispatch: Dispatch,
  props: NavigationInjectedProps<NavigationParams>
): ReduxMappedDispatchProps => ({
  pickPaymentMethod: () =>
    dispatch(
      paymentRequestPickPaymentMethod({
        rptId: props.navigation.getParam("rptId"),
        initialAmount: props.navigation.getParam("initialAmount"),
        verifica: props.navigation.getParam("verifica"),
        paymentId: props.navigation.getParam("paymentId")
      })
    ),
  goBack: () => dispatch(paymentRequestGoBack()),
  pickPsp: (wallet: Wallet, pspList: ReadonlyArray<Psp>, paymentId: string) =>
    dispatch(
      paymentRequestPickPsp({
        wallet,
        pspList,
        paymentId,
        rptId: props.navigation.getParam("rptId"),
        initialAmount: props.navigation.getParam("initialAmount"),
        verifica: props.navigation.getParam("verifica")
      })
    ),
  showSummary: () => dispatch(paymentRequestTransactionSummaryFromBanner()),
  onCancel: () => dispatch(paymentRequestCancel()),
  requestIdentification: (wallet: Wallet, paymentId: string) =>
    dispatch(
      identificationRequest(
        {
          action: paymentRequestCancel(),
          label: I18n.t("wallet.ConfirmPayment.cancelPayment")
        },
        {
          action: paymentRequestCompletion({ wallet, paymentId })
        }
      )
    )
});

export default connect(
  undefined,
  mapDispatchToProps
)(ConfirmPaymentMethodScreen);
