/**
 * This screen shows the transaction details.
 * It should occur after the transaction identification by qr scanner or manual procedure.
 * TODO:
 * - integrate contextual help
 *    https://www.pivotaltracker.com/n/projects/2048617/stories/158108270
 * - check availability of displayed data. Define optional data and implement their rendering as preferred
 */

import {
  Body,
  Button,
  Container,
  Content,
  H1,
  H3,
  Left,
  Right,
  Text,
  View
} from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { WalletAPI } from "../../api/wallet/wallet-api";
import { WalletStyles } from "../../components/styles/wallet";
import AppHeader from "../../components/ui/AppHeader";
import PaymentSummaryComponent from "../../components/wallet/PaymentSummaryComponent";
import I18n from "../../i18n";
import Icon from "../../theme/font-icons/io-icon-font/index";
import variables from "../../theme/variables";
import {
  NotifiedTransaction,
  TransactionEntity,
  TransactionSubject
} from "../../types/wallet";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

const styles = StyleSheet.create({
  padded: {
    paddingRight: variables.contentPadding,
    paddingLeft: variables.contentPadding
  }
});

const transactionDetails: Readonly<
  NotifiedTransaction
> = WalletAPI.getNotifiedTransaction();
const entityDetails: Readonly<
  TransactionEntity
> = WalletAPI.getTransactionEntity();
const subjectDetails: Readonly<
  TransactionSubject
> = WalletAPI.getTransactionSubject();

export class FirstTransactionSummaryScreen extends React.Component<
  Props,
  never
> {
  constructor(props: Props) {
    super(props);
  }

  private goBack() {
    this.props.navigation.goBack();
  }

  public render(): React.ReactNode {
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={() => this.goBack()}>
              <Icon name="io-back" size={variables.iconSize1} />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("wallet.firstTransactionSummary.header")}</Text>
          </Body>
        </AppHeader>

        <Content noPadded={true}>
          <Grid style={[styles.padded, WalletStyles.backContent]}>
            <Row>
              <Col size={5}>
                <View spacer={true} large={true} />
                <H3 style={WalletStyles.white}>
                  {I18n.t("wallet.firstTransactionSummary.title")}
                </H3>
                <H1 style={WalletStyles.white}>
                  {transactionDetails.paymentReason}
                </H1>
              </Col>
              <Col size={1}>
                <View spacer={true} large={true} />
                <Image
                  source={require("../../../img/wallet/icon-avviso-pagopa.png")}
                />
              </Col>
            </Row>
            <View spacer={true} large={true} />
          </Grid>

          <PaymentSummaryComponent
            navigation={this.props.navigation}
            amount={transactionDetails.notifiedAmount.toString()}
            updatedAmount={transactionDetails.currentAmount.toString()}
          />

          <Grid style={[styles.padded, WalletStyles.backContent]}>
            <Row>
              <H3 style={WalletStyles.white}>
                {I18n.t("wallet.firstTransactionSummary.expireDate")}
              </H3>
              <Right>
                <H1 style={WalletStyles.white}>
                  {transactionDetails.expireDate.toLocaleDateString()}
                </H1>
              </Right>
            </Row>
            <View spacer={true} />
            <Row>
              <H3 style={WalletStyles.white}>
                {I18n.t("wallet.firstTransactionSummary.tranche")}
              </H3>
              <Right>
                <H1 style={WalletStyles.white}>{transactionDetails.tranche}</H1>
              </Right>
            </Row>
            <View spacer={true} large={true} />
          </Grid>

          <View spacer={true} large={true} />
          <Grid style={styles.padded}>
            <Row>
              <Text bold={true}>
                {I18n.t("wallet.firstTransactionSummary.entity")}
              </Text>
            </Row>
            <Row>
              <Text>{entityDetails.name}</Text>
            </Row>
            <Row>
              <Text>{entityDetails.address}</Text>
            </Row>
            <Row>
              <Text>{entityDetails.city}</Text>
            </Row>
            <Row>
              <Text>{I18n.t("wallet.firstTransactionSummary.info")}</Text>
            </Row>
            <Row>
              <Text>{I18n.t("wallet.firstTransactionSummary.tel") + " "}</Text>
              <Text link={true}>{entityDetails.tel}</Text>
            </Row>
            <Row>
              <Text link={true}>{entityDetails.webpage}</Text>
            </Row>
            <Row>
              <Text>
                {I18n.t("wallet.firstTransactionSummary.email") + " "}
              </Text>
              <Text link={true}>{entityDetails.email}</Text>
            </Row>
            <Row>
              <Text>{I18n.t("wallet.firstTransactionSummary.PEC") + " "}}</Text>
              <Text link={true}>{entityDetails.pec}</Text>
            </Row>
            <View spacer={true} large={true} />
            <Row>
              <Text bold={true}>
                {I18n.t("wallet.firstTransactionSummary.recipient")}
              </Text>
            </Row>
            <Row>
              <Text>{subjectDetails.name}</Text>
            </Row>
            <Row>
              <Text>{subjectDetails.address}</Text>
            </Row>
            <View spacer={true} large={true} />
            <Row>
              <Text bold={true}>
                {I18n.t("wallet.firstTransactionSummary.object")}
              </Text>
            </Row>
            <Row>
              <Text>{transactionDetails.paymentReason}</Text>
            </Row>
            <View spacer={true} large={true} />
            <Row>
              <Text bold={true}>
                {I18n.t("wallet.firstTransactionSummary.cbillCode") + " "}
              </Text>
              <Text bold={true}>{transactionDetails.cbill}</Text>
            </Row>
            <Row>
              <Text bold={true}>
                {I18n.t("wallet.firstTransactionSummary.iuv") + " "}
              </Text>
              <Text bold={true}>{transactionDetails.iuv}</Text>
            </Row>
            <Row>
              <Text bold={true}>
                {I18n.t("wallet.firstTransactionSummary.entityCode2") + " "}
              </Text>
              <Text bold={true}>{entityDetails.code}</Text>
            </Row>
            <View spacer={true} extralarge={true} />
          </Grid>
        </Content>
        <View footer={true}>
          <Button block={true} primary={true}>
            <Text>{I18n.t("wallet.continue")}</Text>
          </Button>
          <Button block={true} light={true} onPress={(): void => this.goBack()}>
            <Text>{I18n.t("wallet.cancel")}</Text>
          </Button>
        </View>
      </Container>
    );
  }
}
