import * as pot from "@pagopa/ts-commons/lib/pot";
import * as AR from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
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
import { IOColors } from "../../../../../components/core/variables/IOColors";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  cardWrapper: {
    width: widthPercentageToDP("100%"),
    shadowColor: IOColors.black,
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
    pipe(
      periodWithAmountList[index],
      O.fromNullable,
      O.map(currentItem => {
        if (currentItem.awardPeriodId === props.selectedPeriod?.awardPeriodId) {
          return;
        }
        props.changeSelectPeriod(currentItem);
      })
    );

  useEffect(() => {
    if (initialPeriod === undefined) {
      setInitialperiod(
        pipe(
          periodWithAmountList,
          AR.findIndex(
            elem => elem.awardPeriodId === props.selectedPeriod?.awardPeriodId
          ),
          O.getOrElse(() => 0)
        )
      );
    }
  }, [
    initialPeriod,
    periodWithAmountList,
    props.selectedPeriod?.awardPeriodId
  ]);

  return (
    <View style={IOStyles.flex}>
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
