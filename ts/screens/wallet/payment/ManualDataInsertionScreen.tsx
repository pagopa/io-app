/**
 * This screen allows the user to manually insert the data which identify the transaction:
 * - Numero Avviso, which includes: aux, digit, application code, codice IUV
 * - Codice Fiscale Ente CReditore (corresponding to codiceIdentificativoEnte)
 * - amount of the transaction
 *  TODO:
 *  - integrate contextual help to obtain details on the data to insert for manually identifying the transaction
 *    https://www.pivotaltracker.com/n/projects/2048617/stories/157874540
 *  - "back" & "cancel" behavior to be implemented @https://www.pivotaltracker.com/story/show/159229087
 */

import { none, Option, some } from "fp-ts/lib/Option";
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
  Form,
  H1,
  Icon,
  Input,
  Item,
  Label,
  Left,
  Text
} from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { RptIdFromString } from "../../../../definitions/backend/RptIdFromString";
import AppHeader from "../../../components/ui/AppHeader";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import { Dispatch } from "../../../store/actions/types";
import {
  paymentRequestCancel,
  paymentRequestGoBack,
  paymentRequestTransactionSummaryFromRptId
} from "../../../store/actions/wallet/payment";
import { GlobalState } from "../../../store/reducers/types";
import { getPaymentStep } from "../../../store/reducers/wallet/payment";

type ReduxMappedStateProps = Readonly<{
  valid: boolean;
}>;

type ReduxMappedDispatchProps = Readonly<{
  showTransactionSummary: (rptId: RptId, amount: AmountInEuroCents) => void;
  goBack: () => void;
  cancelPayment: () => void;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReduxMappedDispatchProps & ReduxMappedStateProps;

type State = Readonly<{
  transactionCode: Option<string>;
  fiscalCode: Option<string>;
  amount: Option<number>;
}>;

const EMPTY_NOTICE_NUMBER = "";
const EMPTY_FISCAL_CODE = "";
const EMPTY_AMOUNT = "";
class ManualDataInsertionScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      transactionCode: none,
      fiscalCode: none,
      amount: none
    };
  }

  private validateAmount = (value: string) => {
    const parsedValue = parseFloat(value);
    this.setState({ amount: !isNaN(parsedValue) ? some(parsedValue) : none });
  };

  /**
   * This method collects the data from the form and,
   * if it is syntactically correct, it dispatches a
   * request to proceed with the summary of the transaction
   */
  private proceedToSummary = () => {
    // first make sure all the elements have been entered correctly
    if (
      this.state.transactionCode.isSome() &&
      this.state.fiscalCode.isSome() &&
      this.state.amount.isSome()
    ) {
      // extract the rptId object from the "rptId" string
      // (i.e. the concatenation of fiscal code and notice number)
      const rptId = RptIdFromString.decode(
        `${this.state.fiscalCode.value}${this.state.transactionCode.value}`
      );
      // get the amount (directly from the input)
      const amount = AmountInEuroCentsFromNumber.decode(
        this.state.amount.value
      );
      if (rptId.isRight() && amount.isRight()) {
        // valid Rpt Id and valid amount were entered
        this.props.showTransactionSummary(rptId.value, amount.value);
      } // TODO: else toast saying that the data entered is invalid
    }
  };

  public render(): React.ReactNode {
    if (!this.props.valid) {
      return null;
    }

    const primaryButtonProps = {
      block: true,
      primary: true,
      onPress: this.proceedToSummary,
      title: I18n.t("global.buttons.continue")
    };

    const secondaryButtonProps = {
      block: true,
      light: true,
      bordered: true,
      onPress: () => this.props.cancelPayment(),
      title: I18n.t("global.buttons.cancel")
    };

    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={() => this.props.goBack()}>
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
                  this.setState({
                    transactionCode:
                      value === EMPTY_NOTICE_NUMBER ? none : some(value)
                  });
                }}
              />
            </Item>
            <Item floatingLabel={true}>
              <Label>{I18n.t("wallet.insertManually.entityCode")}</Label>
              <Input
                keyboardType={"numeric"}
                onChangeText={value => {
                  this.setState({
                    fiscalCode: value === EMPTY_FISCAL_CODE ? none : some(value)
                  });
                }}
              />
            </Item>
            <Item floatingLabel={true}>
              <Label>{I18n.t("wallet.insertManually.amount")}</Label>
              <Input
                keyboardType={"numeric"}
                value={
                  this.state.amount.isSome()
                    ? `${this.state.amount.value}`
                    : EMPTY_AMOUNT
                }
                onChangeText={this.validateAmount}
              />
            </Item>
          </Form>
        </Content>

        <FooterWithButtons
          leftButton={secondaryButtonProps}
          rightButton={primaryButtonProps}
          inlineHalf={true}
        />
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => ({
  valid: getPaymentStep(state) === "PaymentStateManualEntry"
});

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  showTransactionSummary: (rptId: RptId, amount: AmountInEuroCents) =>
    dispatch(paymentRequestTransactionSummaryFromRptId(rptId, amount)),
  goBack: () => dispatch(paymentRequestGoBack()),
  cancelPayment: () => dispatch(paymentRequestCancel())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ManualDataInsertionScreen);
