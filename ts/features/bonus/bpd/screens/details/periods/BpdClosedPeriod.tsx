import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  BpdPeriodWithInfo,
  isGracePeriod
} from "../../../store/reducers/details/periods";
import { bpdSelectedPeriodSelector } from "../../../store/reducers/details/selectedPeriod";
import IbanInformationComponent from "../components/iban/IbanInformationComponent";
import BpdSummaryComponent from "../components/summary/BpdSummaryComponent";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const shouldRenderIbanComponent = (period: BpdPeriodWithInfo) =>
  isGracePeriod(period) ||
  (period.status === "Closed" &&
    period.amount.transactionNumber >= period.minTransactionNumber);

/**
 * Render the details for a completed and closed cashback periods
 * @constructor
 */
const BpdClosedPeriod = (props: Props): React.ReactElement => (
  <View style={IOStyles.horizontalContentPadding}>
    <View spacer={true} />
    <BpdSummaryComponent />
    <View spacer={true} extralarge={true} />
    {props.currentPeriod && shouldRenderIbanComponent(props.currentPeriod) && (
      <>
        <IbanInformationComponent />
        <View spacer={true} extralarge={true} />
      </>
    )}
  </View>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  currentPeriod: bpdSelectedPeriodSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(BpdClosedPeriod);
