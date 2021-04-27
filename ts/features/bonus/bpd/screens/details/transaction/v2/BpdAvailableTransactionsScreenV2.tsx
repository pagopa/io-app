import { View } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H1 } from "../../../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../../i18n";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../../../utils/emptyContextualHelp";
import TransactionsSectionList from "./TransactionsSectionList";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const BpdAvailableTransactionsScreenV2 = (): React.ReactElement => (
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
      <TransactionsSectionList />
    </SafeAreaView>
  </BaseScreenComponent>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdAvailableTransactionsScreenV2);
