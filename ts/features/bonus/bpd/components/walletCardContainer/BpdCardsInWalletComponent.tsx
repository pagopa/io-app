import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../store/reducers/types";
import { useRefreshOnFocus } from "../../../../../utils/hooks/useOnFocus";
import { navigateToBpdDetails } from "../../navigation/actions";
import { bpdDetailsLoadAll } from "../../store/actions/details";
import { BpdPeriod } from "../../store/actions/periods";
import { bpdPeriodsAmountWalletVisibleSelector } from "../../store/reducers/details/combiner";
import { BpdCardComponent } from "../bpdCardComponent/BpdCardComponent";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * Render the bpd card in the wallet
 * //TODO: handle error, render only if some
 * @constructor
 */
const BpdCardsInWalletContainer: React.FunctionComponent<Props> = props => {
  // TODO: a less aggressive refresh?
  useRefreshOnFocus(props.load);

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
              props.navigateToCashbackDetails(pa.period);
            }}
          />
        ))}
    </View>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  load: () => dispatch(bpdDetailsLoadAll()),
  navigateToCashbackDetails: (period: BpdPeriod) =>
    dispatch(navigateToBpdDetails(period))
});

const mapStateToProps = (state: GlobalState) => ({
  periodsWithAmount: bpdPeriodsAmountWalletVisibleSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdCardsInWalletContainer);
