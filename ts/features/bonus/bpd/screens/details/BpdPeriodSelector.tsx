import { findIndex } from "fp-ts/lib/Array";
import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import { useEffect, useState } from "react";
import * as React from "react";
import { StyleSheet } from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { HorizontalScroll } from "../../../../../components/HorizontalScroll";
import { GlobalState } from "../../../../../store/reducers/types";
import { BpdCardComponent } from "../../components/bpdCardComponent/BpdCardComponent";
import { bpdSelectPeriod } from "../../store/actions/selectedPeriod";
import { bpdPeriodsAmountWalletVisibleSelector } from "../../store/reducers/details/combiner";
import { BpdPeriodWithInfo } from "../../store/reducers/details/periods";
import { bpdSelectedPeriodSelector } from "../../store/reducers/details/selectedPeriod";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  cardWrapper: {
    width: widthPercentageToDP("100%"),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 7
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    height: 192
  }
});

/**
 * An horizontal snap scroll view used to select a specific period of bpd.
 * Each period is represented as a BpdPeriodCard.
 * @constructor
 */
const BpdPeriodSelector: React.FunctionComponent<Props> = props => {
  const periodWithAmountList = pot.getOrElse(props.periodsWithAmount, []);
  const [initialPeriod, setInitialperiod] = useState<number | undefined>();
  const constructPeriodList = () =>
    periodWithAmountList.map((periodWithAmount, i) => (
      <View
        key={`bpd-card-${i}`}
        style={[IOStyles.horizontalContentPadding, styles.cardWrapper]}
      >
        <BpdCardComponent
          period={periodWithAmount}
          totalAmount={periodWithAmount.amount}
        />
      </View>
    ));

  const selectPeriod = (index: number) =>
    fromNullable(periodWithAmountList[index]).map(currentItem => {
      if (currentItem.awardPeriodId === props.selectedPeriod?.awardPeriodId) {
        return;
      }
      props.changeSelectPeriod(currentItem);
    });

  useEffect(() => {
    if (initialPeriod === undefined) {
      setInitialperiod(
        findIndex(
          periodWithAmountList,
          elem => elem.awardPeriodId === props.selectedPeriod?.awardPeriodId
        ).getOrElse(0)
      );
    }
  }, [
    initialPeriod,
    periodWithAmountList,
    props.selectedPeriod?.awardPeriodId
  ]);

  return (
    <View style={[IOStyles.flex]}>
      {pot.isSome(props.periodsWithAmount) &&
        props.periodsWithAmount.value.length > 0 && (
          <HorizontalScroll
            indexToScroll={initialPeriod ?? 0}
            onCurrentElement={selectPeriod}
            cards={constructPeriodList()}
          />
        )}
    </View>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  changeSelectPeriod: (period: BpdPeriodWithInfo) =>
    dispatch(bpdSelectPeriod(period))
});

const mapStateToProps = (state: GlobalState) => ({
  // ATM the rules of visualization of a period in the selector is the same of the wallet
  periodsWithAmount: bpdPeriodsAmountWalletVisibleSelector(state),
  selectedPeriod: bpdSelectedPeriodSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(BpdPeriodSelector);
