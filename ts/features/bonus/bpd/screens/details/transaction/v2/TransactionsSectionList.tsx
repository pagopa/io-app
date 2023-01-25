import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { useEffect } from "react";
import {
  View,
  ActivityIndicator,
  SectionList,
  SectionListData,
  SectionListRenderItemInfo
} from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { VSpacer } from "../../../../../../../components/core/spacer/Spacer";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../../../i18n";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { localeDateFormat } from "../../../../../../../utils/locale";
import { showToast } from "../../../../../../../utils/showToast";
import BaseDailyTransactionHeader from "../../../../components/BaseDailyTransactionHeader";
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
import { bpdLastUpdateSelector } from "../../../../store/reducers/details/lastUpdate";
import { bpdSelectedPeriodSelector } from "../../../../store/reducers/details/selectedPeriod";
import { bpdDaysInfoByIdSelector } from "../../../../store/reducers/details/transactionsv2/daysInfo";
import {
  bpdTransactionByIdSelector,
  bpdTransactionsGetNextCursor,
  BpdTransactionsSectionItem,
  bpdTransactionsSelector
} from "../../../../store/reducers/details/transactionsv2/ui";
import { NoPaymentMethodAreActiveWarning } from "../BpdAvailableTransactionsScreen";
import BpdCashbackMilestoneComponent from "../BpdCashbackMilestoneComponent";
import BpdEmptyTransactionsList from "../BpdEmptyTransactionsList";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

type HeaderProps = Props & {
  info: {
    section: SectionListData<BpdTransactionId, BpdTransactionsSectionItem>;
  };
};

const RenderSectionHeaderBase = (
  // we need to pass props as argument because with the current react-redux version useSelect cannot be used
  props: HeaderProps
) =>
  pipe(
    props.bpdDaysInfoByIdSelector(props.info.section.dayInfoId),
    O.fold(
      () => null,
      daysInfo => (
        <BaseDailyTransactionHeader
          date={localeDateFormat(
            daysInfo.trxDate,
            I18n.t("global.dateFormats.dayFullMonth")
          )}
          transactionsNumber={daysInfo.count}
        />
      )
    )
  );

/**
 * In order to optimize the rendering of the item, we use the dayInfo as unique identifier to avoid to redraw the component.
 * The dayInfo data cannot change while consulting the list and we use this information to avoid a deep comparison
 */
export const RenderSectionHeader = React.memo(
  RenderSectionHeaderBase,
  (prev: HeaderProps, curr: HeaderProps) =>
    prev.info.section.dayInfoId === curr.info.section.dayInfoId
);

type ItemProps = Props & {
  trxId: SectionListRenderItemInfo<BpdTransactionId>;
};

const RenderItemBase = (
  // we need to pass props as argument because with the current react-redux version useSelect cannot be used
  props: ItemProps
): React.ReactElement | null =>
  pipe(
    props.bpdTransactionByIdSelector(props.trxId.item),
    O.fold(
      () => null,
      trx => (
        <>
          {trx.isPivot && (
            <BpdCashbackMilestoneComponent
              cashbackValue={pipe(
                props.selectedPeriod,
                O.fromNullable,
                O.fold(
                  () => 0,
                  p => p.maxPeriodCashback
                )
              )}
            />
          )}
          <BpdTransactionItem transaction={trx} />
        </>
      )
    )
  );

/**
 * In order to optimize the rendering of the item, we use the keyId as unique identifier to avoid to redraw the component.
 * The trx data cannot change while consulting the list and we use this information to avoid a deep comparison
 */
export const RenderItem = React.memo(
  RenderItemBase,
  (prev: ItemProps, curr: ItemProps) => prev.trxId.item === curr.trxId.item
);

/**
 * The header of the transactions list
 * @param props
 * @constructor
 */
const TransactionsHeader = (
  props: Pick<Props, "selectedPeriod" | "maybeLastUpdateDate">
) => (
  <View style={IOStyles.horizontalContentPadding}>
    <VSpacer size={16} />
    {props.selectedPeriod &&
      pot.isSome(props.maybeLastUpdateDate) &&
      props.selectedPeriod.amount.transactionNumber > 0 && (
        <>
          <BpdTransactionSummaryComponent
            lastUpdateDate={localeDateFormat(
              props.maybeLastUpdateDate.value,
              I18n.t("global.dateFormats.fullFormatFullMonthLiteral")
            )}
            period={props.selectedPeriod}
            totalAmount={props.selectedPeriod.amount}
          />
          <VSpacer size={16} />
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
  <View style={IOStyles.horizontalContentPadding} testID={"TransactionsEmpty"}>
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
    <VSpacer size={16} />
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
      showToast(
        I18n.t("bonus.bpd.details.transaction.error.pageLoading"),
        "danger"
      );
    }
  }, [isError]);

  return (
    <SectionList
      testID={"TransactionsSectionList"}
      renderSectionHeader={info => (
        <RenderSectionHeader {...props} info={info} />
      )}
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
      scrollEnabled={true}
      stickySectionHeadersEnabled={true}
      sections={transactions}
      renderItem={ri => <RenderItem {...props} trxId={ri} />}
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
  maybeLastUpdateDate: bpdLastUpdateSelector(state),
  potWallets: paymentMethodsWithActivationStatusSelector(state),
  atLeastOnePaymentMethodActive:
    atLeastOnePaymentMethodHasBpdEnabledSelector(state),
  potTransactions: bpdTransactionsSelector(state),
  nextCursor: bpdTransactionsGetNextCursor(state),
  bpdTransactionByIdSelector: (trxId: BpdTransactionId) =>
    bpdTransactionByIdSelector(state, trxId),
  bpdDaysInfoByIdSelector: (id: string) => bpdDaysInfoByIdSelector(state, id)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionsSectionList);
