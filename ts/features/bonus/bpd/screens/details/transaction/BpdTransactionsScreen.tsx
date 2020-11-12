import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { FlatList, SafeAreaView } from "react-native";
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
import {
  BpdTransactionItem,
  EnhancedBpdTransaction
} from "../../../components/transactionItem/BpdTransactionItem";
import { bpdAmountForSelectedPeriod } from "../../../store/reducers/details/amounts";
import { bpdDisplayTransactionsSelector } from "../../../store/reducers/details/combiner";
import { bpdSelectedPeriodSelector } from "../../../store/reducers/details/selectedPeriod";
import { format } from "../../../../../../utils/dates";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const dataForFlatList = (
  transactions: pot.Pot<ReadonlyArray<EnhancedBpdTransaction>, Error>
) => pot.getOrElse(transactions, []);

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
        <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
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
          <FlatList
            data={transactions}
            renderItem={transaction => (
              <BpdTransactionItem transaction={transaction.item} />
            )}
            keyExtractor={t => t.keyId}
          />
        </View>
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
