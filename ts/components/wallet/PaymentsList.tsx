/**
 * This component displays a list of payments
 */
import { RptId } from "italia-pagopa-commons/lib/pagopa";
import { IWithinRangeStringTag } from "italia-ts-commons/lib/strings";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native";
import I18n from "../../i18n";
import { PaymentsHistoryState } from "../../store/reducers/payments/history";
import variables from "../../theme/variables";
import customVariables from "../../theme/variables";
import { formatDateAsLocal } from "../../utils/dates";
import DetailedlistItemPaymentComponent from "../DetailedListItemPaymentComponent";
import ItemSeparatorComponent from "../ItemSeparatorComponent";

type Props = Readonly<{
  title: string;
  payments: PaymentsHistoryState;
  navigateToPaymentDetailInfo: (paymentInfo: PaymentInformation) => void;
  ListEmptyComponent?: React.ReactNode;
}>;

const styles = StyleSheet.create({
  whiteContent: {
    backgroundColor: variables.colorWhite,
    flex: 1
  },
  subHeaderContent: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between"
  },
  brandDarkGray: {
    color: variables.brandDarkGray
  }
});

type PaymentsHistoryInformation = {
  id: string;
  paymentState: boolean;
  started_at: string;
  date: string;
  iuv: string;
  causaleVersamento: string & IWithinRangeStringTag<1, 141>;
  transactionState: boolean;
  creditore?: string;
  amount?: number;
  grandTotal?: number;
  idTransaction?: number;
};

export type EsitoPagamento = "Success" | "Incomplete" | "Failed";

export type PaymentInformation = {
  esito: EsitoPagamento;
  date: string;
  causaleVersamento?: string;
  creditore?: string;
  iuv: string;
  amount?: number;
  grandTotal?: number;
  idTransaction?: number;
};

const getCorrectIuv = (data: RptId): string => {
  switch (data.paymentNoticeNumber.auxDigit) {
    case "0":
      return data.paymentNoticeNumber.iuv13;
    case "1":
      return data.paymentNoticeNumber.iuv17;
    case "2":
      return data.paymentNoticeNumber.iuv15;
    case "3":
      return data.paymentNoticeNumber.iuv13;
  }
};

export const returnData = (
  payments: PaymentsHistoryState
): ReadonlyArray<PaymentsHistoryInformation> => {
  return payments.map((value, index) => {
    return {
      id: value.paymentId ? value.paymentId : `N-${index}`,
      paymentState:
        value.verified_data !== undefined && value.failure === undefined,
      started_at: value.started_at,
      date: formatDateAsLocal(new Date(value.started_at)),
      iuv: getCorrectIuv(value.data),
      causaleVersamento:
        value.verified_data !== undefined
          ? value.verified_data.causaleVersamento
          : "",
      transactionState: value.transaction !== undefined,
      creditore:
        value.transaction !== undefined
          ? value.transaction.merchant
          : undefined,
      amount:
        value.transaction !== undefined
          ? value.transaction.amount.amount
          : undefined,
      grandTotal:
        value.transaction !== undefined
          ? value.transaction.grandTotal.amount
          : undefined,
      idTransaction:
        value.transaction !== undefined ? value.transaction.id : undefined
    };
  });
};

export const checkPaymentOutcome = (
  paymentState: boolean,
  transactionState: boolean | undefined = false
): EsitoPagamento => {
  return paymentState
    ? transactionState
      ? "Success"
      : "Incomplete"
    : "Failed";
};

/**
 * Payments List component
 */

export default class PaymentList extends React.Component<Props> {
  private renderPayments = (
    info: ListRenderItemInfo<PaymentsHistoryInformation>
  ) => {
    const esito = checkPaymentOutcome(
      info.item.paymentState,
      info.item.transactionState
    );
    return (
      <DetailedlistItemPaymentComponent
        text11={
          esito === "Success"
            ? I18n.t("payment.details.state.successful")
            : esito === "Failed"
              ? I18n.t("payment.details.state.failed")
              : I18n.t("payment.details.state.incomplete")
        }
        text2={info.item.date}
        text3={
          esito === "Success"
            ? info.item.causaleVersamento
            : I18n.t("payment.details.list.iuv", {
                iuv: info.item.iuv
              })
        }
        color={
          esito === "Success"
            ? customVariables.brandHighlight
            : esito === "Failed"
              ? customVariables.brandDanger
              : customVariables.badgeYellow
        }
        onPressItem={() =>
          this.props.navigateToPaymentDetailInfo({
            esito,
            date: info.item.started_at,
            causaleVersamento: info.item.causaleVersamento,
            creditore: info.item.creditore,
            iuv: info.item.iuv,
            amount: info.item.amount,
            grandTotal: info.item.grandTotal,
            idTransaction: info.item.idTransaction
          })
        }
      />
    );
  };

  public render(): React.ReactNode {
    const { ListEmptyComponent, payments } = this.props;

    return payments.length === 0 && ListEmptyComponent ? (
      ListEmptyComponent
    ) : (
      <Content style={styles.whiteContent}>
        <View>
          <View style={styles.subHeaderContent}>
            <Text>{I18n.t("payment.details.list.title")}</Text>
          </View>
        </View>
        <FlatList
          scrollEnabled={false}
          data={returnData(payments)}
          renderItem={this.renderPayments}
          ItemSeparatorComponent={() => (
            <ItemSeparatorComponent noPadded={true} />
          )}
          ListFooterComponent={<View spacer={true} extralarge={true} />}
          keyExtractor={item => item.id.toString()}
        />
      </Content>
    );
  }
}
