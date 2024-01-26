import * as pot from "@pagopa/ts-commons/lib/pot";
import _ from "lodash";
import { View } from "react-native";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../store/reducers/types";
import { bpdSelectPeriod } from "../../store/actions/selectedPeriod";
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

/**
 * Render the bpd card in the wallet
 * //TODO: handle error, render only if some
 * @constructor
 */
const BpdCardsInWalletContainer = (props: Props) => (
  <BpdCardListMemo {...props} />
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToCashbackDetails: (period: BpdPeriodWithInfo) => {
    dispatch(bpdSelectPeriod(period));
  }
});

const mapStateToProps = (state: GlobalState) => ({
  periodsWithAmount: bpdPeriodsAmountWalletVisibleSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdCardsInWalletContainer);
