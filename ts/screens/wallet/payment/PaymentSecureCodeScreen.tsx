/**
 * This screen allows you to enter the CVC,CVV code to proceed with the payment.
 * Now it is used for Maestro cards.
 */

import * as React from "react";
// tslint:disable-next-line:no-commented-code
// import { StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
// tslint:disable-next-line:no-commented-code
// import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
// import { Dispatch } from "../../../store/actions/types";
// import variables from "../../../theme/variables";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps;

class PaymentSecureCodeScreen extends React.Component<Props> {}

export default connect()(PaymentSecureCodeScreen);
