import { reverse } from "fp-ts/lib/Array";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationStackScreenProps } from "react-navigation-stack";
import { connect } from "react-redux";
import { H2 } from "../../components/core/typography/H2";
import { withValidatedEmail } from "../../components/helpers/withValidatedEmail";
import { withValidatedPagoPaVersion } from "../../components/helpers/withValidatedPagoPaVersion";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import PaymentHistoryList from "../../components/wallet/PaymentsHistoryList";
import I18n from "../../i18n";
import { navigateToPaymentHistoryDetail } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import {
  PaymentHistory,
  paymentsHistorySelector
} from "../../store/reducers/payments/history";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  NavigationStackScreenProps;

const styles = StyleSheet.create({
  noBottomPadding: {
    padding: variables.contentPadding,
    paddingBottom: 0
  },
  whiteBg: {
    backgroundColor: variables.colorWhite
  }
});

const ListEmptyComponent = (
  <Content
    scrollEnabled={false}
    style={[styles.noBottomPadding, styles.whiteBg]}
  >
    <H2 color={"bluegrey"}>{I18n.t("payment.details.list.empty.title")}</H2>
    <View spacer={true} />
    <Text>{I18n.t("payment.details.list.empty.description")}</Text>
    <View spacer={true} large={true} />
    <EdgeBorderComponent />
  </Content>
);

/**
 * A screen displaying the list of all the transactions apprached
 * by the user (completed or cancelled for any reason).
 */
class PaymentsHistoryScreen extends React.Component<Props, never> {
  public render(): React.ReactNode {
    const { historyPayments } = this.props;
    return (
      <BaseScreenComponent
        goBack={this.props.navigation.goBack}
        headerTitle={I18n.t("payment.details.list.title")}
      >
        <PaymentHistoryList
          title={I18n.t("wallet.latestTransactions")}
          payments={reverse([...historyPayments])}
          ListEmptyComponent={ListEmptyComponent}
          navigateToPaymentHistoryDetail={(payment: PaymentHistory) =>
            this.props.navigateToPaymentHistoryDetail({
              payment
            })
          }
        />
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  historyPayments: paymentsHistorySelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToPaymentHistoryDetail: (param: { payment: PaymentHistory }) =>
    dispatch(navigateToPaymentHistoryDetail(param))
});

export default withValidatedPagoPaVersion(
  withValidatedEmail(
    connect(mapStateToProps, mapDispatchToProps)(PaymentsHistoryScreen)
  )
);
