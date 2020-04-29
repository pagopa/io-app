/**
 * This component displays a list of payments
 */
import { fromNullable, Option } from "fp-ts/lib/Option";
import { RptId } from "italia-pagopa-commons/lib/pagopa";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native";
import { DetailEnum } from "../../../definitions/backend/PaymentProblemJson";
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
import { EdgeBorderComponent } from "../screens/EdgeBorderComponent";
import PaymentHistoryItem from "./PaymentHistoryItem";

type Props = Readonly<{
  title: string;
  payments: PaymentsHistoryState;
  navigateToPaymentHistoryDetail: (payment: PaymentHistory) => void;
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
  const iuv = () => {
    switch (data.paymentNoticeNumber.auxDigit) {
      case "0":
      case "3":
        return data.paymentNoticeNumber.iuv13;
      case "1":
        return data.paymentNoticeNumber.iuv17;
      case "2":
        return data.paymentNoticeNumber.iuv15;
      default:
        return "";
    }
  };
  return `IUV ${iuv()}`;
};

const notAvailable = I18n.t("global.remoteStates.notAvailable");

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
            text3: fromNullable(paymentHistory.verified_data).fold(
              notAvailable,
              vd =>
                fromNullable(vd.causaleVersamento).fold(notAvailable, cv => cv)
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
          this.props.navigateToPaymentHistoryDetail(info.item);
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
          data={payments}
          renderItem={this.renderHistoryPaymentItem}
          ItemSeparatorComponent={() => (
            <ItemSeparatorComponent noPadded={true} />
          )}
          ListFooterComponent={payments.length > 0 && <EdgeBorderComponent />}
          keyExtractor={(_, index) => index.toString()}
        />
      </Content>
    );
  }
}
