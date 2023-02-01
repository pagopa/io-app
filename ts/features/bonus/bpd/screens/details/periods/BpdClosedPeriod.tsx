import { View } from "react-native";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { VSpacer } from "../../../../../../components/core/spacer/Spacer";
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
    <VSpacer size={16} />
    <BpdSummaryComponent />
    <VSpacer size={40} />
    {props.currentPeriod && shouldRenderIbanComponent(props.currentPeriod) && (
      <>
        <IbanInformationComponent />
        <VSpacer size={40} />
      </>
    )}
  </View>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  currentPeriod: bpdSelectedPeriodSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(BpdClosedPeriod);
