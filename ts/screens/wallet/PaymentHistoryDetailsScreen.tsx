import { fromNullable } from "fp-ts/lib/Option";
import Instabug from "instabug-reactnative";
import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { EnteBeneficiario } from "../../../definitions/backend/EnteBeneficiario";
import { PaymentRequestsGetResponse } from "../../../definitions/backend/PaymentRequestsGetResponse";
import {
  instabugLog,
  openInstabugQuestionReport,
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
import { PaymentHistory } from "../../store/reducers/payments/history";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { Transaction } from "../../types/pagopa";
import { formatDateAsLocal } from "../../utils/dates";
import { maybeInnerProperty } from "../../utils/options";
import {
  getCodiceAvviso,
  getErrorDescriptionV2,
  getPaymentHistoryDetails,
  getPaymentOutcomeCodeDescription,
  getTransactionFee,
  paymentInstabugTag
} from "../../utils/payment";
import { formatNumberCentsToAmount } from "../../utils/stringBuilder";
import { isStringNullyOrEmpty } from "../../utils/strings";
import { outcomeCodesSelector } from "../../store/reducers/wallet/outcomeCode";
import { isPaymentDoneSuccessfully } from "../../store/reducers/payments/utils";
import { assistanceToolConfigSelector } from "../../store/reducers/backendStatus";
import { Dispatch } from "../../store/actions/types";
import { zendeskSupportStart } from "../../features/zendesk/store/actions";
import {
  assistanceToolRemoteConfig,
  canShowHelp
} from "../../utils/supportAssistance";
import { ToolEnum } from "../../../definitions/content/AssistanceToolConfig";

type NavigationParams = Readonly<{
  payment: PaymentHistory;
}>;

type Props = NavigationInjectedProps<NavigationParams> &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

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
  padded: { paddingHorizontal: customVariables.contentPadding },
  button: {
    marginBottom: 15
  }
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
    Instabug.appendTags([paymentInstabugTag]);
    instabugLog(
      getPaymentHistoryDetails(this.props.navigation.getParam("payment")),
      TypeLogs.INFO,
      paymentInstabugTag
    );
    openInstabugQuestionReport();
  };

  private zendeskAssistanceLogAndStart = () => {
    // TODO: set log as custom field
    // TODO: set payment as category
    this.props.zendeskSupportWorkunitStart();
  };

  private choosenTool = assistanceToolRemoteConfig(
    this.props.assistanceToolConfig
  );

  private handleAskAssistance = () => {
    switch (this.choosenTool) {
      case ToolEnum.instabug:
        this.instabugLogAndOpenReport();
        break;
      case ToolEnum.zendesk:
        this.zendeskAssistanceLogAndStart();
    }
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
    // the error could be on attiva or while the payment execution
    // so the description is built first checking the attiva failure, alternatively
    // it checks about the outcome if the payment went wrong
    const errorDetail = fromNullable(
      getErrorDescriptionV2(payment.failure)
    ).alt(
      fromNullable(payment.outcomeCode).chain(oc =>
        getPaymentOutcomeCodeDescription(oc, this.props.outcomeCodes)
      )
    );

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
    >(payment.verifiedData, "causaleVersamento", m => m).fold(
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
    >(payment.verifiedData, "enteBeneficiario", m => m).getOrElse(undefined);

    const outcomeCode = payment.outcomeCode ?? "-";
    return {
      recipient,
      reason,
      enteBeneficiario,
      codiceAvviso,
      paymentOutcome,
      paymentInfo,
      paymentStatus,
      dateTime,
      outcomeCode,
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

  /**
   * This fragment is rendered only if {@link canShowHelp} is true
   */
  private renderHelper = () => (
    <View>
      <Text alignCenter={true} style={styles.padded}>
        {I18n.t("payment.details.info.help")}
      </Text>
      <View spacer={true} />
      <ButtonDefaultOpacity
        onPress={this.handleAskAssistance}
        bordered={true}
        block={true}
        style={styles.button}
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
        goBack={() => this.props.navigation.goBack()}
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
            I18n.t("payment.details.info.outcomeCode"),
            data.outcomeCode
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
          {/* This check is redundant, since if the help can't be shown the user can't get there */}
          {canShowHelp(this.choosenTool) && this.renderHelper()}
        </SlidedContentComponent>
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  outcomeCodes: outcomeCodesSelector(state),
  assistanceToolConfig: assistanceToolConfigSelector(state)
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  // Start the assistance without FAQ ("n/a" is a placeholder)
  zendeskSupportWorkunitStart: () =>
    dispatch(
      zendeskSupportStart({ startingRoute: "n/a", assistanceForPayment: true })
    )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentHistoryDetailsScreen);
