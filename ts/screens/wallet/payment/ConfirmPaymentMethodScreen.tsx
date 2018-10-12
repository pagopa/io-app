/**
 * This screen asks the authorization to proceed with the transaction.
 * TODO:
 * - integrate contextual help:
 *    https://www.pivotaltracker.com/n/projects/2048617/stories/157874540
 * - "back" & "cancel" behavior to be implemented @https://www.pivotaltracker.com/story/show/159229087
 *
 */
import { none, Option } from "fp-ts/lib/Option";
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
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import GoBackButton from "../../../components/GoBackButton";
import { withErrorModal } from "../../../components/helpers/withErrorModal";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import { InstabugButtons } from "../../../components/InstabugButtons";
import { WalletStyles } from "../../../components/styles/wallet";
import AppHeader from "../../../components/ui/AppHeader";
import CardComponent from "../../../components/wallet/card/CardComponent";
import PaymentBannerComponent from "../../../components/wallet/PaymentBannerComponent";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { Dispatch } from "../../../store/actions/types";
import { paymentRequestTransactionSummaryFromBanner } from "../../../store/actions/wallet/payment";
import {
  paymentRequestCancel,
  paymentRequestGoBack,
  paymentRequestPickPaymentMethod,
  paymentRequestPickPsp,
  paymentRequestPinLogin
} from "../../../store/actions/wallet/payment";
import { createErrorSelector } from "../../../store/reducers/error";
import { createLoadingSelector } from "../../../store/reducers/loading";
import { GlobalState } from "../../../store/reducers/types";
import {
  getCurrentAmountFromGlobalStateWithSelectedPaymentMethod,
  getPaymentIdFromGlobalStateWithSelectedPaymentMethod,
  getPaymentStep,
  getPspListFromGlobalStateWithSelectedPaymentMethod,
  getSelectedPaymentMethodFromGlobalStateWithSelectedPaymentMethod,
  isGlobalStateWithSelectedPaymentMethod
} from "../../../store/reducers/wallet/payment";
import { feeExtractor } from "../../../store/reducers/wallet/wallets";
import { mapErrorCodeToMessage } from "../../../types/errors";
import { Psp, Wallet } from "../../../types/pagopa";
import { UNKNOWN_AMOUNT } from "../../../types/unknown";
import { buildAmount } from "../../../utils/stringBuilder";

type NavigationParams = Readonly<{
  paymentCompleted: boolean;
}>;

type ReduxMappedStateProps = Readonly<{
  isLoading: boolean;
  error: Option<string>;
}> &
  (
    | Readonly<{
        valid: false;
      }>
    | Readonly<{
        valid: true;
        wallet: Wallet;
        amount: AmountInEuroCents;
        fee: AmountInEuroCents;
        paymentId: string;
        pspList: ReadonlyArray<Psp>;
      }>);

type ReduxMappedDispatchProps = Readonly<{
  pickPaymentMethod: (paymentId: string) => void;
  pickPsp: (
    wallet: Wallet,
    pspList: ReadonlyArray<Psp>,
    paymentId: string
  ) => void;
  // requestCompletion: () => void;
  requestPinLogin: (wallet: Wallet, paymentId: string) => void;
  goBack: () => void;
  showSummary: () => void;
  onCancel: () => void;
}>;

type Props = ReduxMappedStateProps &
  ReduxMappedDispatchProps &
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
    const { wallet, paymentId, pspList } = this.props;
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
          <PaymentBannerComponent />
          <View style={WalletStyles.paddedLR}>
            <View spacer={true} extralarge={true} />
            <H1>{I18n.t("wallet.ConfirmPayment.askConfirm")}</H1>
            <View spacer={true} />
            <CardComponent
              item={this.props.wallet}
              menu={false}
              favorite={false}
              lastUsage={false}
              navigateToDetails={() =>
                this.props.navigation.navigate(ROUTES.WALLET_CARD_TRANSACTIONS)
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
                    {wallet.psp !== undefined
                      ? `${I18n.t("payment.currentPsp")} ${
                          wallet.psp.businessName
                        } `
                      : I18n.t("payment.noPsp")}
                    <Text
                      link={true}
                      onPress={() =>
                        this.props.pickPsp(wallet, pspList, paymentId)
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
            onPress={() => this.props.requestPinLogin(wallet, paymentId)}
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
              onPress={_ => this.props.pickPaymentMethod(paymentId)}
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
    const wallet = getSelectedPaymentMethodFromGlobalStateWithSelectedPaymentMethod(
      state
    );
    const feeOrUndefined = feeExtractor(wallet);
    return {
      isLoading: createLoadingSelector(["PAYMENT"])(state),
      error: createErrorSelector(["PAYMENT"])(state),
      valid: true,
      wallet,
      amount: getCurrentAmountFromGlobalStateWithSelectedPaymentMethod(state),
      fee: feeOrUndefined === undefined ? UNKNOWN_AMOUNT : feeOrUndefined,
      paymentId: getPaymentIdFromGlobalStateWithSelectedPaymentMethod(state),
      pspList: getPspListFromGlobalStateWithSelectedPaymentMethod(state)
    };
  } else {
    return {
      isLoading: false,
      error: none,
      valid: false
    };
  }
};

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  pickPaymentMethod: (paymentId: string) =>
    dispatch(paymentRequestPickPaymentMethod({ paymentId })),
  requestPinLogin: (wallet: Wallet, paymentId: string) =>
    dispatch(paymentRequestPinLogin({ wallet, paymentId })),
  goBack: () => dispatch(paymentRequestGoBack()),
  pickPsp: (wallet: Wallet, pspList: ReadonlyArray<Psp>, paymentId: string) =>
    dispatch(paymentRequestPickPsp({ wallet, pspList, paymentId })),
  showSummary: () => dispatch(paymentRequestTransactionSummaryFromBanner()),
  onCancel: () => dispatch(paymentRequestCancel())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withErrorModal(
    withLoadingSpinner(ConfirmPaymentMethodScreen, {}),
    mapErrorCodeToMessage
  )
);
