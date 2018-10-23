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
import { NumberFromString } from "io-ts-types";
import {
  AmountInEuroCents,
  AmountInEuroCentsFromNumber,
  RptId,
  RptIdFromString
} from "italia-ts-commons/lib/pagopa";
import {
  Body,
  Container,
  Content,
  Form,
  H1,
  Input,
  Item,
  Label,
  Left,
  Right,
  Text
} from "native-base";
import * as React from "react";
import { ScrollView } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import GoBackButton from "../../../components/GoBackButton";
import { InstabugButtons } from "../../../components/InstabugButtons";
import { WalletStyles } from "../../../components/styles/wallet";
import AppHeader from "../../../components/ui/AppHeader";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";

import I18n from "../../../i18n";

import {
  navigateToPaymentTransactionSummaryScreen,
  navigateToWalletHome
} from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import { paymentInitializeState } from "../../../store/actions/wallet/payment";

type ReduxMappedDispatchProps = Readonly<{
  navigateToWalletHome: () => void;
  showTransactionSummary: (rptId: RptId, amount: AmountInEuroCents) => void;
}>;

type OwnProps = NavigationInjectedProps;

type Props = OwnProps & ReduxMappedDispatchProps;

type State = Readonly<{
  transactionCode: Option<string>;
  fiscalCode: Option<string>;
  delocalizedAmount: Option<string>;
}>;

const EMPTY_NOTICE_NUMBER = "";
const EMPTY_FISCAL_CODE = "";
const EMPTY_AMOUNT = "";

const AmountInEuroCentsFromString = NumberFromString.pipe(
  AmountInEuroCentsFromNumber
);

class ManualDataInsertionScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      transactionCode: none,
      fiscalCode: none,
      delocalizedAmount: none
    };
  }

  private decimalSeparatorRe = RegExp(
    `\\I18n.t("global.localization.decimalSeparator")`,
    "g"
  );

  private isFormValid = () =>
    this.state.delocalizedAmount.isSome() &&
    this.state.transactionCode.isSome() &&
    this.state.fiscalCode.isSome() &&
    AmountInEuroCentsFromString.decode(
      this.state.delocalizedAmount.value
    ).isRight() &&
    RptIdFromString.decode(
      `${this.state.fiscalCode.value}${this.state.transactionCode.value}`
    ).isRight();

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
      this.state.delocalizedAmount.isSome()
    ) {
      // extract the rptId object from the "rptId" string
      // (i.e. the concatenation of fiscal code and notice number)
      const rptId = RptIdFromString.decode(
        `${this.state.fiscalCode.value}${this.state.transactionCode.value}`
      );
      // get the amount (directly from the input)
      const amount = AmountInEuroCentsFromString.decode(
        this.state.delocalizedAmount.value
      );
      if (rptId.isRight() && amount.isRight()) {
        // valid Rpt Id and valid amount were entered
        this.props.showTransactionSummary(rptId.value, amount.value);
      } // TODO: else toast saying that the data entered is invalid
    }
  };

  public render(): React.ReactNode {
    const primaryButtonProps = {
      disabled: !this.isFormValid(),
      block: true,
      primary: this.isFormValid(),
      onPress: this.proceedToSummary,
      title: I18n.t("global.buttons.continue")
    };

    const secondaryButtonProps = {
      block: true,
      light: true,
      bordered: true,
      onPress: this.props.navigateToWalletHome,
      title: I18n.t("global.buttons.cancel")
    };

    return (
      <Container>
        <AppHeader>
          <Left>
            <GoBackButton />
          </Left>
          <Body>
            <Text>{I18n.t("wallet.insertManually.header")}</Text>
          </Body>
          <Right>
            <InstabugButtons />
          </Right>
        </AppHeader>

        <ScrollView
          style={WalletStyles.whiteBg}
          keyboardShouldPersistTaps="handled"
        >
          <Content scrollEnabled={false}>
            <H1>{I18n.t("wallet.insertManually.title")}</H1>
            <Text>{I18n.t("wallet.insertManually.info")}</Text>
            <Text link={true}>{I18n.t("wallet.insertManually.link")}</Text>
            <Form>
              <Item
                floatingLabel={true}
                error={
                  this.state.transactionCode.isSome() &&
                  NumberFromString.decode(
                    this.state.transactionCode.value
                  ).isLeft()
                }
              >
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
              <Item
                floatingLabel={true}
                error={
                  this.state.fiscalCode.isSome() &&
                  NumberFromString.decode(this.state.fiscalCode.value).isLeft()
                }
              >
                <Label>{I18n.t("wallet.insertManually.entityCode")}</Label>
                <Input
                  keyboardType={"numeric"}
                  onChangeText={value => {
                    this.setState({
                      fiscalCode:
                        value === EMPTY_FISCAL_CODE ? none : some(value)
                    });
                  }}
                />
              </Item>
              <Item
                floatingLabel={true}
                error={
                  this.state.delocalizedAmount.isSome() &&
                  AmountInEuroCentsFromString.decode(
                    this.state.delocalizedAmount.value
                  ).isLeft()
                }
              >
                <Label>{I18n.t("wallet.insertManually.amount")}</Label>
                <Input
                  keyboardType={"numeric"}
                  onChangeText={value =>
                    this.setState({
                      delocalizedAmount:
                        value === EMPTY_AMOUNT
                          ? none
                          : some(value.replace(this.decimalSeparatorRe, "."))
                    })
                  }
                />
              </Item>
            </Form>
          </Content>
        </ScrollView>

        <FooterWithButtons
          leftButton={secondaryButtonProps}
          rightButton={primaryButtonProps}
          inlineHalf={true}
        />
      </Container>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  navigateToWalletHome: () => navigateToWalletHome(),
  showTransactionSummary: (rptId: RptId, initialAmount: AmountInEuroCents) => {
    dispatch(paymentInitializeState());
    dispatch(
      navigateToPaymentTransactionSummaryScreen({
        rptId,
        initialAmount
      })
    );
  }
});

export default connect(
  undefined,
  mapDispatchToProps
)(ManualDataInsertionScreen);
