import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../components/core/typography/H1";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { CdcBonusRequestParamsList } from "../navigation/params";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import ROUTES from "../../../../navigation/routes";

const CdcBonusRequestSelectYear = () => {
  const navigation =
    useNavigation<
      IOStackNavigationProp<CdcBonusRequestParamsList, "CDC_SELECT_BONUS_YEAR">
    >();
  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={"Cdc bonus"}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <H1>{"CdcBonusRequestSelectYear"}</H1>
          <ButtonDefaultOpacity
            onPress={() => {
              navigation.getParent()?.goBack();
              navigation.navigate(ROUTES.MAIN, {
                screen: ROUTES.PROFILE_MAIN
              });
              navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
                screen: ROUTES.PROFILE_DATA
              });
            }}
          >
            <H1>{"Annulla"}</H1>
          </ButtonDefaultOpacity>
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default CdcBonusRequestSelectYear;
