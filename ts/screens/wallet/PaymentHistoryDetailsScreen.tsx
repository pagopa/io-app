/**
 * Wallet home screen, with a list of recent transactions,
 * a "pay notice" button and payment methods info/button to
 * add new ones
 */
import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { DetailEnum } from "../../../definitions/backend/PaymentProblemJson";
import { PaymentRequestsGetResponse } from "../../../definitions/backend/PaymentRequestsGetResponse";
import {
  instabugLog,
  openInstabugBugReport,
  TypeLogs
} from "../../boot/configureInstabug";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import ItemSeparatorComponent from "../../components/ItemSeparatorComponent";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import IconFont from "../../components/ui/IconFont";
import { getIuv } from "../../components/wallet/PaymentsHistoryList";
import { SlidedContentComponent } from "../../components/wallet/SlidedContentComponent";
import I18n from "../../i18n";
import {
  isPaymentDoneSuccessfully,
  PaymentHistory
} from "../../store/reducers/payments/history";
import { profileSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { Transaction } from "../../types/pagopa";
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";
import { formatDateAsLocal } from "../../utils/dates";
import { maybeInnerProperty } from "../../utils/options";
import { getPaymentHistoryDetails } from "../../utils/payment";
import { formatNumberCentsToAmount } from "../../utils/stringBuilder";

type NavigationParams = Readonly<{
  payment: PaymentHistory;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams> &
  ReturnType<typeof mapStateToProps>;

type Props = OwnProps;

const styles = StyleSheet.create({
  whiteContent: {
    backgroundColor: customVariables.colorWhite,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: customVariables.colorWhite,
    flex: 1,
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10
  },
  box: {
    marginTop: 10,
    marginBottom: 10,
    flexDirection: "column",
    justifyContent: "flex-start"
  },
  boxHelp: {
    justifyContent: "center",
    alignItems: "center"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  text2: {
    color: customVariables.brandDarkestGray,
    fontWeight: "700"
  },
  textHelp: {
    textAlign: "center",
    lineHeight: 17
  },
  textBig: { fontSize: 18 },
  textBold: { fontWeight: "700" },
  copyButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 0,
    height: 30,
    backgroundColor: customVariables.colorWhite,
    borderWidth: 1,
    borderColor: customVariables.brandPrimary
  },
  copyButtonText: {
    paddingRight: 15,
    paddingBottom: 0,
    paddingLeft: 15,
    fontSize: 14,
    lineHeight: 20,
    color: customVariables.brandPrimary
  },
  helpButton: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    flex: 5,
    paddingTop: 0,
    paddingBottom: 0,
    height: 40,
    backgroundColor: customVariables.colorWhite,
    borderWidth: 1,
    borderColor: customVariables.brandPrimary
  },
  helpButtonIcon: {
    lineHeight: 24,
    color: customVariables.brandPrimary
  },
  helpButtonText: {
    paddingRight: 10,
    paddingBottom: 0,
    paddingLeft: 10,
    fontSize: 14,
    lineHeight: 20,
    color: customVariables.brandPrimary
  }
});

const notAvailable = I18n.t("global.remoteStates.notAvailable");

const renderErrorTransactionMessage = (
  error?: keyof typeof DetailEnum
): string | undefined => {
  if (error === undefined) {
    return undefined;
  }
  switch (error) {
    case "PAYMENT_DUPLICATED":
      return I18n.t("wallet.errors.PAYMENT_DUPLICATED");
    case "INVALID_AMOUNT":
      return I18n.t("wallet.errors.INVALID_AMOUNT");
    case "PAYMENT_ONGOING":
      return I18n.t("wallet.errors.PAYMENT_ONGOING");
    case "PAYMENT_EXPIRED":
      return I18n.t("wallet.errors.PAYMENT_EXPIRED");
    case "PAYMENT_UNAVAILABLE":
      return I18n.t("wallet.errors.PAYMENT_UNAVAILABLE");
    case "PAYMENT_UNKNOWN":
      return I18n.t("wallet.errors.PAYMENT_UNKNOWN");
    case "DOMAIN_UNKNOWN":
      return I18n.t("wallet.errors.DOMAIN_UNKNOWN");
    default:
      return undefined;
  }
};

/**
 * Payment Details
 */
class PaymentHistoryDetailsScreen extends React.Component<Props> {
  private goBack = () => this.props.navigation.goBack();

  private copyButton = (text: string) => (
    <ButtonDefaultOpacity
      onPress={() => clipboardSetStringWithFeedback(text)}
      style={styles.copyButton}
    >
      <Text style={styles.copyButtonText}>
        {I18n.t("payment.details.info.buttons.copy")}
      </Text>
    </ButtonDefaultOpacity>
  );

  private instabugLogAndOpenReport = () => {
    pot.map(this.props.profile, p => {
      instabugLog(
        getPaymentHistoryDetails(this.props.navigation.getParam("payment"), p),
        TypeLogs.INFO
      );
    });
    openInstabugBugReport();
  };

  private helpButton = () => (
    <ButtonDefaultOpacity
      onPress={this.instabugLogAndOpenReport}
      style={styles.helpButton}
    >
      <IconFont name={"io-messaggi"} style={styles.helpButtonIcon} />
      <Text style={styles.helpButtonText}>
        {I18n.t("payment.details.info.buttons.help")}
      </Text>
    </ButtonDefaultOpacity>
  );
  public render(): React.ReactNode {
    const payment = this.props.navigation.getParam("payment");
    const errorDetail = fromNullable(
      renderErrorTransactionMessage(payment.failure)
    );
    const paymentOutCome = isPaymentDoneSuccessfully(payment);
    const datetime: string = `${formatDateAsLocal(
      new Date(payment.started_at),
      true,
      true
    )} - ${new Date(payment.started_at).toLocaleTimeString()}`;
    const causaleVersamento = maybeInnerProperty<
      PaymentRequestsGetResponse,
      "causaleVersamento",
      string
    >(payment.verified_data, "causaleVersamento", m => m).fold(
      notAvailable,
      cv => cv
    );
    const creditore = maybeInnerProperty<Transaction, "merchant", string>(
      payment.transaction,
      "merchant",
      m => m
    ).fold(notAvailable, c => c);
    const iuv = getIuv(payment.data);
    const amount = maybeInnerProperty<Transaction, "amount", number>(
      payment.transaction,
      "amount",
      m => m.amount
    );
    const grandTotal = maybeInnerProperty<Transaction, "grandTotal", number>(
      payment.transaction,
      "grandTotal",
      m => m.amount
    );
    const idTransaction = maybeInnerProperty<Transaction, "id", number>(
      payment.transaction,
      "id",
      m => m
    ).fold(notAvailable, id => `${id}`);
    return (
      <BaseScreenComponent
        goBack={this.goBack}
        showInstabugChat={false}
        dark={true}
        headerTitle={I18n.t("payment.details.info.title")}
      >
        <SlidedContentComponent>
          <View style={styles.whiteContent}>
            <View style={styles.box}>
              <Text>{I18n.t("payment.details.info.title")}</Text>
            </View>
            <ItemSeparatorComponent noPadded={true} />
            <View style={styles.box}>
              {paymentOutCome.isSome() && paymentOutCome.value ? (
                <React.Fragment>
                  <View style={styles.box}>
                    <Text small={true}>
                      {I18n.t("payment.details.info.enteCreditore")}
                    </Text>
                    <Text style={styles.text2}>{creditore}</Text>
                  </View>
                  <View style={styles.box}>
                    <Text small={true}>
                      {I18n.t("payment.details.info.causaleVersamento")}
                    </Text>
                    <Text style={styles.text2}>{causaleVersamento}</Text>
                  </View>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <View style={styles.box}>
                    <Text small={true}>{I18n.t("payment.IUV")}</Text>
                    <Text style={styles.text2}>{iuv}</Text>
                  </View>
                  {errorDetail.isSome() && (
                    <View key={"error"} style={styles.box}>
                      <Text small={true}>{I18n.t("payment.errorDetails")}</Text>
                      <Text style={styles.text2}>{errorDetail.value}</Text>
                    </View>
                  )}
                </React.Fragment>
              )}

              <View style={styles.row}>
                <Text small={true}>
                  {I18n.t("payment.details.info.dateAndTime")}
                </Text>
                <Text style={styles.text2}>{datetime}</Text>
              </View>
            </View>
            <ItemSeparatorComponent noPadded={true} />
            {paymentOutCome.isSome() &&
              paymentOutCome.value &&
              amount.isSome() &&
              grandTotal.isSome() && (
                <React.Fragment>
                  <View style={styles.box}>
                    <View style={styles.row}>
                      <Text small={true}>
                        {I18n.t("payment.details.info.paymentAmount")}
                      </Text>
                      <Text style={styles.text2}>
                        {formatNumberCentsToAmount(amount.value, true)}
                      </Text>
                    </View>

                    <View style={styles.row}>
                      <Text small={true}>
                        {I18n.t("payment.details.info.transactionCosts")}
                      </Text>
                      <Text style={styles.text2}>
                        {formatNumberCentsToAmount(
                          grandTotal.value - amount.value,
                          true
                        )}
                      </Text>
                    </View>
                    <View spacer={true} />
                    <View style={styles.row}>
                      <Text
                        small={true}
                        style={[styles.textBig, styles.textBold]}
                      >
                        {I18n.t("payment.details.info.totalPaid")}
                      </Text>
                      <Text style={[styles.text2, styles.textBig]}>
                        {formatNumberCentsToAmount(grandTotal.value, true)}
                      </Text>
                    </View>
                  </View>

                  <ItemSeparatorComponent noPadded={true} />

                  <View style={styles.row}>
                    <View style={styles.box}>
                      <Text small={true}>
                        {I18n.t("payment.details.info.transactionCode")}
                      </Text>
                      <Text style={styles.text2}>{idTransaction}</Text>
                    </View>
                    <View
                      style={[
                        styles.box,
                        {
                          justifyContent: "center",
                          alignItems: "center"
                        }
                      ]}
                    >
                      {this.copyButton(`${idTransaction}`)}
                    </View>
                  </View>
                </React.Fragment>
              )}
            <View spacer={true} />
            <View style={[styles.box, styles.boxHelp]}>
              <Text small={true} style={styles.textHelp}>
                {I18n.t("payment.details.info.help")}
              </Text>
              <View spacer={true} />
              <View style={styles.row}>{this.helpButton()}</View>
            </View>
          </View>
        </SlidedContentComponent>
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  return {
    profile: profileSelector(state)
  };
};

export default connect(mapStateToProps)(PaymentHistoryDetailsScreen);
