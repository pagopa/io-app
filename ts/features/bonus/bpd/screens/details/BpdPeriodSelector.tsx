import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import * as pot from "italia-ts-commons/lib/pot";
import { H1 } from "../../../../../components/core/typography/H1";
import { H3 } from "../../../../../components/core/typography/H3";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { GlobalState } from "../../../../../store/reducers/types";
import { BpdCardComponent } from "../../components/bpdCardComponent/BpdCardComponent";
import { BpdPeriod } from "../../store/actions/periods";
import { bpdSelectPeriod } from "../../store/actions/selectedPeriod";
import { bpdAmountForSelectedPeriod } from "../../store/reducers/details/amounts";
import { bpdPeriodsAmountSnappedListSelector } from "../../store/reducers/details/combiner";
import { bpdSelectedPeriodSelector } from "../../store/reducers/details/selectedPeriod";
import { TMPBpdPeriodsAsButtons } from "../test/TMPPeriods";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  main: {
    flex: 1
  }
});

/**
 * An horizontal snap scroll view used to select a specific period of bpd.
 * Each period is represented as a BpdPeriodCard.
 * TODO: snapped list to choose and show the selected period: ATM only display current period
 * @constructor
 */
const BpdPeriodSelector: React.FunctionComponent<Props> = props => (
  <View style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
    {props.selectedPeriod && pot.isSome(props.selectedAmount) && (
      <BpdCardComponent
        period={props.selectedPeriod}
        totalAmount={props.selectedAmount.value}
      />
    )}
    {pot.isSome(props.periods) && props.periods.value.length > 1 && (
      <TMPBpdPeriodsAsButtons
        potPeriods={props.periods}
        onPeriodSelected={props.changeSelectPeriod}
      />
    )}
  </View>
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  changeSelectPeriod: (period: BpdPeriod) => dispatch(bpdSelectPeriod(period))
});

const mapStateToProps = (state: GlobalState) => ({
  periods: bpdPeriodsAmountSnappedListSelector(state),
  selectedPeriod: bpdSelectedPeriodSelector(state),
  selectedAmount: bpdAmountForSelectedPeriod(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(BpdPeriodSelector);
