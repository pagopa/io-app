import * as pot from "italia-ts-commons/lib/pot";
import { Button, View } from "native-base";
import * as React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H1 } from "../../../../../components/core/typography/H1";
import { Label } from "../../../../../components/core/typography/Label";
import { GlobalState } from "../../../../../store/reducers/types";
import { navigateToBpdDetails } from "../../navigation/actions";
import { BpdPeriod, bpdPeriodsLoad } from "../../store/actions/periods";
import {
  BpdPeriodAmount,
  bpdPeriodsAmountSnappedListSelector
} from "../../store/reducers/details/combiner";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const foldPeriods = (
  potPeriods: pot.Pot<ReadonlyArray<BpdPeriodAmount>, Error>,
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
    value =>
      value ? renderPeriods(value, action) : <H1>Periods Undefined</H1>,
    _ => null,
    _ => null
  );

const renderPeriods = (
  periods: ReadonlyArray<BpdPeriodAmount>,
  action: (id: BpdPeriod) => void
) =>
  periods.map(p => (
    <Button
      key={p.period.awardPeriodId}
      style={{ flex: 1 }}
      onPress={() => action(p)}
    >
      <Label color={"white"}>{p.period.awardPeriodId}</Label>
    </Button>
  ));

type OwnProps = {
  potPeriods: pot.Pot<ReadonlyArray<BpdPeriodAmount>, Error>;
  onPeriodSelected: (period: BpdPeriod) => void;
};

export const TMPBpdPeriodsAsButtons = (props: OwnProps) => (
  <View style={{ flexDirection: "row", alignContent: "stretch" }}>
    {foldPeriods(props.potPeriods, props.onPeriodSelected)}
  </View>
);

/**
 * A temp component to render the bpd periods as button and navigate to bpdDetails with the selected period
 * TODO: Remove
 * @constructor
 * @deprecated
 */
const TmpPeriods: React.FunctionComponent<Props> = props => {
  // for test purpose, just load at the startup (no retry case)
  useEffect(() => {
    props.loadPeriods();
  }, []);

  return (
    <TMPBpdPeriodsAsButtons
      potPeriods={props.periods}
      onPeriodSelected={props.navigateToBpdDetails}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadPeriods: () => dispatch(bpdPeriodsLoad.request()),
  navigateToBpdDetails: (period: BpdPeriod) =>
    dispatch(navigateToBpdDetails(period))
});

const mapStateToProps = (state: GlobalState) => ({
  periods: bpdPeriodsAmountSnappedListSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(TmpPeriods);
