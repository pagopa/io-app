import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H1 } from "../../../../../components/core/typography/H1";
import { H3 } from "../../../../../components/core/typography/H3";
import { GlobalState } from "../../../../../store/reducers/types";
import { BpdPeriod } from "../../store/actions/periods";
import { bpdSelectPeriod } from "../../store/actions/selectedPeriod";
import { bpdPeriodsSelector } from "../../store/reducers/details/periods";
import { bpdSelectedPeriodSelector } from "../../store/reducers/details/selectedPeriod";
import { TMPBpdPeriodsAsButtons } from "../test/TMPPeriods";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  main: {
    backgroundColor: "#AAFFFF66",
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

/**
 * An horizontal snap scroll view used to select a specific period of bpd.
 * Each period is represented as a BpdPeriodCard.
 * @constructor
 */
const BpdPeriodSelector: React.FunctionComponent<Props> = props => (
  <View style={styles.main}>
    <H1>Period selector placeholder!</H1>
    <TMPBpdPeriodsAsButtons
      potPeriods={props.periods}
      onPeriodSelected={props.changeSelectPeriod}
    />
    <H1>Current period: {props.selectedPeriod?.awardPeriodId}</H1>
    <H3>{props.selectedPeriod?.startDate.toDateString()}</H3>
    <H3>{props.selectedPeriod?.endDate.toDateString()}</H3>
  </View>
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  changeSelectPeriod: (period: BpdPeriod) => dispatch(bpdSelectPeriod(period))
});

const mapStateToProps = (state: GlobalState) => ({
  periods: bpdPeriodsSelector(state),
  selectedPeriod: bpdSelectedPeriodSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(BpdPeriodSelector);
