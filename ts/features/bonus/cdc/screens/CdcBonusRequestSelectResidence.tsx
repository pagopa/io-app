import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../components/core/typography/H1";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";

const CdcBonusRequestSelectResidence = () => {
  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.cdc.title")}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <H1>{"CdcBonusRequestSelectResidence"}</H1>
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={{
            block: true,
            bordered: true,
            onPress: () => true,
            title: I18n.t("global.buttons.cancel")
          }}
          rightButton={{
            block: true,
            primary: true,
            onPress: () => true,
            title: I18n.t("global.buttons.continue")
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default CdcBonusRequestSelectResidence;
