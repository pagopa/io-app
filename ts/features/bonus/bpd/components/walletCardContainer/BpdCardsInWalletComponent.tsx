import * as pot from "italia-ts-commons/lib/pot";
import { Millisecond } from "italia-ts-commons/lib/units";
import _ from "lodash";
import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../store/reducers/types";
import { useActionOnFocus } from "../../../../../utils/hooks/useOnFocus";
import { navigateToBpdDetails } from "../../navigation/actions";
import { bpdDetailsLoadAll } from "../../store/actions/details";
import { bpdPeriodsAmountWalletVisibleSelector } from "../../store/reducers/details/combiner";
import { BpdPeriodWithInfo } from "../../store/reducers/details/periods";
import { BpdCardComponent } from "../bpdCardComponent/BpdCardComponent";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const BpdCardList = (props: Props) => (
  <View>
    {pot.isSome(props.periodsWithAmount) &&
      props.periodsWithAmount.value.map(pa => (
        <BpdCardComponent
          key={pa.awardPeriodId}
          period={pa}
          totalAmount={pa.amount}
          preview={true}
          onPress={() => {
            props.navigateToCashbackDetails(pa);
          }}
        />
      ))}
  </View>
);

const BpdCardListMemo = React.memo(
  BpdCardList,
  (prev: Props, curr: Props) =>
    pot.isSome(prev.periodsWithAmount) &&
    pot.isSome(curr.periodsWithAmount) &&
    _.isEqual(curr.periodsWithAmount.value, prev.periodsWithAmount.value)
);

// Automatically refresh when focused every 5 minutes (the remote data can change every 4 h)
const refreshTime = 300000 as Millisecond;

/**
 * Render the bpd card in the wallet
 * //TODO: handle error, render only if some
 * @constructor
 */
const BpdCardsInWalletContainer = (props: Props) => {
  // If the user does "pull to refresh", this timer is ignored and the refresh is forced
  useActionOnFocus(props.load, refreshTime);
  return <BpdCardListMemo {...props} />;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  load: () => dispatch(bpdDetailsLoadAll()),
  navigateToCashbackDetails: (period: BpdPeriodWithInfo) =>
    dispatch(navigateToBpdDetails(period))
});

const mapStateToProps = (state: GlobalState) => ({
  periodsWithAmount: bpdPeriodsAmountWalletVisibleSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdCardsInWalletContainer);
