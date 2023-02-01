import { View, SafeAreaView } from "react-native";
import * as React from "react";
import { VSpacer } from "../../../../../../../components/core/spacer/Spacer";
import { H1 } from "../../../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../../i18n";
import { emptyContextualHelp } from "../../../../../../../utils/emptyContextualHelp";
import TransactionsSectionList from "./TransactionsSectionList";

export const BpdAvailableTransactionsScreenV2 = (): React.ReactElement => (
  <BaseScreenComponent
    goBack={true}
    headerTitle={I18n.t("bonus.bpd.title")}
    contextualHelp={emptyContextualHelp}
  >
    <SafeAreaView
      style={IOStyles.flex}
      testID={"BpdAvailableTransactionsScreenV2"}
    >
      <VSpacer size={16} />
      <View style={IOStyles.horizontalContentPadding}>
        <H1>{I18n.t("bonus.bpd.details.transaction.title")}</H1>
      </View>
      <TransactionsSectionList />
    </SafeAreaView>
  </BaseScreenComponent>
);
