import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H5 } from "../../../../../../components/core/typography/H5";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { GlobalState } from "../../../../../../store/reducers/types";
import IbanInformationComponent from "../components/iban/IbanInformationComponent";
import { TransactionsGraphicalSummary } from "../components/summary/TransactionsGraphicalSummary";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * Render the details for a current active cashback period
 * @constructor
 */
const BpdActivePeriod: React.FunctionComponent<Props> = () => (
  <View style={IOStyles.horizontalContentPadding}>
    <View spacer={true} />
    <TransactionsGraphicalSummary transactions={50} minTransactions={50} />
    <IbanInformationComponent />
    <View spacer={true} extralarge={true} />
    <H5>Active Period!</H5>
  </View>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(BpdActivePeriod);
