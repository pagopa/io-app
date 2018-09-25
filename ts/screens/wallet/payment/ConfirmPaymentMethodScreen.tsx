/**
 * This screen asks the authorization to proceed with the transaction.
 * TODO:
 * - integrate contextual help:
 *    https://www.pivotaltracker.com/n/projects/2048617/stories/157874540
 * - "back" & "cancel" behavior to be implemented @https://www.pivotaltracker.com/story/show/159229087
 *
 */
import {
  AmountInEuroCents,
  AmountInEuroCentsFromNumber
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
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import GoBackButton from "../../../components/GoBackButton";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import { InstabugButtons } from "../../../components/InstabugButtons";
import { WalletStyles } from "../../../components/styles/wallet";
import AppHeader from "../../../components/ui/AppHeader";
import CardComponent from "../../../components/wallet/card";
import PaymentBannerComponent from "../../../components/wallet/PaymentBannerComponent";
import I18n from "../../../i18n";
import { Dispatch } from "../../../store/actions/types";
import {
  paymentRequestCompletion,
  paymentRequestGoBack,
  paymentRequestPickPaymentMethod,
  paymentRequestPickPsp
} from "../../../store/actions/wallet/payment";
import { paymentRequestTransactionSummaryFromBanner } from "../../../store/actions/wallet/payment";
import { createLoadingSelector } from "../../../store/reducers/loading";
import { GlobalState } from "../../../store/reducers/types";
import {
  getCurrentAmount,
  getPaymentStep,
  isGlobalStateWithSelectedPaymentMethod,
  selectedPaymentMethodSelector
} from "../../../store/reducers/wallet/payment";
import { feeExtractor } from "../../../store/reducers/wallet/wallets";
import { Wallet } from "../../../types/pagopa";
import { UNKNOWN_AMOUNT } from "../../../types/unknown";
import { buildAmount } from "../../../utils/stringBuilder";

type ReduxMappedStateProps =
  | Readonly<{
      valid: false;
    }>
  | Readonly<{
      valid: true;
      wallet: Wallet;
      amount: AmountInEuroCents;
      fee: AmountInEuroCents;
    }>;

type ReduxMappedDispatchProps = Readonly<{
  pickPaymentMethod: () => void;
  pickPsp: () => void;
  requestCompletion: () => void;
  goBack: () => void;
  showSummary: () => void;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReduxMappedStateProps & ReduxMappedDispatchProps;

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
  private getTotalAmount(amount: number, fee: number) {
    return amount + fee;
  }

  public shouldComponentUpdate(nextProps: Props) {
    // avoids updating the component on invalid props to avoid having the screen
    // become blank during transitions from one payment state to another
    // FIXME: this is quite fragile, we should instead avoid having a shared state
    return nextProps.valid;
  }

  public render(): React.ReactNode {
    if (!this.props.valid) {
      return null;
    }

    const amount = AmountInEuroCentsFromNumber.encode(this.props.amount);
    const fee = AmountInEuroCentsFromNumber.encode(this.props.fee);
    const totalAmount = this.getTotalAmount(amount, fee);
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
          <PaymentBannerComponent navigation={this.props.navigation} />
          <View style={WalletStyles.paddedLR}>
            <View spacer={true} extralarge={true} />
            <H1>{I18n.t("wallet.ConfirmPayment.askConfirm")}</H1>
            <View spacer={true} />
            <CardComponent
              navigation={this.props.navigation}
              item={this.props.wallet}
              menu={false}
              favorite={false}
              lastUsage={false}
            />
            <View spacer={true} large={true} />
            <Grid>
              <Row>
                <Col>
                  <Text>{I18n.t("wallet.ConfirmPayment.partialAmount")}</Text>
                </Col>
                <Col>
                  <Text bold={true} style={WalletStyles.textRight}>
                    {buildAmount(amount)}
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
                    {buildAmount(fee)}
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
                    {buildAmount(totalAmount)}
                  </H1>
                </Col>
              </Row>
              <Row>
                <Col size={1} />
                <Col size={9}>
                  <View spacer={true} large={true} />
                  <Text style={WalletStyles.textCenter}>
                    {/* TODO: the proper UI needs to be defined for changing PSP */}
                    {this.props.wallet.psp !== undefined
                      ? `${I18n.t("payment.currentPsp")} ${
                          this.props.wallet.psp.businessName
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
            onPress={() => this.props.requestCompletion()}
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

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => {
  if (
    getPaymentStep(state) === "PaymentStateConfirmPaymentMethod" &&
    isGlobalStateWithSelectedPaymentMethod(state)
  ) {
    const wallet = selectedPaymentMethodSelector(state);
    const feeOrUndefined = feeExtractor(wallet);
    return {
      valid: true,
      wallet,
      amount: getCurrentAmount(state),
      fee: feeOrUndefined === undefined ? UNKNOWN_AMOUNT : feeOrUndefined
    };
  } else {
    return { valid: false };
  }
};

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  pickPaymentMethod: () => dispatch(paymentRequestPickPaymentMethod()),
  requestCompletion: () => dispatch(paymentRequestCompletion()),
  goBack: () => dispatch(paymentRequestGoBack()),
  pickPsp: () => dispatch(paymentRequestPickPsp()),
  showSummary: () => dispatch(paymentRequestTransactionSummaryFromBanner())
});

export default withLoadingSpinner(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ConfirmPaymentMethodScreen),
  createLoadingSelector(["PAYMENT_LOAD"]),
  {}
);
