import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H1 } from "../../../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../../i18n";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../../../utils/emptyContextualHelp";
import { localeDateFormat } from "../../../../../../../utils/locale";
import BpdTransactionSummaryComponent from "../../../../components/BpdTransactionSummaryComponent";
import {
  atLeastOnePaymentMethodHasBpdEnabledSelector,
  paymentMethodsWithActivationStatusSelector
} from "../../../../store/reducers/details/combiner";
import { bpdSelectedPeriodSelector } from "../../../../store/reducers/details/selectedPeriod";
import { bpdLastTransactionUpdateSelector } from "../../../../store/reducers/details/transactionsv2/ui";
import { NoPaymentMethodAreActiveWarning } from "../BpdAvailableTransactionsScreen";
import BpdEmptyTransactionsList from "../BpdEmptyTransactionsList";
import TransactionsSectionList from "./TransactionsSectionList";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const BpdAvailableTransactionsScreenV2 = (props: Props): React.ReactElement => {
  const a = "";

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("bonus.bpd.title")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView
        style={IOStyles.flex}
        testID={"BpdAvailableTransactionsScreen"}
      >
        <View spacer={true} />
        <View style={IOStyles.horizontalContentPadding}>
          <H1>{I18n.t("bonus.bpd.details.transaction.title")}</H1>
        </View>
        <ScrollView style={[IOStyles.flex]}>
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
          {props.selectedPeriod &&
            (props.selectedPeriod.amount.transactionNumber > 0 ? (
              <>
                <TransactionsSectionList />
              </>
            ) : !props.atLeastOnePaymentMethodActive &&
              pot.isSome(props.potWallets) &&
              props.potWallets.value.length > 0 ? (
              <View style={IOStyles.horizontalContentPadding}>
                <NoPaymentMethodAreActiveWarning />
              </View>
            ) : (
              <View style={IOStyles.horizontalContentPadding}>
                <BpdEmptyTransactionsList />
              </View>
            ))}
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  selectedPeriod: bpdSelectedPeriodSelector(state),
  maybeLastUpdateDate: bpdLastTransactionUpdateSelector(state),
  potWallets: paymentMethodsWithActivationStatusSelector(state),
  atLeastOnePaymentMethodActive: atLeastOnePaymentMethodHasBpdEnabledSelector(
    state
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdAvailableTransactionsScreenV2);
