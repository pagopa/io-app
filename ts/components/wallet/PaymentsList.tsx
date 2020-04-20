/**
 * This component displays a list of payments
 */
import { RptId } from "italia-pagopa-commons/lib/pagopa";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native";
import I18n from "../../i18n";
import {
  isPaymentDoneSuccessfully,
  PaymentsHistoryState
} from "../../store/reducers/payments/history";
import variables from "../../theme/variables";
import customVariables from "../../theme/variables";
import { Transaction } from "../../types/pagopa";
import { formatDateAsLocal } from "../../utils/dates";
import DetailedlistItemPaymentComponent from "../DetailedListItemPaymentComponent";
import ItemSeparatorComponent from "../ItemSeparatorComponent";

type Props = Readonly<{
  title: string;
  payments: PaymentsHistoryState;
  navigateToPaymentDetailInfo: (paymentInfo: PaymentInfo) => void;
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

export type EsitoPagamento = "Success" | "Incomplete" | "Failed";

export type PaymentInfo = {
  id: string;
  esito: EsitoPagamento;
  date: string;
  causaleVersamento?: string;
  creditore?: string;
  iuv: string;
  amount?: number;
  grandTotal?: number;
  idTransaction?: number;
  isValidTransaction?: boolean;
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
): ReadonlyArray<PaymentInfo> => {
  return payments.map((value, index) => {
    const esito = checkPaymentOutcome(isPaymentDoneSuccessfully(value));
    return {
      id: value.paymentId ? value.paymentId : `N-${index}`,
      esito,
      date: value.started_at,
      causaleVersamento:
        value.verified_data !== undefined
          ? value.verified_data.causaleVersamento
          : undefined,
      creditore:
        value.transaction !== undefined
          ? value.transaction.merchant
          : undefined,
      iuv: getCorrectIuv(value.data),
      amount:
        value.transaction !== undefined
          ? value.transaction.amount.amount
          : undefined,
      grandTotal:
        value.transaction !== undefined
          ? value.transaction.grandTotal.amount
          : undefined,
      idTransaction:
        value.transaction !== undefined ? value.transaction.id : undefined,
      isValidTransaction: typeof value.transaction === typeof Transaction
    };
  });
};

export const checkPaymentOutcome = (
  // tslint:disable-next-line: bool-param-default
  isSetPaymentState?: boolean
): EsitoPagamento => {
  return isSetPaymentState !== undefined
    ? isSetPaymentState
      ? "Success"
      : "Failed"
    : "Incomplete";
};

/**
 * Payments List component
 */

export default class PaymentList extends React.Component<Props> {
  private renderPayments = (info: ListRenderItemInfo<PaymentInfo>) => {
    return (
      <DetailedlistItemPaymentComponent
        text11={
          info.item.esito === "Success"
            ? I18n.t("payment.details.state.successful")
            : info.item.esito === "Failed"
              ? I18n.t("payment.details.state.failed")
              : I18n.t("payment.details.state.incomplete")
        }
        text2={formatDateAsLocal(new Date(info.item.date))}
        text3={
          info.item.esito === "Success"
            ? info.item.causaleVersamento === undefined
              ? ""
              : info.item.causaleVersamento
            : I18n.t("payment.details.list.iuv", {
                iuv: info.item.iuv
              })
        }
        color={
          info.item.esito === "Success"
            ? customVariables.brandHighlight
            : info.item.esito === "Failed"
              ? customVariables.brandDanger
              : customVariables.badgeYellow
        }
        onPressItem={() => {
          if (!info.item.isValidTransaction && info.item.esito === "Success") {
            // Here instabug log
          } else {
            this.props.navigateToPaymentDetailInfo({
              id: info.item.id,
              esito: info.item.esito,
              date: info.item.date,
              causaleVersamento: info.item.causaleVersamento,
              creditore: info.item.creditore,
              iuv: info.item.iuv,
              amount: info.item.amount,
              grandTotal: info.item.grandTotal,
              idTransaction: info.item.idTransaction
            });
          }
        }}
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
