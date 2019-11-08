/**
 * This screen allows you to enter the CVC,CVV code to proceed with the payment.
 * Now it is used for Maestro cards.
 */

import { none, Option, some } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-pagopa-commons/lib/pagopa";
import { ActionSheet, Content, Text } from "native-base";
import * as React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet
} from "react-native";
import { NavigationEvents, NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { LabelledItem } from "../../../components/LabelledItem";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import MaskedInput from "../../../components/ui/MaskedInput";
import PaymentBannerComponent from "../../../components/wallet/PaymentBannerComponent";
import I18n from "../../../i18n";
import { identificationRequest } from "../../../store/actions/identification";
import {
  navigateToPaymentEnterSecureCode,
  navigateToPaymentPickPaymentMethodScreen,
  navigateToPaymentPickPspScreen,
  navigateToTransactionDetailsScreen
} from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import {
  backToEntrypointPayment,
  paymentCompletedFailure,
  paymentCompletedSuccess,
  paymentExecutePayment,
  paymentInitializeState,
  runDeleteActivePaymentSaga
} from "../../../store/actions/wallet/payment";
import {
  fetchTransactionsRequest,
  runPollTransactionSaga
} from "../../../store/actions/wallet/transactions";
import variables from "../../../theme/variables";
import {
  isCompletedTransaction,
  isSuccessTransaction,
  Psp,
  Transaction,
  Wallet
} from "../../../types/pagopa";
import { AmountToImporto } from "../../../utils/amounts";
import { CreditCardCVC } from "../../../utils/input";
import { showToast } from "../../../utils/showToast";

type NavigationParams = Readonly<{
  verifica: PaymentRequestsGetResponse;
  rptId: RptId;
  initialAmount: AmountInEuroCents;
  idPayment: string;
  wallet: Wallet;
  psps: ReadonlyArray<Psp>;
}>;
type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = OwnProps & ReturnType<typeof mapDispatchToProps>;

type State = Readonly<{
  securityCode: Option<string>;
}>;

const EMPTY_CARD_SECURITY_CODE = "";

const INITIAL_STATE: State = {
  securityCode: none
};

const styles = StyleSheet.create({
  whiteBg: {
    backgroundColor: variables.colorWhite
  },

  noLeftMargin: {
    marginLeft: 0
  }
});

class PaymentSecureCodeScreen extends React.Component<Props, State> {
  private securityCodeRef = React.createRef<typeof MaskedInput>();
  constructor(props: Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  private updateSecurityCodeState(value: string) {
    this.setState({
      securityCode:
        value && value !== EMPTY_CARD_SECURITY_CODE ? some(value) : none
    });
  }
  private isValidSecurityCode() {
    return this.state.securityCode
      .map(securityCode => {
        return CreditCardCVC.is(securityCode);
      })
      .toUndefined();
  }
  public render(): React.ReactNode {
    const verifica = this.props.navigation.getParam("verifica");
    const currentAmount = AmountToImporto.encode(
      verifica.importoSingoloVersamento
    );

    const paymentReason = verifica.causaleVersamento;

    return (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("wallet.confirmPayment.securityVerification")}
      >
        <Content noPadded={true}>
          <PaymentBannerComponent
            currentAmount={currentAmount}
            paymentReason={paymentReason}
          />
          <NavigationEvents onWillFocus={undefined} />

          <ScrollView
            style={styles.whiteBg}
            keyboardShouldPersistTaps="handled"
          >
            <ScreenContentHeader
              title={I18n.t("wallet.confirmPayment.insertCode")}
              icon={require("../../../../img/wallet/cvc-icon.png")}
              // fixed={Platform.OS === "ios"}
            />
            <Content scrollEnabled={false}>
              <LabelledItem
                type={"masked"}
                label={""}
                icon=""
                isValid={this.isValidSecurityCode()}
                inputMaskProps={{
                  ref: this.securityCodeRef,
                  value: this.state.securityCode.getOrElse(
                    EMPTY_CARD_SECURITY_CODE
                  ),
                  placeholder: I18n.t("wallet.dummyCard.values.securityCode"),
                  keyboardType: "numeric",
                  returnKeyType: "done",
                  maxLength: 4,
                  secureTextEntry: true,
                  mask: "[0009]",
                  onChangeText: (_, value) =>
                    this.updateSecurityCodeState(value)
                }}
              />
              <Text>{I18n.t("wallet.confirmPayment.insertCVC")}</Text>
            </Content>
          </ScrollView>
        </Content>
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={Platform.select({
            ios: 0,
            android: variables.contentPadding
          })}
        >
          {this.renderFooterButtons()}
        </KeyboardAvoidingView>
      </BaseScreenComponent>
    );
  }

  /**
   * Footer
   */
  private renderFooterButtons() {
    const secondaryButtonProps = {
      block: true,
      light: true,
      bordered: true,
      onPress: this.props.onCancel,
      cancel: true,
      title: I18n.t("global.buttons.cancel")
    };
    const primaryButtonProps = {
      block: true,
      primary: true,
      disabled: false,
      onPress: () => this.props.runAuthorizationAndPayment(),
      title: I18n.t("global.buttons.continue")
    };

    return (
      <FooterWithButtons
        type="TwoButtonsInlineThird"
        leftButton={secondaryButtonProps}
        rightButton={primaryButtonProps}
      />
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => {
  const onTransactionTimeout = () => {
    dispatch(backToEntrypointPayment());
    showToast(I18n.t("wallet.confirmPayment.transactionTimeout"), "warning");
  };

  const onTransactionValid = (tx: Transaction) => {
    if (isSuccessTransaction(tx)) {
      // on success:
      dispatch(
        navigateToTransactionDetailsScreen({
          isPaymentCompletedTransaction: true,
          transaction: tx
        })
      );
      // signal success
      dispatch(
        paymentCompletedSuccess({
          transaction: tx,
          rptId: props.navigation.getParam("rptId"),
          kind: "COMPLETED"
        })
      );
      // reset the payment state
      dispatch(paymentInitializeState());
      // update the transactions state
      dispatch(fetchTransactionsRequest());
      // navigate to the resulting transaction details
      showToast(I18n.t("wallet.confirmPayment.transactionSuccess"), "success");
    } else {
      // on failure:
      // navigate to entrypoint of payment or wallet home
      dispatch(backToEntrypointPayment());
      // signal faliure
      dispatch(paymentCompletedFailure());
      // delete the active payment from pagoPA
      dispatch(runDeleteActivePaymentSaga());
      // reset the payment state
      dispatch(paymentInitializeState());
      showToast(I18n.t("wallet.confirmPayment.transactionFailure"), "danger");
    }
  };

  const onIdentificationSuccess = () => {
    dispatch(
      paymentExecutePayment.request({
        wallet: props.navigation.getParam("wallet"),
        idPayment: props.navigation.getParam("idPayment"),
        onSuccess: action => {
          dispatch(
            runPollTransactionSaga({
              id: action.payload.id,
              isValid: isCompletedTransaction,
              onTimeout: onTransactionTimeout,
              onValid: onTransactionValid
            })
          );
        }
      })
    );
  };

  const runAuthorizationAndPayment = () =>
    // inserire qui controllo MAESTRO
    dispatch(
      identificationRequest(
        false,
        {
          message: I18n.t("wallet.confirmPayment.identificationMessage")
        },
        {
          label: I18n.t("wallet.confirmPayment.cancelPayment"),
          onCancel: () => undefined
        },
        {
          onSuccess: onIdentificationSuccess
        }
      )
    );
  return {
    pickPaymentMethod: () =>
      dispatch(
        navigateToPaymentPickPaymentMethodScreen({
          rptId: props.navigation.getParam("rptId"),
          initialAmount: props.navigation.getParam("initialAmount"),
          verifica: props.navigation.getParam("verifica"),
          idPayment: props.navigation.getParam("idPayment")
        })
      ),
    pickPsp: () =>
      dispatch(
        navigateToPaymentPickPspScreen({
          rptId: props.navigation.getParam("rptId"),
          initialAmount: props.navigation.getParam("initialAmount"),
          verifica: props.navigation.getParam("verifica"),
          idPayment: props.navigation.getParam("idPayment"),
          psps: props.navigation.getParam("psps"),
          wallet: props.navigation.getParam("wallet")
        })
      ),
    onCancel: () => {
      ActionSheet.show(
        {
          options: [
            I18n.t("wallet.confirmPayment.confirmCancelPayment"),
            I18n.t("wallet.confirmPayment.confirmContinuePayment")
          ],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
          title: I18n.t("wallet.confirmPayment.confirmCancelTitle")
        },
        buttonIndex => {
          if (buttonIndex === 0) {
            // on cancel:
            // navigate to entrypoint of payment or wallet home
            dispatch(backToEntrypointPayment());
            // delete the active payment from pagoPA
            dispatch(runDeleteActivePaymentSaga());
            // reset the payment state
            dispatch(paymentInitializeState());
            showToast(
              I18n.t("wallet.confirmPayment.cancelPaymentSuccess"),
              "success"
            );
          }
        }
      );
    },
    runAuthorizationAndPayment,
    onRetry: runAuthorizationAndPayment,
    navigateToPaymentEnterSecureCode: () =>
      dispatch(
        navigateToPaymentEnterSecureCode({
          verifica: props.navigation.getParam("verifica"),
          rptId: props.navigation.getParam("rptId"),
          initialAmount: props.navigation.getParam("initialAmount"),
          idPayment: props.navigation.getParam("idPayment"),
          psps: props.navigation.getParam("psps"),
          wallet: props.navigation.getParam("wallet")
        })
      )
  };
};

export default connect(
  null,
  mapDispatchToProps
)(PaymentSecureCodeScreen);
