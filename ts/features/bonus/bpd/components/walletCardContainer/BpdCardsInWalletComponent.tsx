import * as pot from "italia-ts-commons/lib/pot";
import { Millisecond } from "italia-ts-commons/lib/units";
import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../store/reducers/types";
import { useActionOnFocus } from "../../../../../utils/hooks/useOnFocus";
import { navigateToBpdDetails } from "../../navigation/actions";
import { bpdDetailsLoadAll } from "../../store/actions/details";
import {
  BpdPeriodAmount,
  bpdPeriodsAmountWalletVisibleSelector
} from "../../store/reducers/details/combiner";
import { BpdCardComponent } from "../bpdCardComponent/BpdCardComponent";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * Render the bpd card in the wallet
 * //TODO: handle error, render only if some
 * @constructor
 */
const BpdCardsInWalletContainer: React.FunctionComponent<Props> = props => {
  // If the user does "pull to refresh", this timer is ignored and the refresh is forced
  useActionOnFocus(props.load, 30000 as Millisecond);

  return (
    <View>
      {pot.isSome(props.periodsWithAmount) &&
        props.periodsWithAmount.value.map(pa => (
          <BpdCardComponent
            key={pa.period.awardPeriodId}
            period={pa.period}
            totalAmount={pa.amount}
            preview={true}
            onPress={() => {
              props.navigateToCashbackDetails(pa);
            }}
          />
        ))}
    </View>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  load: () => dispatch(bpdDetailsLoadAll()),
  navigateToCashbackDetails: (period: BpdPeriodAmount) =>
    dispatch(navigateToBpdDetails(period))
});

const mapStateToProps = (state: GlobalState) => ({
  periodsWithAmount: bpdPeriodsAmountWalletVisibleSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdCardsInWalletContainer);
