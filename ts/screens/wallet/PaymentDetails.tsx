/**
 * Wallet home screen, with a list of recent transactions,
 * a "pay notice" button and payment methods info/button to
 * add new ones
 */
import I18n from "i18n-js";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import ItemSeparatorComponent from "../../components/ItemSeparatorComponent";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import IconFont from "../../components/ui/IconFont";
import { EsitoPagamento } from "../../components/wallet/PaymentsList";
import customVariables from "../../theme/variables";
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";
import { formatDateAsLocal } from "../../utils/dates";
import { formatPaymentAmount } from "../../utils/payment";

type NavigationParams = Readonly<{
  id: string;
  esito: EsitoPagamento;
  date: string;
  causaleVersamento?: string;
  creditore?: string;
  iuv: string;
  amount?: number;
  grandTotal?: number;
  idTransaction?: number;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

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
  subHeaderContent: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between"
  },
  brandDarkGray: {
    color: customVariables.brandDarkGray
  },
  box: {
    marginTop: 10,
    marginBottom: 10,
    flexDirection: "column",
    justifyContent: "flex-start"
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

/**
 * Payment Details
 */
export default class PaymentDetails extends React.Component<Props, never> {
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

  private helpButton = () => (
    <ButtonDefaultOpacity style={styles.helpButton}>
      <IconFont name={"io-messaggi"} style={styles.helpButtonIcon} />
      <Text style={styles.helpButtonText}>
        {I18n.t("payment.details.info.buttons.help")}
      </Text>
    </ButtonDefaultOpacity>
  );
  private getAmount = (amount: number): string => {
    return formatPaymentAmount(amount);
  };
  public render(): React.ReactNode {
    const esito = this.props.navigation.getParam("esito");
    const dateBase = new Date(this.props.navigation.getParam("date"));
    const dateAsLocal = formatDateAsLocal(dateBase, true, true);
    // tslint:disable-next-line: restrict-plus-operands
    const time = `${(dateBase.getHours() < 10 ? "0" : "") +
      // tslint:disable-next-line: restrict-plus-operands
      dateBase.getHours()}:${(dateBase.getMinutes() < 10 ? "0" : "") +
      dateBase.getMinutes()}`;
    const date = `${dateAsLocal} - ${time}`;
    const causaleVersamento = this.props.navigation.getParam(
      "causaleVersamento"
    );
    const creditore = this.props.navigation.getParam("creditore");
    const iuv = this.props.navigation.getParam("iuv");
    const amount = this.props.navigation.getParam("amount");
    const grandTotal = this.props.navigation.getParam("grandTotal");
    const idTransaction = this.props.navigation.getParam("idTransaction");
    return (
      <BaseScreenComponent goBack={this.goBack} dark={true}>
        <Content style={styles.darkContent} noPadded={true}>
          <View style={styles.whiteContent}>
            <View style={styles.box}>
              <Text>{I18n.t("payment.details.info.title")}</Text>
            </View>
            <ItemSeparatorComponent noPadded={true} />
            <View style={styles.box}>
              {esito === "Success" ? (
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
                <Text style={styles.text2}>{date}</Text>
              </View>
            </View>
            <ItemSeparatorComponent noPadded={true} />
            {esito === "Success" &&
              amount &&
              grandTotal && (
                <React.Fragment>
                  <View style={styles.box}>
                    <View style={styles.row}>
                      <Text style={styles.text1}>
                        {I18n.t("payment.details.info.paymentAmount")}
                      </Text>
                      <Text style={styles.text2}>
                        € {this.getAmount(amount)}
                      </Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.text1}>
                        {I18n.t("payment.details.info.transactionCosts")}
                      </Text>
                      <Text style={styles.text2}>
                        € {this.getAmount(grandTotal - amount)}
                      </Text>
                    </View>
                    <View spacer={true} />
                    <View style={styles.row}>
                      <Text
                        style={[
                          styles.text1,
                          { fontSize: 18, fontWeight: "700" }
                        ]}
                      >
                        {I18n.t("payment.details.info.totalPaid")}
                      </Text>
                      <Text style={[styles.text2, { fontSize: 18 }]}>
                        € {this.getAmount(grandTotal)}
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

            {esito !== "Success" && <View spacer={true} extralarge={true} />}

            <View
              style={[
                styles.box,
                {
                  justifyContent: "center",
                  alignItems: "center"
                }
              ]}
            >
              <Text
                style={[
                  styles.text1,
                  {
                    textAlign: "center",
                    lineHeight: 17
                  }
                ]}
              >
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
