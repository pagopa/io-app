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

import { Content, Form, H1, Input, Item, Label, Text } from "native-base";
import * as React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { isLeft, isRight } from "fp-ts/lib/Either";
import { fromEither, none, Option, some } from "fp-ts/lib/Option";
import {
  AmountInEuroCents,
  AmountInEuroCentsFromNumber,
  PaymentNoticeNumberFromString,
  RptId
} from "italia-pagopa-commons/lib/pagopa";
import {
  NonEmptyString,
  OrganizationFiscalCode
} from "italia-ts-commons/lib/strings";

import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import {
  navigateToPaymentTransactionSummaryScreen,
  navigateToWalletHome
} from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import { paymentInitializeState } from "../../../store/actions/wallet/payment";
import variables from "../../../theme/variables";

type OwnProps = NavigationInjectedProps;

type Props = OwnProps & ReturnType<typeof mapDispatchToProps>;

type State = Readonly<{
  paymentNoticeNumber: Option<
    ReturnType<typeof PaymentNoticeNumberFromString.decode>
  >;
  organizationFiscalCode: Option<
    ReturnType<typeof OrganizationFiscalCode.decode>
  >;
  delocalizedAmount: Option<
    ReturnType<typeof AmountInEuroCentsFromNumber.decode>
  >;
}>;

const styles = StyleSheet.create({
  whiteBg: {
    backgroundColor: variables.colorWhite
  }
});

//const AmountInEuroCentsFromString = NumberFromString.pipe(
//  AmountInEuroCentsFromNumber
//);

class ManualDataInsertionScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      paymentNoticeNumber: none,
      organizationFiscalCode: none,
      delocalizedAmount: none
    };
  }

  private decimalSeparatorRe = RegExp(
    `\\${I18n.t("global.localization.decimalSeparator")}`,
    "g"
  );

  private isFormValid = () =>
    this.state.delocalizedAmount.map(isRight).getOrElse(false) &&
    this.state.paymentNoticeNumber.map(isRight).getOrElse(false) &&
    this.state.organizationFiscalCode.map(isRight).getOrElse(false);

  /**
   * This method collects the data from the form and,
   * if it is syntactically correct, it dispatches a
   * request to proceed with the summary of the transaction
   */
  private proceedToSummary = () => {
    // first make sure all the elements have been entered correctly

    this.state.paymentNoticeNumber
      .chain(fromEither)
      .chain(paymentNoticeNumber =>
        this.state.organizationFiscalCode
          .chain(fromEither)
          .chain(organizationFiscalCode =>
            fromEither(
              RptId.decode({
                paymentNoticeNumber,
                organizationFiscalCode
              })
            )
          )
          .chain(rptId =>
            this.state.delocalizedAmount
              .chain(fromEither)
              .map(delocalizedAmount =>
                this.props.navigateToTransactionSummary(
                  rptId,
                  delocalizedAmount
                )
              )
          )
      );
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
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("wallet.insertManually.header")}
      >
        <ScrollView style={styles.whiteBg} keyboardShouldPersistTaps="handled">
          <Content scrollEnabled={false}>
            <H1>{I18n.t("wallet.insertManually.title")}</H1>
            <Text>{I18n.t("wallet.insertManually.info")}</Text>
            <Form>
              <Item
                floatingLabel={true}
                error={this.state.paymentNoticeNumber
                  .map(isLeft)
                  .getOrElse(false)}
                success={this.state.paymentNoticeNumber
                  .map(isRight)
                  .getOrElse(false)}
              >
                <Label>{I18n.t("wallet.insertManually.noticeCode")}</Label>
                <Input
                  keyboardType={"numeric"}
                  maxLength={18}
                  onChangeText={value => {
                    this.setState({
                      paymentNoticeNumber: some(value)
                        .filter(NonEmptyString.is)
                        .map(_ => PaymentNoticeNumberFromString.decode(_))
                    });
                  }}
                />
              </Item>
              <Item
                floatingLabel={true}
                error={this.state.organizationFiscalCode
                  .map(isLeft)
                  .getOrElse(false)}
                success={this.state.organizationFiscalCode
                  .map(isRight)
                  .getOrElse(false)}
              >
                <Label>{I18n.t("wallet.insertManually.entityCode")}</Label>
                <Input
                  keyboardType={"numeric"}
                  maxLength={11}
                  onChangeText={value => {
                    this.setState({
                      organizationFiscalCode: some(value)
                        .filter(NonEmptyString.is)
                        .map(_ => OrganizationFiscalCode.decode(_))
                    });
                  }}
                />
              </Item>
              <Item
                floatingLabel={true}
                error={this.state.delocalizedAmount
                  .map(isLeft)
                  .getOrElse(false)}
                success={this.state.delocalizedAmount
                  .map(isRight)
                  .getOrElse(false)}
              >
                <Label>{I18n.t("wallet.insertManually.amount")}</Label>
                <Input
                  keyboardType={"numeric"}
                  maxLength={10}
                  onChangeText={value =>
                    this.setState({
                      delocalizedAmount: some(
                        value.replace(this.decimalSeparatorRe, ".")
                      )
                        .filter(NonEmptyString.is)
                        .map(_ => AmountInEuroCentsFromNumber.decode(_))
                    })
                  }
                />
              </Item>
            </Form>
          </Content>
        </ScrollView>

        <FooterWithButtons
          type="TwoButtonsInlineHalf"
          leftButton={secondaryButtonProps}
          rightButton={primaryButtonProps}
        />
      </BaseScreenComponent>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToWalletHome: () => dispatch(navigateToWalletHome()),
  navigateToTransactionSummary: (
    rptId: RptId,
    initialAmount: AmountInEuroCents
  ) => {
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
