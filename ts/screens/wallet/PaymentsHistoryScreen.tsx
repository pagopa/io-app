import * as AR from "fp-ts/lib/Array";
import { Content } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { VSpacer } from "../../components/core/spacer/Spacer";
import { Body } from "../../components/core/typography/Body";
import { H2 } from "../../components/core/typography/H2";
import { IOColors } from "../../components/core/variables/IOColors";
import { withValidatedEmail } from "../../components/helpers/withValidatedEmail";
import { withValidatedPagoPaVersion } from "../../components/helpers/withValidatedPagoPaVersion";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import PaymentHistoryList from "../../components/wallet/PaymentsHistoryList";
import I18n from "../../i18n";
import {
  AppParamsList,
  IOStackNavigationRouteProps
} from "../../navigation/params/AppParamsList";
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
  IOStackNavigationRouteProps<AppParamsList>;

const styles = StyleSheet.create({
  noBottomPadding: {
    padding: variables.contentPadding,
    paddingBottom: 0
  },
  whiteBg: {
    backgroundColor: IOColors.white
  }
});

const ListEmptyComponent = (
  <Content
    scrollEnabled={false}
    style={[styles.noBottomPadding, styles.whiteBg]}
  >
    <H2 color={"bluegrey"}>{I18n.t("payment.details.list.empty.title")}</H2>
    <VSpacer size={16} />
    <Body>{I18n.t("payment.details.list.empty.description")}</Body>
    <VSpacer size={24} />
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
        goBack={() => this.props.navigation.goBack()}
        headerTitle={I18n.t("payment.details.list.title")}
      >
        <PaymentHistoryList
          title={I18n.t("wallet.latestTransactions")}
          payments={AR.reverse([...historyPayments])}
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

const mapDispatchToProps = (_: Dispatch) => ({
  navigateToPaymentHistoryDetail: (param: { payment: PaymentHistory }) =>
    navigateToPaymentHistoryDetail(param)
});

export default withValidatedPagoPaVersion(
  withValidatedEmail(
    connect(mapStateToProps, mapDispatchToProps)(PaymentsHistoryScreen)
  )
);
