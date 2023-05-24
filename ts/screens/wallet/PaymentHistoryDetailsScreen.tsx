import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { Text as NBButtonText } from "native-base";
import { View } from "react-native";
import { connect } from "react-redux";
import { EnteBeneficiario } from "../../../definitions/backend/EnteBeneficiario";
import { PaymentRequestsGetResponse } from "../../../definitions/backend/PaymentRequestsGetResponse";
import { ToolEnum } from "../../../definitions/content/AssistanceToolConfig";
import { ZendeskCategory } from "../../../definitions/content/ZendeskCategory";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import CopyButtonComponent from "../../components/CopyButtonComponent";
import { HSpacer, VSpacer } from "../../components/core/spacer/Spacer";
import { Body } from "../../components/core/typography/Body";
import { Label } from "../../components/core/typography/Label";
import { IOStyles } from "../../components/core/variables/IOStyles";
import ItemSeparatorComponent from "../../components/ItemSeparatorComponent";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { getPaymentHistoryInfo } from "../../components/wallet/PaymentsHistoryList";
import {
  paymentStatusType,
  PaymentSummaryComponent
} from "../../components/wallet/PaymentSummaryComponent";
import { SlidedContentComponent } from "../../components/wallet/SlidedContentComponent";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../features/zendesk/store/actions";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../navigation/params/WalletParamsList";
import { Dispatch } from "../../store/actions/types";
import { canShowHelpSelector } from "../../store/reducers/assistanceTools";
import { assistanceToolConfigSelector } from "../../store/reducers/backendStatus";
import { PaymentHistory } from "../../store/reducers/payments/history";
import { isPaymentDoneSuccessfully } from "../../store/reducers/payments/utils";
import { GlobalState } from "../../store/reducers/types";
import { outcomeCodesSelector } from "../../store/reducers/wallet/outcomeCode";
import { Transaction } from "../../types/pagopa";
import { formatDateAsLocal } from "../../utils/dates";
import { maybeInnerProperty } from "../../utils/options";
import {
  getCodiceAvviso,
  getErrorDescriptionV2,
  getPaymentHistoryDetails,
  getPaymentOutcomeCodeDescription,
  getTransactionFee
} from "../../utils/payment";
import { formatNumberCentsToAmount } from "../../utils/stringBuilder";
import { isStringNullyOrEmpty } from "../../utils/strings";
import {
  addTicketCustomField,
  appendLog,
  assistanceToolRemoteConfig,
  resetCustomFields,
  zendeskCategoryId,
  zendeskPaymentCategory,
  zendeskPaymentFailure,
  zendeskPaymentNav,
  zendeskPaymentOrgFiscalCode,
  zendeskPaymentStartOrigin
} from "../../utils/supportAssistance";
import { H2 } from "../../components/core/typography/H2";
import { Icon } from "../../components/core/icons/Icon";

export type PaymentHistoryDetailsScreenNavigationParams = Readonly<{
  payment: PaymentHistory;
}>;

type Props = IOStackNavigationRouteProps<
  WalletParamsList,
  "PAYMENT_HISTORY_DETAIL_INFO"
> &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const notAvailable = I18n.t("global.remoteStates.notAvailable");
const renderItem = (label: string, value?: string) => {
  if (isStringNullyOrEmpty(value)) {
    return null;
  }
  return (
    <React.Fragment>
      <Body>{label}</Body>
      <Label weight="Bold" color="bluegrey">
        {value}
      </Label>
      <VSpacer size={16} />
    </React.Fragment>
  );
};

/**
 * Payment Details
 */
class PaymentHistoryDetailsScreen extends React.Component<Props> {
  private zendeskAssistanceLogAndStart = () => {
    resetCustomFields();
    // Set pagamenti_pagopa as category
    addTicketCustomField(zendeskCategoryId, zendeskPaymentCategory.value);

    // Add organization fiscal code custom field
    addTicketCustomField(
      zendeskPaymentOrgFiscalCode,
      this.props.route.params.payment.data.organizationFiscalCode
    );
    if (this.props.route.params.payment.failure) {
      // Add failure custom field
      addTicketCustomField(
        zendeskPaymentFailure,
        this.props.route.params.payment.failure
      );
    }
    // Add start origin custom field
    addTicketCustomField(
      zendeskPaymentStartOrigin,
      this.props.route.params.payment.startOrigin
    );
    // Add rptId custom field
    addTicketCustomField(
      zendeskPaymentNav,
      getCodiceAvviso(this.props.route.params.payment.data)
    );
    // Append the payment history details in the log
    appendLog(getPaymentHistoryDetails(this.props.route.params.payment));

    this.props.zendeskSupportWorkunitStart();
    this.props.zendeskSelectedCategory(zendeskPaymentCategory);
  };
  private choosenTool = assistanceToolRemoteConfig(
    this.props.assistanceToolConfig
  );

  private handleAskAssistance = () => {
    switch (this.choosenTool) {
      case ToolEnum.zendesk:
        this.zendeskAssistanceLogAndStart();
        break;
    }
  };

