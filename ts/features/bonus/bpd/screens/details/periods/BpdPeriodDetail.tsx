import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { GlobalState } from "../../../../../../store/reducers/types";
import { H1 } from "../../../../../../components/core/typography/H1";
import { bpdSelectedPeriodSelector } from "../../../store/reducers/details/selectedPeriod";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * The body and details for a specific cashback period. Will change if is Active, Inactive or Closed
 * @constructor
 */
const BpdPeriodDetail: React.FunctionComponent<Props> = () => (
  <View style={IOStyles.flex}>
    {/* {TODO: will choose the right representation (different components) based on the period} */}
    <H1>Period details Placeholder!</H1>
  </View>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  selectedPeriod: bpdSelectedPeriodSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(BpdPeriodDetail);
