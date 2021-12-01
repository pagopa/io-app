import React from "react";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import I18n from "../../../i18n";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { SafeAreaView } from "react-native";
import { H1 } from "../../../components/core/typography/H1";

type Props = {};
const ZendeskSupportHelpCenter = (_: Props): React.ReactElement => {
  return (
    <BaseScreenComponent
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("wallet.onboarding.paypal.headerTitle")}
    >
      <SafeAreaView
        style={IOStyles.flex}
        testID={"PayPalStartOnboardingScreen"}
      >
        <H1>{"Test"}</H1>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ZendeskSupportHelpCenter;
