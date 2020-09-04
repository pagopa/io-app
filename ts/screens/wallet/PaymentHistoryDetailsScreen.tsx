import { fromNullable } from "fp-ts/lib/Option";
import Instabug from "instabug-reactnative";
import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { EnteBeneficiario } from "../../../definitions/backend/EnteBeneficiario";
import { PaymentRequestsGetResponse } from "../../../definitions/backend/PaymentRequestsGetResponse";
import {
  instabugLog,
  openInstabugBugReport,
  TypeLogs
} from "../../boot/configureInstabug";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import CopyButtonComponent from "../../components/CopyButtonComponent";
import ItemSeparatorComponent from "../../components/ItemSeparatorComponent";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import IconFont from "../../components/ui/IconFont";
import { getPaymentHistoryInfo } from "../../components/wallet/PaymentsHistoryList";
import {
  paymentStatusType,
  PaymentSummaryComponent
} from "../../components/wallet/PaymentSummaryComponent";
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
import { formatDateAsLocal } from "../../utils/dates";
import { maybeInnerProperty } from "../../utils/options";
import {
  getCodiceAvviso,
  getErrorDescription,
  getPaymentHistoryDetails,
  getTransactionFee
} from "../../utils/payment";
import { formatNumberCentsToAmount } from "../../utils/stringBuilder";
import { isStringNullyOrEmpty } from "../../utils/strings";

type NavigationParams = Readonly<{
  payment: PaymentHistory;
}>;

type Props = NavigationInjectedProps<NavigationParams> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  bigText: {
    fontSize: 20,
    lineHeight: 22
  },
  padded: { paddingHorizontal: customVariables.contentPadding }
});

const notAvailable = I18n.t("global.remoteStates.notAvailable");
const renderItem = (label: string, value?: string) => {
  if (isStringNullyOrEmpty(value)) {
    return null;
  }
  return (
    <React.Fragment>
      <Text>{label}</Text>
      <Text bold={true} white={false}>
        {value}
      </Text>
      <View spacer={true} />
    </React.Fragment>
  );
};
/**
 * Payment Details
 */
class PaymentHistoryDetailsScreen extends React.Component<Props> {
  private instabugLogAndOpenReport = () => {
    Instabug.appendTags(["payment-support"]);
    pot.map(this.props.profile, p => {
      instabugLog(
        getPaymentHistoryDetails(this.props.navigation.getParam("payment"), p),
        TypeLogs.INFO
      );
    });
    openInstabugBugReport();
  };

  private getData = () => {
    const payment = this.props.navigation.getParam("payment");
    const codiceAvviso = getCodiceAvviso(payment.data);
    const paymentCheckout = isPaymentDoneSuccessfully(payment);
    const paymentInfo = getPaymentHistoryInfo(payment, paymentCheckout);
    const paymentStatus: paymentStatusType = {
      color: paymentInfo.color,
      description: paymentInfo.text11
    };
    const errorDetail = fromNullable(getErrorDescription(payment.failure));

    const paymentOutcome = isPaymentDoneSuccessfully(payment);

    const dateTime: string = `${formatDateAsLocal(
      new Date(payment.started_at),
      true,
      true
    )} - ${new Date(payment.started_at).toLocaleTimeString()}`;

    const reason = maybeInnerProperty<
      PaymentRequestsGetResponse,
      "causaleVersamento",
      string
    >(payment.verified_data, "causaleVersamento", m => m).fold(
      notAvailable,
      cv => cv
    );

    const recipient = maybeInnerProperty<Transaction, "merchant", string>(
      payment.transaction,
      "merchant",
      m => m
    ).fold(notAvailable, c => c);

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

    const fee = getTransactionFee(payment.transaction);

    const enteBeneficiario = maybeInnerProperty<
      PaymentRequestsGetResponse,
      "enteBeneficiario",
      EnteBeneficiario | undefined
    >(payment.verified_data, "enteBeneficiario", m => m).getOrElse(undefined);

    return {
      recipient,
      reason,
      enteBeneficiario,
      codiceAvviso,
      paymentOutcome,
      paymentInfo,
      paymentStatus,
      dateTime,
      amount,
      fee,
      grandTotal,
      errorDetail,
      idTransaction
    };
  };

