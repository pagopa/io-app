import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { SafeAreaView, SectionList, SectionListData } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { compareDesc } from "date-fns";
import { index } from "fp-ts/lib/Array";
import { H1 } from "../../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import BPDTransactionSummaryComponent from "../../../components/BPDTransactionSummaryComponent";
import { format } from "../../../../../../utils/dates";
import BaseDailyTransactionHeader from "../../../components/BaseDailyTransactionHeader";
import {
  BpdTransactionItem,
  EnhancedBpdTransaction
} from "../../../components/transactionItem/BpdTransactionItem";
import { bpdAmountForSelectedPeriod } from "../../../store/reducers/details/amounts";
import { bpdDisplayTransactionsSelector } from "../../../store/reducers/details/combiner";
import { bpdSelectedPeriodSelector } from "../../../store/reducers/details/selectedPeriod";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const dataForFlatList = (
  transactions: pot.Pot<ReadonlyArray<EnhancedBpdTransaction>, Error>
) => pot.getOrElse(transactions, []);

const getTransactionsByDaySections = (
  transactions: ReadonlyArray<EnhancedBpdTransaction>
): ReadonlyArray<SectionListData<EnhancedBpdTransaction>> => {
  const dates = [
    ...new Set(transactions.map(trx => format(trx.trxDate, "DD MMMM")))
  ];

  return dates.map(d => ({
    title: d,
    data: transactions.filter(t => format(t.trxDate, "DD MMMM") === d)
  }));
};

const renderSectionHeader = (info: {
  section: SectionListData<EnhancedBpdTransaction>;
}): React.ReactNode => (
  <BaseDailyTransactionHeader
    date={info.section.title}
    transactionsNumber={info.section.data.length}
  />
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

  const maybeLastUpdateDate = index(0, trxSortByDate).map(t => t.trxDate);

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
              <BPDTransactionSummaryComponent
                lastUpdateDate={format(
                  maybeLastUpdateDate.value,
                  "DD MMMM YYYY"
                )}
                period={props.selectedPeriod}
                totalAmount={props.selectedAmount.value}
              />
            )}
          <View spacer={true} />
        </View>
        <SectionList
          style={{ paddingHorizontal: 16 }}
          renderSectionHeader={renderSectionHeader}
          scrollEnabled={true}
          stickySectionHeadersEnabled={true}
          sections={getTransactionsByDaySections(trxSortByDate)}
          renderItem={transaction => (
            <BpdTransactionItem transaction={transaction.item} />
          )}
          keyExtractor={t => t.keyId}
        />
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
