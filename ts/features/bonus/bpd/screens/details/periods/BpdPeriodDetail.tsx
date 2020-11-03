import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { GlobalState } from "../../../../../../store/reducers/types";
import { BpdPeriod } from "../../../store/actions/periods";
import { bpdSelectedPeriodSelector } from "../../../store/reducers/details/selectedPeriod";
import BpdActivePeriod from "./BpdActivePeriod";
import BpdClosedPeriod from "./BpdClosedPeriod";
import BpdInactivePeriod from "./BpdInactivePeriod";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const selectPeriodScreen = (period: BpdPeriod) => {
  switch (period.status) {
    case "Active":
      return <BpdActivePeriod />;
    case "Closed":
      return <BpdClosedPeriod />;
    case "Inactive":
      return <BpdInactivePeriod />;
  }
};

/**
 * The body and details for a specific cashback period. Will change if is Active, Inactive or Closed
 * @constructor
 */
const BpdPeriodDetail: React.FunctionComponent<Props> = props => (
  <View style={IOStyles.flex}>
    {props.selectedPeriod && selectPeriodScreen(props.selectedPeriod)}
  </View>
);

const mapDispatchToProps = (dispatch: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  selectedPeriod: bpdSelectedPeriodSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(BpdPeriodDetail);
