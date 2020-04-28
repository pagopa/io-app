/**
 * Wallet home screen, with a list of recent transactions,
 * a "pay notice" button and payment methods info/button to
 * add new ones
 */
import { reverse } from "fp-ts/lib/Array";
import { View } from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { withValidatedEmail } from "../../components/helpers/withValidatedEmail";
import { withValidatedPagoPaVersion } from "../../components/helpers/withValidatedPagoPaVersion";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import PaymentHistoryList from "../../components/wallet/PaymentsHistoryList";
import I18n from "../../i18n";
import { navigateToPaymentHistoryDetail } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import {
  PaymentHistory,
  paymentsHistorySelector
} from "../../store/reducers/payments/history";
import { GlobalState } from "../../store/reducers/types";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps;

/**
 * Payment Screen
 */
class PaymentsHistoryScreen extends React.Component<Props, never> {
  private goBack = () => this.props.navigation.goBack();
  public render(): React.ReactNode {
    const { historyPayments } = this.props;
    return (
      <BaseScreenComponent
        goBack={this.goBack}
        headerTitle={I18n.t("payment.details.list.title")}
      >
        <PaymentHistoryList
          title={I18n.t("wallet.latestTransactions")}
          payments={reverse([...historyPayments])}
          ListEmptyComponent={<View />}
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
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(PaymentsHistoryScreen)
  )
);
