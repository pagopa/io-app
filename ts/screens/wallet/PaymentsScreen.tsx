/**
 * Wallet home screen, with a list of recent transactions,
 * a "pay notice" button and payment methods info/button to
 * add new ones
 */
import { none } from "fp-ts/lib/Option";
import { View } from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { withValidatedEmail } from "../../components/helpers/withValidatedEmail";
import { withValidatedPagoPaVersion } from "../../components/helpers/withValidatedPagoPaVersion";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import PaymentList, { PaymentInfo } from "../../components/wallet/PaymentsList";
import I18n from "../../i18n";
import {
  navigateToPaymentDetailInfo,
  navigateToWalletAddPaymentMethod
} from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { paymentsHistorySelector } from "../../store/reducers/payments/history";
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
class PaymentScreen extends React.Component<Props, never> {
  private goBack = () => this.props.navigation.goBack();
  public render(): React.ReactNode {
    const { potPayments } = this.props;

    return (
      <BaseScreenComponent goBack={this.goBack}>
        <PaymentList
          title={I18n.t("wallet.latestTransactions")}
          payments={potPayments}
          ListEmptyComponent={<View />}
          navigateToPaymentDetailInfo={(paymentInfo: PaymentInfo) =>
            this.props.navigateToPaymentDetailInfo(paymentInfo)
          }
        />
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  potPayments: paymentsHistorySelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToWalletAddPaymentMethod: () =>
    dispatch(navigateToWalletAddPaymentMethod({ inPayment: none })),
  navigateToPaymentDetailInfo: (param: PaymentInfo) =>
    dispatch(navigateToPaymentDetailInfo(param))
});

export default withValidatedPagoPaVersion(
  withValidatedEmail(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(PaymentScreen)
  )
);
