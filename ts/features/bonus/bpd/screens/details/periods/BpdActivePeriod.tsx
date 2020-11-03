import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H5 } from "../../../../../../components/core/typography/H5";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { GlobalState } from "../../../../../../store/reducers/types";
import IbanInformationComponent from "../components/iban/IbanInformationComponent";
import BpdSummaryComponent from "../components/summary/BpdSummaryComponent";
import WalletPaymentMethodBpdList from "../components/WalletPaymentMethodBpdList";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * Render the details for a current active cashback period
 * @constructor
 */
const BpdActivePeriod: React.FunctionComponent<Props> = () => (
  <View style={IOStyles.horizontalContentPadding}>
    <View spacer={true} />
    <WalletPaymentMethodBpdList />
    <View spacer={true} />
    <BpdSummaryComponent />
    <View spacer={true} />
    <IbanInformationComponent />
    <View spacer={true} extralarge={true} />
    <H5>Active Period!</H5>
  </View>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(BpdActivePeriod);
