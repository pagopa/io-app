/**
 * This screen allows the user to manually insert the data which identify the transaction:
 * - Numero Avviso, which includes: aux, digit, application code, codice IUV
 * - Codice Fiscale Ente CReditore (corresponding to codiceIdentificativoEnte)
 * - amount of the transaction
 *  TODO:
 *  - integrate contextual help to obtain details on the data to insert for manually identifying the transaction
 *    https://www.pivotaltracker.com/n/projects/2048617/stories/157874540
 */

import { Content, Form, Text, View } from "native-base";
import * as React from "react";
import { Keyboard, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { NavigationEvents, NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Either, isRight } from "fp-ts/lib/Either";
import { fromEither, none, Option, some } from "fp-ts/lib/Option";
import {
  AmountInEuroCents,
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
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { LightModalContextInterface } from "../../../components/ui/LightModal";
import { LabelledItem } from "../../../components/LabelledItem";
import I18n from "../../../i18n";
import {
  navigateBack,
  navigateToPaymentTransactionSummaryScreen,
  navigateToWalletAddPaymentMethod,
  navigateToWalletHome
} from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import { paymentInitializeState } from "../../../store/actions/wallet/payment";
import variables from "../../../theme/variables";
import { Link } from "../../../components/core/typography/Link";
import { GlobalState } from "../../../store/reducers/types";
import {
  getPagoPAMethodsSelector,
  getPayablePaymentMethodsSelector
} from "../../../store/reducers/wallet/wallets";
import {
  alertNoActivePayablePaymentMethods,
  alertNoPayablePaymentMethods
} from "../../../utils/paymentMethod";
import { H1 } from "../../../components/core/typography/H1";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { cancelButtonProps } from "../../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import CodesPositionManualPaymentModal from "./CodesPositionManualPaymentModal";

type NavigationParams = {
  isInvalidAmount?: boolean;
};

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = OwnProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  LightModalContextInterface;

type State = Readonly<{
  paymentNoticeNumber: Option<
    ReturnType<typeof PaymentNoticeNumberFromString.decode>
  >;
  organizationFiscalCode: Option<
    ReturnType<typeof OrganizationFiscalCode.decode>
  >;
}>;

const styles = StyleSheet.create({
  whiteBg: {
    backgroundColor: variables.colorWhite
  }
});

// helper to translate Option<Either> to true|false|void semantics
const unwrapOptionalEither = (o: Option<Either<unknown, unknown>>) =>
  o.map<boolean | undefined>(e => e.isRight()).getOrElse(undefined);

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.insertManually.contextualHelpTitle",
  body: "wallet.insertManually.contextualHelpContent"
};
class ManualDataInsertionScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      paymentNoticeNumber: none,
      organizationFiscalCode: none
    };
  }

  public componentDidMount() {
    if (!this.props.hasPayableMethods) {
      if (this.props.hasPagoPaMethods) {
        alertNoActivePayablePaymentMethods(this.props.navigateToWalletHome);
        return;
      }
      alertNoPayablePaymentMethods(this.props.navigateToWalletAddPaymentMethod);
    }
  }

  private isFormValid = () =>
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
            ).map(rptId => {
              // Set the initial amount to a fixed value (1) because it is not used, waiting to be removed from the API
              const initialAmount = "1" as AmountInEuroCents;
              this.props.navigateToTransactionSummary(rptId, initialAmount);
            })
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

    return (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("wallet.insertManually.header")}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["wallet_insert_notice_data"]}
      >
        <SafeAreaView style={IOStyles.flex}>
          <NavigationEvents />
          <ScrollView
            style={styles.whiteBg}
            keyboardShouldPersistTaps="handled"
          >
            <Content scrollEnabled={false}>
              <H1>{I18n.t("wallet.insertManually.title")}</H1>
              <Text>{I18n.t("wallet.insertManually.info")}</Text>
              <Link onPress={this.showModal}>
                {I18n.t("wallet.insertManually.link")}
              </Link>
              <View spacer />
              <Form>
                <LabelledItem
                  isValid={unwrapOptionalEither(this.state.paymentNoticeNumber)}
                  label={I18n.t("wallet.insertManually.noticeCode")}
                  accessibilityLabel={I18n.t(
                    "wallet.insertManually.noticeCode"
                  )}
                  inputProps={{
                    keyboardType: "numeric",
                    returnKeyType: "done",
                    maxLength: 18,
                    onChangeText: value => {
                      this.setState({
                        paymentNoticeNumber: some(value)
                          .filter(NonEmptyString.is)
                          .map(_ => PaymentNoticeNumberFromString.decode(_))
                      });
                    }
                  }}
                />
                <View spacer />
                <LabelledItem
                  isValid={unwrapOptionalEither(
                    this.state.organizationFiscalCode
                  )}
                  label={I18n.t("wallet.insertManually.entityCode")}
                  accessibilityLabel={I18n.t(
                    "wallet.insertManually.entityCode"
                  )}
                  inputProps={{
                    keyboardType: "numeric",
                    returnKeyType: "done",
                    maxLength: 11,
                    onChangeText: value => {
                      this.setState({
                        organizationFiscalCode: some(value)
                          .filter(NonEmptyString.is)
                          .map(_ => OrganizationFiscalCode.decode(_))
                      });
                    }
                  }}
                />
              </Form>
            </Content>
          </ScrollView>
          <FooterWithButtons
            type="TwoButtonsInlineHalf"
            leftButton={cancelButtonProps(
              this.props.goBack,
              I18n.t("global.buttons.back")
            )}
            rightButton={primaryButtonProps}
          />
        </SafeAreaView>
      </BaseScreenComponent>
    );
  }
  private showModal = () => {
    Keyboard.dismiss();
    this.props.showModal(
      <CodesPositionManualPaymentModal onCancel={this.props.hideModal} />
    );
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goBack: () => {
    dispatch(navigateBack());
  },
  navigateToWalletHome: () => dispatch(navigateToWalletHome()),
  navigateToWalletAddPaymentMethod: () =>
    dispatch(
      navigateToWalletAddPaymentMethod({
        inPayment: none,
        showOnlyPayablePaymentMethods: true
      })
    ),
  navigateToTransactionSummary: (
    rptId: RptId,
    initialAmount: AmountInEuroCents
  ) => {
    Keyboard.dismiss();
    dispatch(paymentInitializeState());
    dispatch(
      navigateToPaymentTransactionSummaryScreen({
        rptId,
        initialAmount,
        paymentStartOrigin: "manual_insertion"
      })
    );
  }
});

const mapStateToProps = (state: GlobalState) => ({
  hasPayableMethods: getPayablePaymentMethodsSelector(state).length > 0,
  hasPagoPaMethods: getPagoPAMethodsSelector(state).length > 0
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(ManualDataInsertionScreen));
