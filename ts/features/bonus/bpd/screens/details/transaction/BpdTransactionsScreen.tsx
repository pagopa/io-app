import { compareDesc } from "date-fns";
import { index, reverse } from "fp-ts/lib/Array";
import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import {
  SafeAreaView,
  SectionList,
  SectionListData,
  SectionListRenderItem
} from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H1 } from "../../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { format } from "../../../../../../utils/dates";
import BaseDailyTransactionHeader from "../../../components/BaseDailyTransactionHeader";
import BpdTransactionSummaryComponent from "../../../components/BpdTransactionSummaryComponent";
import {
  BpdTransactionItem,
  EnhancedBpdTransaction
} from "../../../components/transactionItem/BpdTransactionItem";
import { bpdAmountForSelectedPeriod } from "../../../store/reducers/details/amounts";
import { bpdDisplayTransactionsSelector } from "../../../store/reducers/details/combiner";
import { bpdSelectedPeriodSelector } from "../../../store/reducers/details/selectedPeriod";
import BpdCashbackMilestoneComponent from "./BpdCashbackMilestoneComponent";
import BpdEmptyTransactionsList from "./BpdEmptyTransactionsList";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

type TotalCashbackPerDate = {
  trxDate: Date;
  totalCashBack: number;
};

const dataForFlatList = (
  transactions: pot.Pot<ReadonlyArray<EnhancedBpdTransaction>, Error>
) => pot.getOrElse(transactions, []);

export const isTotalCashback = (item: any): item is TotalCashbackPerDate =>
  item.totalCashBack !== undefined;

/**
 * Builds the array of objects needed to show the sectionsList grouped by transaction day.
 *
 * We check the subtotal of TotalCashback earned on each transaction to check when the user reaches the cashback.
 *
 * When creating the final array if we reached the cashback amount we set all the following transaction cashback value to 0
 *
 * If the sum of cashback comes over the award we remove the exceeding part on the transaction.
 * @param transactions
 * @param cashbackAward
 */
const getTransactionsByDaySections = (
  transactions: ReadonlyArray<EnhancedBpdTransaction>,
  cashbackAward: number
): ReadonlyArray<
  SectionListData<EnhancedBpdTransaction | TotalCashbackPerDate>
> => {
  const dates = [
    ...new Set(transactions.map(trx => format(trx.trxDate, "DD MMMM")))
  ];

  const transactionsAsc = reverse([...transactions]);

  // accumulator to define when the user reached the cashback award amount
  // and tracing the sum of all the cashback value to check if any negative trx may cause a revoke of cashback award
  const amountWinnerAccumulator = transactionsAsc.reduce(
    (
      acc: {
        winner?: {
          amount: number;
          index: number;
          date: Date;
        };
        sumAmount: number;
      },
      t: EnhancedBpdTransaction,
      currIndex: number
    ) => {
      const sum = acc.sumAmount + t.cashback;
      if (sum >= cashbackAward && !acc.winner) {
        return {
          winner: {
            amount: sum,
            index: currIndex,
            date: new Date(t.trxDate)
          },
          sumAmount: sum
        };
      } else if (sum < cashbackAward) {
        return {
          sumAmount: sum
        };
      }
      return {
        ...acc,
        sumAmount: sum
      };
    },
    {
      sumAmount: 0
    }
  );

  const maybeWinner = fromNullable(amountWinnerAccumulator.winner);

  // If the user reached the cashback amount within transactions we actualize all the cashback value starting from the index of winning transaction
  // if the the winning transaction makes cashback value exceed the limit we set the amount to the difference of transaction cashback value, total amout at winnign transaction and cashback award limit.
  // all the following transactions will be set to 0 cashback value, since the limit has been reached (a dedicated item will be displayed)
  const updatedTransactions = [...transactionsAsc].map((t, i) => {
    if (maybeWinner.isSome()) {
      if (
        i === maybeWinner.value.index &&
        maybeWinner.value.amount > cashbackAward
      ) {
        return {
          ...t,
          cashback: t.cashback - (maybeWinner.value.amount - cashbackAward)
        };
      } else if (i > maybeWinner.value.index) {
        return {
          ...t,
          cashback: 0
        };
      }
    }
    return t;
  });

  return dates.map(d => ({
    title: d,
    data: [
      ...updatedTransactions.filter(t => format(t.trxDate, "DD MMMM") === d),
      // we add the the data array an item to display the milestone reached
      // in order to display the milestone after the latest transaction summed in the total we add 1 ms so that the ordering will set it correctly
      ...maybeWinner.fold([], w => {
        if (format(w.date, "DD MMMM") === d) {
          return [
            {
              totalCashBack: w.amount,
              trxDate: new Date(
                w.date.setMilliseconds(w.date.getMilliseconds() + 1)
              )
            }
          ];
        }
        return [];
      })
    ].sort((trx1, trx2) => compareDesc(trx1.trxDate, trx2.trxDate))
  }));
};

