import { Content, Form, H1, Input, Item, Label, Text } from "native-base";
import * as React from "react";
import { ScrollView, StyleSheet } from "react-native";
import {
  NavigationEventPayload,
  NavigationEvents,
  NavigationInjectedProps
} from "react-navigation";
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
import { withLightModalContext } from "../../../components/helpers/withLightModalContext";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { LightModalContextInterface } from "../../../components/ui/LightModal";
import I18n from "../../../i18n";
import {
  navigateBack,
  navigateToPaymentTransactionSummaryScreen
} from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import { paymentInitializeState } from "../../../store/actions/wallet/payment";
import variables from "../../../theme/variables";
import { NumberFromString } from "../../../utils/number";
import CodesPositionManualPaymentModal from "./CodesPositionManualPaymentModal";

type NavigationParams = {
  isInvalidAmount?: boolean;
};

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = OwnProps &
  ReturnType<typeof mapDispatchToProps> &
  LightModalContextInterface;

type State = Readonly<{
  paymentNoticeNumber: Option<
    ReturnType<typeof PaymentNoticeNumberFromString.decode>
  >;
  organizationFiscalCode: Option<
    ReturnType<typeof OrganizationFiscalCode.decode>
  >;
  delocalizedAmount: Option<
    ReturnType<typeof AmountInEuroCentsFromString.decode>
  >;
  inputAmountValue: string;
}>;

const styles = StyleSheet.create({
  whiteBg: {
    backgroundColor: variables.colorWhite
  },
  noLeftMargin: {
    marginLeft: 0
  }
});

const AmountInEuroCentsFromString = NumberFromString.pipe(
  AmountInEuroCentsFromNumber
);

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.insertManually.contextualHelpTitle",
  body: "wallet.insertManually.contextualHelpContent"
};

/**
 * This screen allows the user to manually insert the data which identify the transaction:
 * - Numero Avviso, which includes: aux, digit, application code, codice IUV
 * - Codice Fiscale Ente CReditore (corresponding to codiceIdentificativoEnte)
 * - amount of the transaction
 */
class ManualDataInsertionScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      paymentNoticeNumber: none,
      organizationFiscalCode: none,
      delocalizedAmount: none,
      inputAmountValue: ""
    };
  }

  private handleWillFocus = (payload: NavigationEventPayload) => {
    const isInvalidAmount =
      payload.state.params !== undefined
        ? payload.state.params.isInvalidAmount
        : false;
    if (isInvalidAmount) {
      this.setState({ inputAmountValue: "", delocalizedAmount: none });
    }
  };

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
      cancel: true,
      onPress: this.props.goBack,
      title: I18n.t("global.buttons.cancel")
    };
    return (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("wallet.insertManually.header")}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["wallet_insert_notice_data"]}
      >
        <NavigationEvents onWillFocus={this.handleWillFocus} />
        <ScrollView style={styles.whiteBg} keyboardShouldPersistTaps="handled">
          <Content scrollEnabled={false}>
            <H1>{I18n.t("wallet.insertManually.title")}</H1>
            <Text>{I18n.t("wallet.insertManually.info")}</Text>
            <TouchableDefaultOpacity onPress={this.showModal}>
              <Text link={true}>{I18n.t("wallet.insertManually.link")}</Text>
            </TouchableDefaultOpacity>

            <Form>
              <Item
                style={styles.noLeftMargin}
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
                  returnKeyType={"done"}
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
                style={styles.noLeftMargin}
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
                  returnKeyType={"done"}
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
                style={styles.noLeftMargin}
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
                  returnKeyType={"done"}
                  maxLength={10}
                  value={this.state.inputAmountValue}
                  onChangeText={value =>
                    this.setState({
                      inputAmountValue: value,
                      delocalizedAmount: some(
                        value.replace(this.decimalSeparatorRe, ".")
                      )
                        .filter(NonEmptyString.is)
                        .map(_ => AmountInEuroCentsFromString.decode(_))
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
  private showModal = () => {
    this.props.showModal(
      <CodesPositionManualPaymentModal onCancel={this.props.hideModal} />
    );
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goBack: () => {
    dispatch(navigateBack());
  },
  navigateToTransactionSummary: (
    rptId: RptId,
    initialAmount: AmountInEuroCents
  ) => {
    dispatch(paymentInitializeState());
    dispatch(
      navigateToPaymentTransactionSummaryScreen({
        rptId,
        initialAmount,
        isManualPaymentInsertion: true
      })
    );
  }
});

export default connect(
  undefined,
  mapDispatchToProps
)(withLightModalContext(ManualDataInsertionScreen));
