import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../components/core/typography/H1";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { CdcBonusRequestParamsList } from "../navigation/params";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { CDC_ROUTES } from "../navigation/routes";

const CdcBonusRequestSelectYear = () => {
  const navigation =
    useNavigation<
      IOStackNavigationProp<CdcBonusRequestParamsList, "CDC_SELECT_BONUS_YEAR">
    >();
  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.cdc.title")}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <H1>{"CdcBonusRequestSelectYear"}</H1>
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={{
            block: true,
            bordered: true,
            onPress: () => {
              navigation.getParent()?.goBack();
            },
            title: I18n.t("global.buttons.cancel")
          }}
          rightButton={{
            block: true,
            primary: true,
            onPress: () => {
              navigation.navigate(CDC_ROUTES.SELECT_RESIDENCE);
            },
            title: I18n.t("global.buttons.continue")
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default CdcBonusRequestSelectYear;