const renderSectionHeader = (info: {
  section: SectionListData<EnhancedBpdTransaction | TotalCashbackPerDate>;
}): React.ReactNode => (
  <View style={{ paddingHorizontal: 16 }}>
    <BaseDailyTransactionHeader
      date={info.section.title}
      transactionsNumber={
        [...info.section.data].filter(i => !isTotalCashback(i)).length
      }
    />
  </View>
);

/**
 * Display all the transactions for a specific period
 * TODO: scroll to refresh, display error, display loading
 * @constructor
 */
const BpdTransactionsScreen: React.FunctionComponent<Props> = props => {
  const transactions = dataForFlatList(props.transactionForSelectedPeriod);

  const trxSortByDate = [...transactions].sort((trx1, trx2) =>
    compareDesc(trx1.trxDate, trx2.trxDate)
  );

  const maybeLastUpdateDate = index(0, [...trxSortByDate]).map(t => t.trxDate);

  const renderTransactionItem: SectionListRenderItem<
    EnhancedBpdTransaction | TotalCashbackPerDate
  > = info => {
    if (isTotalCashback(info.item)) {
      return (
        <BpdCashbackMilestoneComponent
          cashbackValue={fromNullable(props.selectedPeriod).fold(
            0,
            p => p.maxPeriodCashback
          )}
        />
      );
    }
    return (
      <View style={{ paddingHorizontal: 16 }}>
        <BpdTransactionItem transaction={info.item} />
      </View>
    );
  };

  return (
    <BaseScreenComponent goBack={true} headerTitle={I18n.t("bonus.bpd.title")}>
      <SafeAreaView style={IOStyles.flex}>
        <View style={IOStyles.horizontalContentPadding}>
          <View spacer={true} large={true} />
          <H1>{I18n.t("bonus.bpd.details.transaction.title")}</H1>
          <View spacer={true} />
          {pot.isSome(props.selectedAmount) &&
            props.selectedPeriod &&
            maybeLastUpdateDate.isSome() && (
              <BpdTransactionSummaryComponent
                lastUpdateDate={format(
                  maybeLastUpdateDate.value,
                  "DD MMMM YYYY"
                )}
                period={props.selectedPeriod}
                totalAmount={props.selectedAmount.value}
              />
            )}
          {transactions.length === 0 && <BpdEmptyTransactionsList />}
          <View spacer={true} />
        </View>
        {props.selectedPeriod && (
          <SectionList
            renderSectionHeader={renderSectionHeader}
            scrollEnabled={true}
            stickySectionHeadersEnabled={true}
            sections={getTransactionsByDaySections(
              trxSortByDate,
              props.selectedPeriod.maxPeriodCashback
            )}
            renderItem={renderTransactionItem}
            keyExtractor={t =>
              isTotalCashback(t)
                ? `awarded_cashback_item${t.totalCashBack}`
                : t.keyId
            }
          />
        )}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  transactionForSelectedPeriod: bpdDisplayTransactionsSelector(state),
  selectedPeriod: bpdSelectedPeriodSelector(state),
  selectedAmount: bpdAmountForSelectedPeriod(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdTransactionsScreen);
