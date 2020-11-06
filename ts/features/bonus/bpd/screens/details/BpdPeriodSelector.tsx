import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { HorizontalScroll } from "../../../../../components/HorizontalScroll";
import { GlobalState } from "../../../../../store/reducers/types";
import { BpdCardComponent } from "../../components/bpdCardComponent/BpdCardComponent";
import { BpdPeriod } from "../../store/actions/periods";
import { bpdSelectPeriod } from "../../store/actions/selectedPeriod";
import { bpdAmountForSelectedPeriod } from "../../store/reducers/details/amounts";
import { bpdPeriodsAmountSnappedListSelector } from "../../store/reducers/details/combiner";
import { bpdSelectedPeriodSelector } from "../../store/reducers/details/selectedPeriod";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * An horizontal snap scroll view used to select a specific period of bpd.
 * Each period is represented as a BpdPeriodCard.
 * TODO: snapped list to choose and show the selected period: ATM only display current period
 * @constructor
 */
const BpdPeriodSelector: React.FunctionComponent<Props> = props => {
  const periodWithAmountList = pot.getOrElse(props.periodsWithAmount, []);
  const constructPeriodList = () =>
    periodWithAmountList.map((periodWithAmount, i) => (
      <View
        key={`bpd-card-${i}`}
        style={[
          IOStyles.horizontalContentPadding,
          { width: widthPercentageToDP("100%") }
        ]}
      >
        <BpdCardComponent
          period={periodWithAmount.period}
          totalAmount={periodWithAmount.amount}
        />
      </View>
    ));

  const selectPeriod = (index: number) =>
    fromNullable(periodWithAmountList[index]).map(currentItem =>
      props.changeSelectPeriod(currentItem.period)
    );
  return (
    <View style={[IOStyles.flex]}>
      {/* {props.selectedPeriod && pot.isSome(props.selectedAmount) && (
      <BpdCardComponent
        period={props.selectedPeriod}
        totalAmount={props.selectedAmount.value}
      />
    )} */}
      {pot.isSome(props.periodsWithAmount) &&
        props.periodsWithAmount.value.length > 1 && (
          <HorizontalScroll
            onCurrentElement={selectPeriod}
            cards={constructPeriodList()}
          />
        )}
    </View>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  changeSelectPeriod: (period: BpdPeriod) => dispatch(bpdSelectPeriod(period))
});

const mapStateToProps = (state: GlobalState) => ({
  periodsWithAmount: bpdPeriodsAmountSnappedListSelector(state),
  selectedPeriod: bpdSelectedPeriodSelector(state),
  selectedAmount: bpdAmountForSelectedPeriod(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(BpdPeriodSelector);
