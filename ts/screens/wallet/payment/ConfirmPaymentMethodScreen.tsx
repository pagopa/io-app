/**
 * This screen asks the authorization to proceed with the transaction.
 * TODO:
 * - integrate contextual help:
 *    https://www.pivotaltracker.com/n/projects/2048617/stories/157874540
 * - implement the proper navigation
 *    https://www.pivotaltracker.com/n/projects/2048617/stories/158395136
 */
import {
  Body,
  Button,
  Container,
  Content,
  H1,
  Left,
  Text,
  View
} from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { Wallet } from "../../../../definitions/pagopa/Wallet";
import { WalletStyles } from "../../../components/styles/wallet";
import AppHeader from "../../../components/ui/AppHeader";
import IconFont from "../../../components/ui/IconFont";
import CreditCardComponent from "../../../components/wallet/card";
import PaymentBannerComponent from "../../../components/wallet/PaymentBannerComponent";
import I18n from "../../../i18n";
import { Dispatch } from "../../../store/actions/types";
import {
  pickPaymentMethod,
  requestOtp,
  showPaymentSummary
} from "../../../store/actions/wallet/payment";
import { GlobalState } from "../../../store/reducers/types";
import { selectedPaymentMethodSelector, currentAmountSelector, feeExtractor } from "../../../store/reducers/wallet/payment";
import { UNKNOWN_CARD, UNKNOWN_AMOUNT } from "../../../types/unknown";
import { AmountInEuroCents } from '../../../../node_modules/italia-ts-commons/lib/pagopa';
import { AmountInEuroCentsFromNumber } from "italia-ts-commons/lib/pagopa";

type ReduxMappedStateProps = Readonly<{
  card: Wallet;
  amount: AmountInEuroCents,
  fee: AmountInEuroCents
}>;

type ReduxMappedDispatchProps = Readonly<{
  pickPaymentMethod: () => void;
  requestOtp: () => void;
  showPaymentSummary: () => void;
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
  private goBack() {
    this.props.navigation.goBack();
  }

  /**
   * It sum the amount to pay and the fee requested to perform the transaction
   * TO DO: If required, it should be implemented to manage values
   * of the order of of higher 10^13
   *  @https://www.pivotaltracker.com/n/projects/2048617/stories/157769657
   */
  private getTotalAmount() {
    return AmountInEuroCentsFromNumber.encode(this.props.amount) + AmountInEuroCentsFromNumber.encode(this.props.fee);
  }

  public render(): React.ReactNode {
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={() => this.goBack()}>
              <IconFont name="io-back" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("wallet.ConfirmPayment.header")}</Text>
          </Body>
        </AppHeader>

        <Content noPadded={true}>
          <PaymentBannerComponent navigation={this.props.navigation} />
          <View style={WalletStyles.paddedLR}>
            <View spacer={true} extralarge={true} />
            <H1>{I18n.t("wallet.ConfirmPayment.askConfirm")}</H1>
            <View spacer={true} />
            <CreditCardComponent
              navigation={this.props.navigation}
              item={this.props.card}
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
                    {`${AmountInEuroCentsFromNumber.encode(this.props.amount)} €`}
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
                    {`${AmountInEuroCentsFromNumber.encode(this.props.fee)} €`}
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
                    {`${this.getTotalAmount()} €`}
                  </H1>
                </Col>
              </Row>
              <Row>
                <Col size={1} />
                <Col size={9}>
                  <View spacer={true} large={true} />
                  <Text style={WalletStyles.textCenter}>
                    {`${I18n.t("wallet.ConfirmPayment.info2")} `}
                    <Text link={true}>
                      {I18n.t("wallet.ConfirmPayment.changeMethod")}
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
            onPress={() => this.props.requestOtp()}
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
              onPress={_ => this.props.showPaymentSummary()}
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
  const card = selectedPaymentMethodSelector(state).getOrElse(UNKNOWN_CARD);
  return {
    card,
    amount: currentAmountSelector(state).getOrElse(UNKNOWN_AMOUNT),
    fee: feeExtractor(card).getOrElse(UNKNOWN_AMOUNT)
  };
};

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  pickPaymentMethod: () => dispatch(pickPaymentMethod()),
  requestOtp: () => dispatch(requestOtp()),
  showPaymentSummary: () => dispatch(showPaymentSummary())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConfirmPaymentMethodScreen);
