import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { SectionList, SectionListRenderItemInfo } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../../../i18n";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { localeDateFormat } from "../../../../../../../utils/locale";
import BpdTransactionSummaryComponent from "../../../../components/BpdTransactionSummaryComponent";
import { BpdTransactionItem } from "../../../../components/transactionItem/BpdTransactionItem";
import { AwardPeriodId } from "../../../../store/actions/periods";
import {
  BpdTransactionId,
  bpdTransactionsLoadPage
} from "../../../../store/actions/transactions";
import {
  atLeastOnePaymentMethodHasBpdEnabledSelector,
  paymentMethodsWithActivationStatusSelector
} from "../../../../store/reducers/details/combiner";
import { BpdPeriodWithInfo } from "../../../../store/reducers/details/periods";
import { bpdSelectedPeriodSelector } from "../../../../store/reducers/details/selectedPeriod";
import {
  bpdLastTransactionUpdateSelector,
  bpdTransactionByIdSelector,
  bpdTransactionsSelector
} from "../../../../store/reducers/details/transactionsv2/ui";
import { NoPaymentMethodAreActiveWarning } from "../BpdAvailableTransactionsScreen";
import BpdEmptyTransactionsList from "../BpdEmptyTransactionsList";

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

const TransactionsHeader = (
  props: Pick<Props, "selectedPeriod" | "maybeLastUpdateDate">
) => (
  <View style={IOStyles.horizontalContentPadding}>
    <View spacer={true} />
    {props.selectedPeriod && props.maybeLastUpdateDate.isSome() && (
      <>
        <BpdTransactionSummaryComponent
          lastUpdateDate={localeDateFormat(
            props.maybeLastUpdateDate.value,
            I18n.t("global.dateFormats.fullFormatFullMonthLiteral")
          )}
          period={props.selectedPeriod}
          totalAmount={props.selectedPeriod.amount}
        />
        <View spacer={true} />
      </>
    )}
  </View>
);

const TransactionsEmpty = (
  props: Pick<Props, "potWallets" | "atLeastOnePaymentMethodActive">
) =>
  !props.atLeastOnePaymentMethodActive &&
  pot.isSome(props.potWallets) &&
  props.potWallets.value.length > 0 ? (
    <View style={IOStyles.horizontalContentPadding}>
      <NoPaymentMethodAreActiveWarning />
    </View>
  ) : (
    <View style={IOStyles.horizontalContentPadding}>
      <BpdEmptyTransactionsList />
    </View>
  );

const TransactionsSectionList = (props: Props): React.ReactElement => {
  const isError = pot.isError(props.potTransactions);
  const isLoading = pot.isLoading(props.potTransactions);
  const transactions = pot.getOrElse(props.potTransactions, []);

  return (
    <SectionList
      // renderSectionHeader={renderSectionHeader}
      // onEndReached={() => props.loadNextPage(2 as AwardPeriodId, 1)},
      ListHeaderComponent={<TransactionsHeader {...props} />}
      ListEmptyComponent={<TransactionsEmpty {...props} />}
      onEndReached={() => {
        console.log("LOAD");
      }}
      onEndReachedThreshold={0.1}
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
  maybeLastUpdateDate: bpdLastTransactionUpdateSelector(state),
  potWallets: paymentMethodsWithActivationStatusSelector(state),
  atLeastOnePaymentMethodActive: atLeastOnePaymentMethodHasBpdEnabledSelector(
    state
  ),
  potTransactions: bpdTransactionsSelector(state),
  bpdTransactionByIdSelector: (trxId: BpdTransactionId) =>
    bpdTransactionByIdSelector(state, trxId)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionsSectionList);
