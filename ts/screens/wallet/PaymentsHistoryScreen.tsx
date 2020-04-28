/**
 * Wallet home screen, with a list of recent transactions,
 * a "pay notice" button and payment methods info/button to
 * add new ones
 */
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
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
import { profileSelector } from "../../store/reducers/profile";
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
    const { historyPayments, potProfile } = this.props;
    // order by started_at DESC
    const payments = [...historyPayments].sort((a, b) => {
      const keyA = a.started_at;
      const keyB = b.started_at;
      return keyA < keyB ? 1 : keyA > keyB ? -1 : 0;
    });
    const currentProfile =
      !pot.isError(potProfile) && pot.isSome(potProfile)
        ? potProfile.value
        : undefined;
    return (
      <BaseScreenComponent goBack={this.goBack}>
        <PaymentHistoryList
          title={I18n.t("wallet.latestTransactions")}
          payments={payments}
          profile={currentProfile}
          ListEmptyComponent={<View />}
          navigateToPaymentHistoryDetail={(payment: PaymentHistory) =>
            this.props.navigateToPaymentHistoryDetail({
              payment,
              profile: currentProfile
            })
          }
        />
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  historyPayments: paymentsHistorySelector(state),
  potProfile: profileSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToPaymentHistoryDetail: (param: {
    payment: PaymentHistory;
    profile?: InitializedProfile;
  }) => dispatch(navigateToPaymentHistoryDetail(param))
});

export default withValidatedPagoPaVersion(
  withValidatedEmail(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(PaymentsHistoryScreen)
  )
);
