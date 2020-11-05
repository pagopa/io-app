import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H1 } from "../../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { BpdTransactionItem } from "../../../components/transactionItem/BpdTransactionItem";
import { bpdTransactionsForSelectedPeriod } from "../../../store/reducers/details/transactions";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * Display all the transactions for a specific period
 * TODO: scroll to refresh, display error, display loading
 * @constructor
 */
const BpdTransactionsScreen: React.FunctionComponent<Props> = props => (
  <BaseScreenComponent goBack={true} headerTitle={I18n.t("bonus.bpd.title")}>
    <SafeAreaView style={IOStyles.flex}>
      <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
        <View spacer={true} large={true} />
        <H1>{I18n.t("bonus.bpd.details.transaction.title")}</H1>
        <View spacer={true} />
        <ScrollView style={IOStyles.flex}>
          {pot.isSome(props.transactionForSelectedPeriod) &&
            props.transactionForSelectedPeriod.value.map(
              (transaction, index) => (
                <BpdTransactionItem key={index} transaction={transaction} />
              )
            )}
        </ScrollView>
      </View>
    </SafeAreaView>
  </BaseScreenComponent>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  transactionForSelectedPeriod: bpdTransactionsForSelectedPeriod(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdTransactionsScreen);