  private standardRow = (label: string, value: string) => (
    <View style={styles.row}>
      <Text style={styles.flex}>{label}</Text>
      <Text bold={true} dark={true}>
        {value}
      </Text>
    </View>
  );

  private renderSeparator = () => (
    <React.Fragment>
      <View spacer={true} large={true} />
      <ItemSeparatorComponent noPadded={true} />
      <View spacer={true} large={true} />
    </React.Fragment>
  );

  private renderHelper = () => (
    <View>
      <Text alignCenter={true} style={styles.padded}>
        {I18n.t("payment.details.info.help")}
      </Text>
      <View spacer={true} />
      <ButtonDefaultOpacity
        onPress={this.instabugLogAndOpenReport}
        bordered={true}
        block={true}
      >
        <IconFont name={"io-messaggi"} />
        <Text>{I18n.t("payment.details.info.buttons.help")}</Text>
      </ButtonDefaultOpacity>
    </View>
  );

  public render(): React.ReactNode {
    const data = this.getData();

    return (
      <BaseScreenComponent
        goBack={this.props.navigation.goBack}
        showInstabugChat={false}
        dark={true}
        headerTitle={I18n.t("payment.details.info.title")}
      >
        <SlidedContentComponent hasFlatBottom={true}>
          {data.paymentOutcome.isSome() && data.paymentOutcome.value ? (
            <PaymentSummaryComponent
              title={I18n.t("payment.details.info.title")}
              recipient={data.recipient}
              description={data.reason}
              paymentStatus={data.paymentStatus}
            />
          ) : (
            <React.Fragment>
              <PaymentSummaryComponent
                title={I18n.t("payment.details.info.title")}
                codiceAvviso={data.codiceAvviso}
                paymentStatus={data.paymentStatus}
              />
              {data.enteBeneficiario &&
                renderItem(
                  I18n.t("payment.details.info.enteCreditore"),
                  `${data.enteBeneficiario.denominazioneBeneficiario}\n${data.enteBeneficiario.identificativoUnivocoBeneficiario}`
                )}
              {data.errorDetail.isSome() && (
                <View key={"error"}>
                  <Text>{I18n.t("payment.errorDetails")}</Text>
                  <Text bold={true} dark={true}>
                    {data.errorDetail.value}
                  </Text>
                </View>
              )}
            </React.Fragment>
          )}

          <View spacer={true} xsmall={true} />
          {this.standardRow(
            I18n.t("payment.details.info.dateAndTime"),
            data.dateTime
          )}

          {this.renderSeparator()}

          {data.paymentOutcome.isSome() &&
            data.paymentOutcome.value &&
            data.amount.isSome() &&
            data.grandTotal.isSome() && (
              <React.Fragment>
                {/** amount */}
                {this.standardRow(
                  I18n.t("wallet.firstTransactionSummary.amount"),
                  formatNumberCentsToAmount(data.amount.value, true)
                )}

                {/** fee */}
                {data.fee &&
                  this.standardRow(
                    I18n.t("wallet.firstTransactionSummary.fee"),
                    data.fee
                  )}

                <View spacer={true} />

                {/** total amount */}
                <View style={styles.row}>
                  <Text
                    style={[styles.bigText, styles.flex]}
                    bold={true}
                    dark={true}
                  >
                    {I18n.t("wallet.firstTransactionSummary.total")}
                  </Text>
                  <Text style={styles.bigText} bold={true} dark={true}>
                    {formatNumberCentsToAmount(data.grandTotal.value, true)}
                  </Text>
                </View>

                {this.renderSeparator()}

                {/** Transaction id */}
                <View>
                  <Text>
                    {I18n.t("wallet.firstTransactionSummary.idTransaction")}
                  </Text>
                  <View style={styles.row}>
                    <Text bold={true} dark={true}>
                      {data.idTransaction}
                    </Text>
                    <CopyButtonComponent
                      textToCopy={data.idTransaction.toString()}
                    />
                  </View>
                </View>
                <View spacer={true} extralarge={true} />
              </React.Fragment>
            )}

          {this.renderHelper()}
        </SlidedContentComponent>
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  profile: profileSelector(state)
});

export default connect(mapStateToProps)(PaymentHistoryDetailsScreen);
