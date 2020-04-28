/**
 * This component displays a list of payments
 */
import { fromNullable, Option } from "fp-ts/lib/Option";
import { RptId } from "italia-pagopa-commons/lib/pagopa";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import I18n from "../../i18n";
import {
  isPaymentDoneSuccessfully,
  PaymentHistory,
  PaymentsHistoryState
} from "../../store/reducers/payments/history";
import variables from "../../theme/variables";
import customVariables from "../../theme/variables";
import { formatDateAsLocal } from "../../utils/dates";
import ItemSeparatorComponent from "../ItemSeparatorComponent";
import PaymentHistoryItem from "./PaymentHistoryItem";

type Props = Readonly<{
  title: string;
  payments: PaymentsHistoryState;
  profile?: InitializedProfile;
  navigateToPaymentHistoryDetail: (
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

export const getIuv = (data: RptId): string => {
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

/**
 * Payments List component
 */

export default class PaymentHistoryList extends React.Component<Props> {
  private getPaymentHistoryInfo = (
    paymentHistory: PaymentHistory,
    paymentCheckout: Option<boolean>
  ) => {
    return paymentCheckout.fold(
      {
        text11: I18n.t("payment.details.state.incomplete"),
        text3: getIuv(paymentHistory.data),
        color: customVariables.badgeYellow
      },
      success => {
        if (success) {
          return {
            text11: I18n.t("payment.details.state.successful"),
            text3: fromNullable(paymentHistory.verified_data).fold("", vd =>
              fromNullable(vd.causaleVersamento).fold("", cv => cv)
            ),
            color: customVariables.brandHighlight
          };
        }
        return {
          text11: I18n.t("payment.details.state.failed"),
          text3: getIuv(paymentHistory.data),
          color: customVariables.brandDanger
        };
      }
    );
  };

  private renderHistoryPaymentItem = (
    info: ListRenderItemInfo<PaymentHistory>
  ) => {
    const paymentCheckout = isPaymentDoneSuccessfully(info.item);
    const paymentInfo = this.getPaymentHistoryInfo(info.item, paymentCheckout);
    const datetime: string = `${formatDateAsLocal(
      new Date(info.item.started_at),
      true,
      true
    )} - ${new Date(info.item.started_at).toLocaleTimeString()}`;
    return (
      <PaymentHistoryItem
        text11={paymentInfo.text11}
        text2={datetime}
        text3={paymentInfo.text3}
        color={paymentInfo.color}
        onPressItem={() => {
          this.props.navigateToPaymentHistoryDetail(
            info.item,
            this.props.profile
          );
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
              renderItem={this.renderHistoryPaymentItem}
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
