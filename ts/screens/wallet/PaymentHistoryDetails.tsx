/**
 * Wallet home screen, with a list of recent transactions,
 * a "pay notice" button and payment methods info/button to
 * add new ones
 */
import { fromNullable, Option } from "fp-ts/lib/Option";
import I18n from "i18n-js";
import * as pot from "italia-ts-commons/lib/pot";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
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
import {
  isPaymentDoneSuccessfully,
  PaymentHistory
} from "../../store/reducers/payments/history";
import { profileSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";
import { formatDateAsLocal } from "../../utils/dates";
import { getPaymentHistoryDetails } from "../../utils/payment";
import { formatNumberCentsToAmount } from "../../utils/stringBuilder";

type NavigationParams = Readonly<{
  payment: PaymentHistory;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams> &
  ReturnType<typeof mapStateToProps>;

type Props = OwnProps;

const styles = StyleSheet.create({
  darkContent: {
    backgroundColor: customVariables.brandDarkGray,
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10
  },
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
  text1: {
    fontSize: 14
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

const notAvailable = "n/a";

const maybeProperty = <T, K extends keyof T, R>(
  item: T | undefined,
  key: K,
  extractor: (value: T[K]) => R
): Option<R> => {
  return fromNullable(item)
    .mapNullable(s => s[key])
    .map(value => extractor(value));
};

/**
 * Payment Details
 */
class PaymentHistoryDetails extends React.Component<Props> {
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

  private printInstabugLogAndOpenReport = () => {
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
      onPress={this.printInstabugLogAndOpenReport}
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
    const paymentOutCome = isPaymentDoneSuccessfully(payment);
    const datetime: string = `${formatDateAsLocal(
      new Date(payment.started_at),
      true,
      true
    )} - ${new Date(payment.started_at).toLocaleTimeString()}`;
    // tslint:disable-no-inferred-empty-object-type
    const causaleVersamento = maybeProperty(
      payment.verified_data,
      "causaleVersamento",
      m => m
    ).fold(notAvailable, cv => cv);
    // tslint:disable-no-inferred-empty-object-type
    const creditore = maybeProperty(
      payment.transaction,
      "merchant",
      m => m
    ).fold(notAvailable, c => c);
    const iuv = getIuv(payment.data);
    const amount = maybeProperty(payment.transaction, "amount", m => m.amount);
    const grandTotal = maybeProperty(
      payment.transaction,
      "grandTotal",
      m => m.amount
    );
    const idTransaction = maybeProperty(payment.transaction, "id", m => m).fold(
      notAvailable,
      id => `${id}`
    );
    return (
      <BaseScreenComponent
        goBack={this.goBack}
        dark={true}
        headerTitle={I18n.t("payment.details.info.title")}
      >
        <Content style={styles.darkContent} noPadded={true}>
          <View style={styles.whiteContent}>
            <View style={styles.box}>
              <Text>{I18n.t("payment.details.info.title")}</Text>
            </View>
            <ItemSeparatorComponent noPadded={true} />
            <View style={styles.box}>
              {paymentOutCome.isSome() && paymentOutCome.value ? (
                <React.Fragment>
                  <View style={styles.box}>
                    <Text style={styles.text1}>
                      {I18n.t("payment.details.info.enteCreditore")}
                    </Text>
                    <Text style={styles.text2}>{creditore}</Text>
                  </View>
                  <View style={styles.box}>
                    <Text style={styles.text1}>
                      {I18n.t("payment.details.info.causaleVersamento")}
                    </Text>
                    <Text style={styles.text2}>{causaleVersamento}</Text>
                  </View>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <View style={styles.box}>
                    <Text style={styles.text1}>{I18n.t("payment.IUV")}</Text>
                    <Text style={styles.text2}>{iuv}</Text>
                  </View>
                </React.Fragment>
              )}

              <View style={styles.row}>
                <Text style={styles.text1}>
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
                      <Text style={styles.text1}>
                        {I18n.t("payment.details.info.paymentAmount")}
                      </Text>
                      <Text style={styles.text2}>
                        {formatNumberCentsToAmount(amount.value, true)}
                      </Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.text1}>
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
                        style={[styles.text1, styles.textBig, styles.textBold]}
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
                      <Text style={styles.text1}>
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
            <View spacer={true} extralarge={true} />
            <View style={[styles.box, styles.boxHelp]}>
              <Text style={[styles.text1, styles.textHelp]}>
                {I18n.t("payment.details.info.help")}
              </Text>
              <View spacer={true} />
              <View style={styles.row}>{this.helpButton()}</View>
            </View>
          </View>
        </Content>
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  return {
    profile: profileSelector(state)
  };
};

export default connect(mapStateToProps)(PaymentHistoryDetails);
