import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { GlobalState } from "../../../../../../store/reducers/types";
import IbanInformationComponent from "../components/iban/IbanInformationComponent";
import BpdSummaryComponent from "../components/summary/BpdSummaryComponent";
import UnsubscribeToBpd from "../components/UnsubscribeToBpd";
import WalletPaymentMethodBpdList from "../components/WalletPaymentMethodBpdList";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * Render the details for a future cashback period
 * @constructor
 */
const BpdInactivePeriod: React.FunctionComponent<Props> = () => (
  <View style={IOStyles.horizontalContentPadding}>
    <View spacer={true} />
    <BpdSummaryComponent />
    <View spacer={true} />
    <WalletPaymentMethodBpdList />
    <View spacer={true} />
    <IbanInformationComponent />
    <View spacer={true} />
    <UnsubscribeToBpd />
    <View spacer={true} extralarge={true} />
  </View>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(BpdInactivePeriod);
