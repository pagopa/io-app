import {
  AmountInEuroCents,
  PaymentNoticeNumberFromString,
  RptId
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import {
  NonEmptyString,
  OrganizationFiscalCode
} from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Content, Form } from "native-base";
import * as React from "react";
import { Keyboard, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { H1 } from "../../../components/core/typography/H1";
import { Link } from "../../../components/core/typography/Link";
import { IOStyles } from "../../../components/core/variables/IOStyles";

import { IOColors } from "../../../components/core/variables/IOColors";
import { withLightModalContext } from "../../../components/helpers/withLightModalContext";
import { LabelledItem } from "../../../components/LabelledItem";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { LightModalContextInterface } from "../../../components/ui/LightModal";
import { cancelButtonProps } from "../../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import I18n from "../../../i18n";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../navigation/params/WalletParamsList";
import {
  navigateBack,
  navigateToPaymentTransactionSummaryScreen,
  navigateToWalletAddPaymentMethod,
  navigateToWalletHome
} from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import { paymentInitializeState } from "../../../store/actions/wallet/payment";
import { GlobalState } from "../../../store/reducers/types";
import { withPaymentFeatureSelector } from "../../../store/reducers/wallet/wallets";
import { alertNoPayablePaymentMethods } from "../../../utils/paymentMethod";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { Body } from "../../../components/core/typography/Body";
import CodesPositionManualPaymentModal from "./CodesPositionManualPaymentModal";

export type ManualDataInsertionScreenNavigationParams = {
  isInvalidAmount?: boolean;
};

type OwnProps = IOStackNavigationRouteProps<
  WalletParamsList,
  "PAYMENT_MANUAL_DATA_INSERTION"
>;

type Props = OwnProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  LightModalContextInterface;

type State = Readonly<{
  paymentNoticeNumber: O.Option<
    ReturnType<typeof PaymentNoticeNumberFromString.decode>
  >;
  organizationFiscalCode: O.Option<
    ReturnType<typeof OrganizationFiscalCode.decode>
  >;
  noticeNumberInputValue: string;
  orgFiscalCodeInputValue: string;
}>;

const styles = StyleSheet.create({
  whiteBg: {
    backgroundColor: IOColors.white
  }
});

// helper to translate O.Option<Either> to true|false|void semantics
const unwrapOptionalEither = (o: O.Option<E.Either<unknown, unknown>>) =>
  pipe(o, O.map(E.isRight), O.toUndefined);

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.insertManually.contextualHelpTitle",
  body: "wallet.insertManually.contextualHelpContent"
};

/**
 * This screen allows the user to manually insert the data which identify the transaction:
 * - Numero Avviso, which includes: aux, digit, application code, codice IUV
 * - Codice Fiscale Ente CReditore (corresponding to codiceIdentificativoEnte)
 * - amount of the transaction
 *  TODO:
 *  - integrate contextual help to obtain details on the data to insert for manually identifying the transaction
 *    https://www.pivotaltracker.com/n/projects/2048617/stories/157874540
 */
class ManualDataInsertionScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      paymentNoticeNumber: O.none,
      organizationFiscalCode: O.none,
      noticeNumberInputValue: "",
      orgFiscalCodeInputValue: ""
    };
  }

  public componentDidMount() {
    if (!this.props.hasMethodsCanPay) {
      alertNoPayablePaymentMethods(this.props.navigateToWalletAddPaymentMethod);
    }
  }

  private isFormValid = () =>
    pipe(
      this.state.paymentNoticeNumber,
      O.map(E.isRight),
      O.getOrElseW(() => false)
    ) &&
    pipe(
      this.state.organizationFiscalCode,
      O.map(E.isRight),
      O.getOrElseW(() => false)
    );

  /**
   * This method collects the data from the form and,
   * if it is syntactically correct, it dispatches a
   * request to proceed with the summary of the transaction
   */
  private proceedToSummary = () => {
    // first make sure all the elements have been entered correctly

    pipe(
      this.state.paymentNoticeNumber,
      O.chain(O.fromEither),
      O.chain(paymentNoticeNumber =>
        pipe(
          this.state.organizationFiscalCode,
          O.chain(O.fromEither),
          O.chain(organizationFiscalCode =>
            pipe(
              {
                paymentNoticeNumber,
                organizationFiscalCode
              },
              RptId.decode,
              O.fromEither,
              O.map(rptId => {
                // Set the initial amount to a fixed value (1) because it is not used, waiting to be removed from the API
                const initialAmount = "1" as AmountInEuroCents;
                this.props.navigateToTransactionSummary(rptId, initialAmount);
              })
            )
          )
        )
      )
    );
  };

  /**
   * Converts the validator state into a color string.
   * @param isFieldValid - the validator state.
   * @returns green string if isFieldValid is true, red string if false, undefined if undefined.
   */
  private getColorFromInputValidatorState(isFieldValid: boolean | undefined) {
    return pipe(
      isFieldValid,
      O.fromNullable,
      O.fold(
        () => undefined,
        isValid => (isValid ? IOColors.green : IOColors.red)
      )
    );
  }

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
          <ScrollView
            style={styles.whiteBg}
            keyboardShouldPersistTaps="handled"
          >
            <Content scrollEnabled={false}>
              <H1>{I18n.t("wallet.insertManually.title")}</H1>
              <Body>{I18n.t("wallet.insertManually.info")}</Body>
              <Link onPress={this.showModal}>
                {I18n.t("wallet.insertManually.link")}
              </Link>
              <VSpacer size={16} />
              <Form>
                <LabelledItem
                  isValid={unwrapOptionalEither(this.state.paymentNoticeNumber)}
                  label={I18n.t("wallet.insertManually.noticeCode")}
                  accessibilityLabel={I18n.t(
                    "wallet.insertManually.noticeCode"
                  )}
                  testID={"NoticeCode"}
                  overrideBorderColor={this.getColorFromInputValidatorState(
                    unwrapOptionalEither(this.state.paymentNoticeNumber)
                  )}
                  inputMaskProps={{
                    type: "custom",
                    options: { mask: "9999 9999 9999 9999 99" },
                    keyboardType: "numeric",
                    returnKeyType: "done",
                    value: this.state.noticeNumberInputValue,
                    // notice code structure:
                    // <aux digit 1n 0-3>| IUV 17>>|<segregation code (2n)><local info system (2n)><payment number (11n)><check digit (2n)>
                    onChangeText: value => {
                      this.setState({
                        noticeNumberInputValue: value,
                        paymentNoticeNumber: pipe(
                          O.some(value),
                          O.filter(NonEmptyString.is),
                          O.map(_ => _.replace(/\s/g, "")),
                          O.map(_ => PaymentNoticeNumberFromString.decode(_))
                        )
                      });
                    }
                  }}
                />
                <VSpacer size={16} />
                <LabelledItem
                  isValid={unwrapOptionalEither(
                    this.state.organizationFiscalCode
                  )}
                  label={I18n.t("wallet.insertManually.entityCode")}
                  accessibilityLabel={I18n.t(
                    "wallet.insertManually.entityCode"
                  )}
                  testID={"EntityCode"}
                  overrideBorderColor={this.getColorFromInputValidatorState(
                    unwrapOptionalEither(this.state.organizationFiscalCode)
                  )}
                  inputMaskProps={{
                    type: "custom",
                    options: { mask: "99999999999" }, // 11 digits for an oragnization fiscal code
                    keyboardType: "numeric",
                    returnKeyType: "done",
                    value: this.state.orgFiscalCodeInputValue,
                    onChangeText: value => {
                      this.setState({
                        orgFiscalCodeInputValue: value,
                        organizationFiscalCode: pipe(
                          O.some(value),
                          O.filter(NonEmptyString.is),
                          O.map(_ => _.replace(/\s/g, "")),
                          O.map(_ => OrganizationFiscalCode.decode(_))
                        )
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
    navigateBack();
  },
  navigateToWalletHome: () => navigateToWalletHome(),
  navigateToWalletAddPaymentMethod: () =>
    navigateToWalletAddPaymentMethod({
      inPayment: O.none,
      showOnlyPayablePaymentMethods: true
    }),
  navigateToTransactionSummary: (
    rptId: RptId,
    initialAmount: AmountInEuroCents
  ) => {
    Keyboard.dismiss();
    dispatch(paymentInitializeState());

    navigateToPaymentTransactionSummaryScreen({
      rptId,
      initialAmount,
      paymentStartOrigin: "manual_insertion"
    });
  }
});

const mapStateToProps = (state: GlobalState) => ({
  hasMethodsCanPay: withPaymentFeatureSelector(state).length > 0
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(ManualDataInsertionScreen));
