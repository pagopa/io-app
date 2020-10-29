import { Button, View } from "native-base";
import * as pot from "italia-ts-commons/lib/pot";
import { useEffect } from "react";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H1 } from "../../../../../components/core/typography/H1";
import { Label } from "../../../../../components/core/typography/Label";
import { GlobalState } from "../../../../../store/reducers/types";
import { navigateToBpdDetails } from "../../navigation/actions";
import { BpdPeriod, bpdPeriodsLoad } from "../../store/actions/periods";
import { bpdPeriodsSelector } from "../../store/reducers/details/periods";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const foldPeriods = (
  potPeriods: pot.Pot<ReadonlyArray<BpdPeriod>, Error>,
  action: (id: BpdPeriod) => void
) =>
  pot.fold(
    potPeriods,
    () => null,
    () => <H1>Loading...</H1>,
    _ => null,
    error => <H1>Error {error.message}</H1>,
    value =>
      value ? renderPeriods(value, action) : <H1>Periods Undefined</H1>,
    _ => null,
    _ => null,
    _ => null
  );

const renderPeriods = (
  periods: ReadonlyArray<BpdPeriod>,
  action: (id: BpdPeriod) => void
) =>
  periods.map(p => (
    <Button key={p.awardPeriodId} style={{ flex: 1 }} onPress={() => action(p)}>
      <Label color={"white"}>{p.awardPeriodId}</Label>
    </Button>
  ));

/**
 * A temp component to render the bpd periods as button and navigate to bpdDetails with the selected period
 * TODO: Complete after the completion of the bpd cards
 * @constructor
 */
const TmpPeriods: React.FunctionComponent<Props> = props => {
  // for test purpose, just load at the startup (no retry case)
  useEffect(() => {
    props.loadPeriods();
  }, []);

  return (
    <View style={{ flex: 1, flexDirection: "row", alignContent: "stretch" }}>
      {foldPeriods(props.periods, props.navigateToBpdDetails)}
    </View>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadPeriods: () => dispatch(bpdPeriodsLoad.request()),
  navigateToBpdDetails: (period: BpdPeriod) =>
    dispatch(navigateToBpdDetails(period))
});

const mapStateToProps = (state: GlobalState) => ({
  periods: bpdPeriodsSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(TmpPeriods);
