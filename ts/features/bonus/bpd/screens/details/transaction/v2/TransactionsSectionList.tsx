import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import { useEffect } from "react";
import * as React from "react";
import {
  ActivityIndicator,
  SectionList,
  SectionListRenderItemInfo
} from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../../../i18n";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { localeDateFormat } from "../../../../../../../utils/locale";
import { showToast } from "../../../../../../../utils/showToast";
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
import { bpdSelectedPeriodSelector } from "../../../../store/reducers/details/selectedPeriod";
import {
  bpdLastTransactionUpdateSelector,
  bpdTransactionByIdSelector,
  bpdTransactionsGetNextCursor,
  bpdTransactionsSelector
} from "../../../../store/reducers/details/transactionsv2/ui";
import { NoPaymentMethodAreActiveWarning } from "../BpdAvailableTransactionsScreen";
import BpdEmptyTransactionsList from "../BpdEmptyTransactionsList";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const renderItem = (
  trxId: SectionListRenderItemInfo<BpdTransactionId>,
  props: Props
): React.ReactElement | null =>
  props
    .bpdTransactionByIdSelector(trxId.item)
    .fold(null, trx => <BpdTransactionItem transaction={trx} />);

/**
 * The header of the transactions list
 * @param props
 * @constructor
 */
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

/**
 * This component is rendered when no transactions are available
 * @param props
 * @constructor
 */
const TransactionsEmpty = (
  props: Pick<Props, "potWallets" | "atLeastOnePaymentMethodActive">
) => (
  <View style={IOStyles.horizontalContentPadding}>
    {!props.atLeastOnePaymentMethodActive &&
    pot.isSome(props.potWallets) &&
    props.potWallets.value.length > 0 ? (
      <NoPaymentMethodAreActiveWarning />
    ) : (
      <BpdEmptyTransactionsList />
    )}
  </View>
);

/**
 * Loading item, placed in the footer during the loading of the next page
 * @constructor
 */
const FooterLoading = () => (
  <>
    <View spacer={true} />
    <ActivityIndicator
      color={"black"}
      accessible={false}
      importantForAccessibility={"no-hide-descendants"}
      accessibilityElementsHidden={true}
      testID={"activityIndicator"}
    />
  </>
);

const TransactionsSectionList = (props: Props): React.ReactElement => {
  const isError = pot.isError(props.potTransactions);
  const isLoading = pot.isLoading(props.potTransactions);
  const transactions = pot.getOrElse(props.potTransactions, []);

  useEffect(() => {
    if (isError) {
      showToast(I18n.t("global.genericError"), "danger");
    }
  }, [isError]);

  return (
    <SectionList
      // renderSectionHeader={renderSectionHeader}
      // onEndReached={() => props.loadNextPage(2 as AwardPeriodId, 1)},
      ListHeaderComponent={<TransactionsHeader {...props} />}
      ListEmptyComponent={<TransactionsEmpty {...props} />}
      ListFooterComponent={isLoading && <FooterLoading />}
      onEndReached={() => {
        if (props.selectedPeriod && props.nextCursor && !isLoading) {
          props.loadNextPage(
            props.selectedPeriod.awardPeriodId,
            props.nextCursor
          );
        }
      }}
      onEndReachedThreshold={0.2}
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
  nextCursor: bpdTransactionsGetNextCursor(state),
  bpdTransactionByIdSelector: (trxId: BpdTransactionId) =>
    bpdTransactionByIdSelector(state, trxId)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionsSectionList);