  private getData = () => {
    const payment = this.props.route.params.payment;
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
    const errorDetail = pipe(
      getErrorDescriptionV2(payment.failure),
      O.fromNullable,
      O.alt(() =>
        pipe(
          payment.outcomeCode,
          O.fromNullable,
          O.chain(oc =>
            getPaymentOutcomeCodeDescription(oc, this.props.outcomeCodes)
          )
        )
      )
    );

    const paymentOutcome = isPaymentDoneSuccessfully(payment);

    const dateTime: string = `${formatDateAsLocal(
      new Date(payment.started_at),
      true,
      true
    )} - ${new Date(payment.started_at).toLocaleTimeString()}`;

    const reason = pipe(
      maybeInnerProperty<
        PaymentRequestsGetResponse,
        "causaleVersamento",
        string
      >(payment.verifiedData, "causaleVersamento", m => m),
      O.fold(
        () => notAvailable,
        cv => cv
      )
    );

    const recipient = pipe(
      maybeInnerProperty<Transaction, "merchant", string>(
        payment.transaction,
        "merchant",
        m => m
      ),
      O.fold(
        () => notAvailable,
        c => c
      )
    );

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
    const idTransaction = pipe(
      maybeInnerProperty<Transaction, "id", number>(
        payment.transaction,
        "id",
        m => m
      ),
      O.fold(
        () => notAvailable,
        id => `${id}`
      )
    );

    const fee = getTransactionFee(payment.transaction);

    const enteBeneficiario = pipe(
      maybeInnerProperty<
        PaymentRequestsGetResponse,
        "enteBeneficiario",
        EnteBeneficiario | undefined
      >(payment.verifiedData, "enteBeneficiario", m => m),
      O.toUndefined
    );

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
    <View style={[IOStyles.rowSpaceBetween, IOStyles.alignCenter]}>
      <View style={IOStyles.flex}>
        <Body>{label}</Body>
      </View>
      <Label weight="Bold" color="bluegreyDark">
        {value}
      </Label>
    </View>
  );

  private renderSeparator = () => (
    <React.Fragment>
      <VSpacer size={24} />
      <ItemSeparatorComponent noPadded={true} />
      <VSpacer size={24} />
    </React.Fragment>
  );

  /**
   * This fragment is rendered only if {@link canShowHelp} is true
   */
  private renderHelper = () => (
    <View>
      <View style={[IOStyles.horizontalContentPadding, IOStyles.alignCenter]}>
        <Body>{I18n.t("payment.details.info.help")}</Body>
      </View>
      <VSpacer size={16} />
      <ButtonDefaultOpacity
        onPress={this.handleAskAssistance}
        bordered={true}
        block={true}
      >
        <Icon name="chat" color="blue" />
        <HSpacer size={8} />
        <NBButtonText>
          {I18n.t("payment.details.info.buttons.help")}
        </NBButtonText>
      </ButtonDefaultOpacity>
      <VSpacer size={16} />
    </View>
  );

  public render(): React.ReactNode {
    const data = this.getData();

    return (
      <BaseScreenComponent
        goBack={() => this.props.navigation.goBack()}
        showChat={false}
        dark={true}
        headerTitle={I18n.t("payment.details.info.title")}
      >
        <SlidedContentComponent hasFlatBottom={true}>
          {O.isSome(data.paymentOutcome) && data.paymentOutcome.value ? (
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
              {O.isSome(data.errorDetail) && (
                <View key={"error"}>
                  <Body>{I18n.t("payment.errorDetails")}</Body>
                  <Body weight="SemiBold" color="bluegreyDark">
                    {data.errorDetail.value}
                  </Body>
                </View>
              )}
            </React.Fragment>
          )}
          <VSpacer size={4} />
          {this.standardRow(
            I18n.t("payment.details.info.outcomeCode"),
            data.outcomeCode
          )}
          <VSpacer size={4} />
          {this.standardRow(
            I18n.t("payment.details.info.dateAndTime"),
            data.dateTime
          )}
          {this.renderSeparator()}
          {O.isSome(data.paymentOutcome) &&
            data.paymentOutcome.value &&
            O.isSome(data.amount) &&
            O.isSome(data.grandTotal) && (
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

                <VSpacer size={16} />

                {/** total amount */}
                <View style={[IOStyles.rowSpaceBetween, IOStyles.alignCenter]}>
                  <View style={IOStyles.flex}>
                    <H2>{I18n.t("wallet.firstTransactionSummary.total")}</H2>
                  </View>
                  <H2>
                    {formatNumberCentsToAmount(data.grandTotal.value, true)}
                  </H2>
                </View>

                {this.renderSeparator()}

                {/** Transaction id */}
                <View>
                  <Body>
                    {I18n.t("wallet.firstTransactionSummary.idTransaction")}
                  </Body>
                  <View
                    style={[IOStyles.rowSpaceBetween, IOStyles.alignCenter]}
                  >
                    <Body weight="SemiBold" color="bluegreyDark">
                      {data.idTransaction}
                    </Body>
                    <CopyButtonComponent
                      textToCopy={data.idTransaction.toString()}
                    />
                  </View>
                </View>
                <VSpacer size={40} />
              </React.Fragment>
            )}
          {/* This check is redundant, since if the help can't be shown the user can't get there */}
          {this.props.canShowHelp && this.renderHelper()}
        </SlidedContentComponent>
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  outcomeCodes: outcomeCodesSelector(state),
  assistanceToolConfig: assistanceToolConfigSelector(state),
  canShowHelp: canShowHelpSelector(state)
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  // Start the assistance without FAQ ("n/a" is a placeholder)
  zendeskSupportWorkunitStart: () =>
    dispatch(
      zendeskSupportStart({
        startingRoute: "n/a",
        assistanceForPayment: true,
        assistanceForCard: false,
        assistanceForFci: false
      })
    ),
  zendeskSelectedCategory: (category: ZendeskCategory) =>
    dispatch(zendeskSelectedCategory(category))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentHistoryDetailsScreen);
