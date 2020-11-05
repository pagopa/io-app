import { Millisecond } from "italia-ts-commons/lib/units";
import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import * as pot from "italia-ts-commons/lib/pot";
import { H1 } from "../../../../../components/core/typography/H1";
import { GlobalState } from "../../../../../store/reducers/types";
import { useRefreshDataWhenFocus } from "../../../../../utils/hooks/useRefreshDataWhenFocus";
import { bpdDetailsLoadAll } from "../../store/actions/details";
import { bpdPeriodsAmountWalletVisibleSelector } from "../../store/reducers/details/combiner";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const forceRefreshTime = 30000 as Millisecond;

/**
 * Render the bpd card in the wallet
 * //TODO: handle error, render only if some
 * @constructor
 */
const BpdCardsInWalletContainer: React.FunctionComponent<Props> = props => {
  useRefreshDataWhenFocus(props.load, forceRefreshTime);

  return (
    <View>
      {pot.isSome(props.periodsWithAmount) &&
        props.periodsWithAmount.value.map(pa => (
          <H1 key={pa.period.awardPeriodId}>
            {pa.period.startDate.toDateString()}
          </H1>
        ))}
    </View>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  load: () => dispatch(bpdDetailsLoadAll())
});

const mapStateToProps = (state: GlobalState) => ({
  periodsWithAmount: bpdPeriodsAmountWalletVisibleSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdCardsInWalletContainer);
