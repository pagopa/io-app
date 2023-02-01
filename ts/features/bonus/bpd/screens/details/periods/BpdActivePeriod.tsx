import { View } from "react-native";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { GlobalState } from "../../../../../../store/reducers/types";
import IbanInformationComponent from "../components/iban/IbanInformationComponent";
import BpdSummaryComponent from "../components/summary/BpdSummaryComponent";
import UnsubscribeToBpd from "../components/unsubscribe/UnsubscribeToBpd";
import WalletPaymentMethodBpdList from "../components/paymentMethod/WalletPaymentMethodBpdList";
import { VSpacer } from "../../../../../../components/core/spacer/Spacer";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * Render the details for a current active cashback period
 * @constructor
 */
const BpdActivePeriod: React.FunctionComponent<Props> = () => (
  <View style={IOStyles.horizontalContentPadding}>
    <VSpacer size={16} />
    <BpdSummaryComponent />
    <VSpacer size={16} />
    <WalletPaymentMethodBpdList />
    <VSpacer size={16} />
    <IbanInformationComponent />
    <VSpacer size={16} />
    <UnsubscribeToBpd />
    <VSpacer size={40} />
  </View>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(BpdActivePeriod);
