import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { GlobalState } from "../../../../../../store/reducers/types";
import BpdSummaryComponent from "../components/summary/BpdSummaryComponent";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * Render the details for a completed and closed cashback periods
 * @constructor
 */
const BpdClosedPeriod: React.FunctionComponent<Props> = () => (
  <View style={IOStyles.horizontalContentPadding}>
    <View spacer={true} />
    <BpdSummaryComponent />
    <View spacer={true} extralarge={true} />
  </View>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(BpdClosedPeriod);
