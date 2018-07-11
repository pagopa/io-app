/**
 * This screen allows the user to manually insert the data which identify the transaction:
 * - Numero Avviso, which includes: aux, digit, application code, codice IUV
 * - Codice Fiscale Ente CReditore (corresponding to codiceIdentificativoEnte)
 * - amount of the transaction
 *  TO DO:
 *  - integrate contextual help to obtain details on the data to insert for manually identifying the transaction
 *    https://www.pivotaltracker.com/n/projects/2048617/stories/157874540
 */

import { none, Option, some } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import {
  Body,
  Button,
  Container,
  Content,
  Form,
  H1,
  Icon,
  Input,
  Item,
  Label,
  Left,
  Text,
  View
} from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { RptIdFromString } from "../../../../definitions/pagopa-proxy/RptIdFromString";
import AppHeader from "../../../components/ui/AppHeader";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { Dispatch } from "../../../store/actions/types";
import { showPaymentSummary } from "../../../store/actions/wallet/payment";

type ReduxMappedProps = Readonly<{
  showPaymentSummary: (rptId: RptId, amount: AmountInEuroCents) => void;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReduxMappedProps;

type State = Readonly<{
  transactionCode: Option<string>;
  fiscalCode: Option<string>;
  amount: Option<number>;
}>;

import * as t from "io-ts";
export const MAX_AMOUNT_DIGITS = 10;
export const CENTS_IN_ONE_EURO = 100;
export type AmountInEuroCents = t.TypeOf<typeof AmountInEuroCents>;

export const AmountInEuroCentsFromNumber = new t.Type<
  AmountInEuroCents,
  number,
  number
>(
  "AmountInEuroCentsFromNumber",
  AmountInEuroCents.is,
  (i, c) =>
    AmountInEuroCents.validate(
      `${"0".repeat(MAX_AMOUNT_DIGITS)}${Math.floor(
        i * CENTS_IN_ONE_EURO
      )}`.slice(-MAX_AMOUNT_DIGITS),
      c
    ),
  a => parseInt(a, 10) / CENTS_IN_ONE_EURO
);

class ManualDataInsertionScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      transactionCode: none,
      fiscalCode: none,
      amount: none
    };
  }

  private goBack() {
    this.props.navigation.goBack();
  }

  private proceedToSummary = () => {
    if (
      this.state.transactionCode.isSome() &&
      this.state.fiscalCode.isSome() &&
      this.state.amount.isSome()
    ) {
      const rptId = RptIdFromString.decode(
        `${this.state.fiscalCode.value}${this.state.transactionCode.value}`
      );
      const amount = AmountInEuroCentsFromNumber.decode(
        this.state.amount.value
      );
      if (rptId.isRight() && amount.isRight()) {
        // valid Rpt Id and valid amount were entered
        this.props.showPaymentSummary(rptId.value, amount.value);
      } // else toast saying that the data entered is invalid
    }
  };

  public render(): React.ReactNode {
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={() => this.goBack()}>
              <Icon name="chevron-left" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("wallet.insertManually.header")}</Text>
          </Body>
        </AppHeader>
        <Content>
          <H1>{I18n.t("wallet.insertManually.title")}</H1>
          <Text>{I18n.t("wallet.insertManually.info")}</Text>
          <Text link={true}>{I18n.t("wallet.insertManually.link")}</Text>
          <Form>
            <Item floatingLabel={true}>
              <Label>{I18n.t("wallet.insertManually.noticeCode")}</Label>
              <Input
                keyboardType={"numeric"}
                onChangeText={value => {
                  this.setState({ transactionCode: some(value) });
                }}
              />
            </Item>
            <Item floatingLabel={true}>
              <Label>{I18n.t("wallet.insertManually.entityCode")}</Label>
              <Input
                keyboardType={"numeric"}
                onChangeText={value => {
                  this.setState({ fiscalCode: some(value) });
                }}
              />
            </Item>
            <Item floatingLabel={true}>
              <Label>{I18n.t("wallet.insertManually.amount")}</Label>
              <Input
                keyboardType={"numeric"}
                value={
                  this.state.amount.isSome() ? `${this.state.amount.value}` : ""
                }
                onChangeText={value => {
                  const parsedValue = parseFloat(value);
                  if (!isNaN(parsedValue)) {
                    this.setState({ amount: some(parsedValue) });
                  }
                }}
              />
            </Item>
          </Form>
        </Content>
        <View footer={true}>
          <Button block={true} primary={true} onPress={this.proceedToSummary}>
            <Text>{I18n.t("wallet.insertManually.proceed")}</Text>
          </Button>
          <View spacer={true} />
          <Button
            block={true}
            light={true}
            bordered={true}
            onPress={() => this.props.navigation.navigate(ROUTES.WALLET_HOME)}
          >
            <Text>{I18n.t("wallet.cancel")}</Text>
          </Button>
        </View>
      </Container>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedProps => ({
  showPaymentSummary: (rptId: RptId, amount: AmountInEuroCents) =>
    dispatch(showPaymentSummary(rptId, amount))
});

export default connect(
  undefined,
  mapDispatchToProps
)(ManualDataInsertionScreen);
