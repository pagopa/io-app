/**
 * description
 */

import { Text } from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import I18n from "../../i18n";
import { Dispatch } from "../../store/actions/types";
import { paymentRequestCancel } from "../../store/actions/wallet/payment";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type ReduxMappedDispatchProps = Readonly<{
  cancelPayment: () => void;
}>;

type Props = OwnProps & ReduxMappedDispatchProps;

class GoBackLink extends React.PureComponent<Props> {
  public render(): React.ReactNode {
    return (
      <Text
        bold={true}
        white={true}
        alignCenter={true}
        onPress={() => this.props.cancelPayment()}
      >
        {I18n.t("wallet.ConfirmPayment.cancelPayment")}
      </Text>
    );
  }
}

/**
 *  goBack should have the same behaviour of the Cancel button of the screens related to the payment.
 *  The effects of the story https://www.pivotaltracker.com/n/projects/2048617/stories/159427678
 * should be reflected here too
 */
const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  cancelPayment: () => dispatch(paymentRequestCancel())
});

export default connect(
  undefined,
  mapDispatchToProps
)(GoBackLink);
