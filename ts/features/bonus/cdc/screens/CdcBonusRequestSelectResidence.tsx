import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { View } from "native-base";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../components/core/typography/H1";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import {
  RadioButtonList,
  RadioItem
} from "../../../../components/core/selection/RadioButtonList";
import { H4 } from "../../../../components/core/typography/H4";

const getCheckResidencyItems = (): ReadonlyArray<RadioItem<boolean>> => [
  {
    body: I18n.t("bonus.cdc.selectResidence.items.residesInItaly"),
    id: true
  },
  {
    body: I18n.t("bonus.cdc.selectResidence.items.residesAbroad"),
    id: false
  }
];

const CdcBonusRequestSelectResidence = () => {
  const [isResidentInItaly, setIsResidentInItaly] = React.useState<
    boolean | undefined
  >();

  const cancelButtonProps = {
    block: true,
    bordered: true,
    onPress: () => true,
    title: I18n.t("global.buttons.cancel")
  };

  const continueButtonProps = {
    block: true,
    primary: true,
    onPress: () => true,
    title: I18n.t("global.buttons.continue"),
    disabled: !isResidentInItaly ?? false
  };
  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.cdc.title")}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <H1>{I18n.t("bonus.cdc.selectResidence.header")}</H1>
          <View spacer={true} />

          <RadioButtonList<boolean>
            key="residentInItaly"
            items={getCheckResidencyItems()}
            selectedItem={isResidentInItaly}
            onPress={setIsResidentInItaly}
          />

          <View spacer={true} />
          <H4 weight={"Regular"}>{I18n.t("bonus.cdc.selectResidence.info")}</H4>
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={cancelButtonProps}
          rightButton={continueButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default CdcBonusRequestSelectResidence;
