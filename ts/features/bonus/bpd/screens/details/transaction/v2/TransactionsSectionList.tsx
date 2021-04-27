import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { ScrollView, View } from "react-native";
import { SectionList, SectionListRenderItemInfo } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H1 } from "../../../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { BpdTransactionItem } from "../../../../components/transactionItem/BpdTransactionItem";
import { AwardPeriodId } from "../../../../store/actions/periods";
import {
  BpdTransactionId,
  bpdTransactionsLoadPage
} from "../../../../store/actions/transactions";
import { bpdSelectedPeriodSelector } from "../../../../store/reducers/details/selectedPeriod";
import {
  bpdTransactionByIdSelector,
  bpdTransactionsSelector
} from "../../../../store/reducers/details/transactionsv2/ui";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const renderItem = (
  trxId: SectionListRenderItemInfo<BpdTransactionId>,
  props: Props
) =>
  props.bpdTransactionByIdSelector(trxId.item).fold(
    () => <></>,
    trx => <BpdTransactionItem transaction={trx} />
  );
const TransactionsSectionList = (props: Props): React.ReactElement => {
  const isError = pot.isError(props.potTransactions);
  const isLoading = pot.isLoading(props.potTransactions);
  const transactions = pot.getOrElse(props.potTransactions, []);

  let onEndReachedCalledDuringMomentum = false;

  return (
    <SectionList
      // renderSectionHeader={renderSectionHeader}
      // onEndReached={() => props.loadNextPage(2 as AwardPeriodId, 1)}
      onEndReachedThreshold={0.1}
      onMomentumScrollBegin={() => {
        onEndReachedCalledDuringMomentum = false;
      }}
      onEndReached={() => {
        console.log("LOAD");
        // if (!onEndReachedCalledDuringMomentum) {
        //   console.log("LOAD");
        //   onEndReachedCalledDuringMomentum = true;
        // }
      }}
      scrollEnabled={true}
      stickySectionHeadersEnabled={true}
      sections={transactions}
      renderItem={ri => renderItem(ri, props)}
      keyExtractor={t => t}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadNextPage: (awardPeriodId: AwardPeriodId, nextCursor: number) =>
    dispatch(bpdTransactionsLoadPage.request({ awardPeriodId, nextCursor }))
});

const mapStateToProps = (state: GlobalState) => ({
  selectedPeriod: bpdSelectedPeriodSelector(state),
  potTransactions: bpdTransactionsSelector(state),
  bpdTransactionByIdSelector: (trxId: BpdTransactionId) =>
    bpdTransactionByIdSelector(state, trxId)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionsSectionList);
