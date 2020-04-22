/**
 * This component displays a list of payments
 */
import { BugReporting } from "instabug-reactnative";
import { RptId } from "italia-pagopa-commons/lib/pagopa";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import { instabugLog, TypeLogs } from "../../boot/configureInstabug";
import I18n from "../../i18n";
import {
  isPaymentDoneSuccessfully,
  PaymentHistory,
  PaymentsHistoryState
} from "../../store/reducers/payments/history";
import variables from "../../theme/variables";
import customVariables from "../../theme/variables";
import { formatDateAsLocal } from "../../utils/dates";
import { getPaymentHistoryDetails } from "../../utils/payment";
import DetailedlistItemPaymentComponent from "../DetailedListItemPaymentComponent";
import ItemSeparatorComponent from "../ItemSeparatorComponent";

type Props = Readonly<{
  title: string;
  payments: PaymentsHistoryState;
  profile?: InitializedProfile;
  navigateToPaymentDetailInfo: (
    payment: PaymentHistory,
    profile?: InitializedProfile
  ) => void;
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

export const getCorrectIuv = (data: RptId): string => {
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
  private renderPayments = (info: ListRenderItemInfo<PaymentHistory>) => {
    const esito = checkPaymentOutcome(isPaymentDoneSuccessfully(info.item));
    return (
      <DetailedlistItemPaymentComponent
        text11={
          esito === "Success"
            ? I18n.t("payment.details.state.successful")
            : esito === "Failed"
              ? I18n.t("payment.details.state.failed")
              : I18n.t("payment.details.state.incomplete")
        }
        text2={formatDateAsLocal(new Date(info.item.started_at))}
        text3={
          esito === "Success"
            ? info.item.verified_data === undefined ||
              info.item.verified_data.causaleVersamento === undefined
              ? ""
              : info.item.verified_data.causaleVersamento
            : I18n.t("payment.details.list.iuv", {
                iuv: getCorrectIuv(info.item.data)
              })
        }
        color={
          esito === "Success"
            ? customVariables.brandHighlight
            : esito === "Failed"
              ? customVariables.brandDanger
              : customVariables.badgeYellow
        }
        onPressItem={() => {
          if (
            info.item.transaction === undefined &&
            esito === "Success" &&
            this.props.profile
          ) {
            // Print instabug log and open report screen
            instabugLog(
              getPaymentHistoryDetails(info.item, this.props.profile),
              TypeLogs.INFO
            );
            BugReporting.showWithOptions(BugReporting.reportType.bug, [
              BugReporting.option.commentFieldRequired
            ]);
          } else {
            this.props.navigateToPaymentDetailInfo(
              info.item,
              this.props.profile
            );
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
        {payments.length > 0 &&
          payments !== null && (
            <FlatList
              scrollEnabled={false}
              data={payments}
              renderItem={this.renderPayments}
              ItemSeparatorComponent={() => (
                <ItemSeparatorComponent noPadded={true} />
              )}
              ListFooterComponent={<View spacer={true} extralarge={true} />}
              keyExtractor={(_, index) => index.toString()}
            />
          )}
      </Content>
    );
  }
}
