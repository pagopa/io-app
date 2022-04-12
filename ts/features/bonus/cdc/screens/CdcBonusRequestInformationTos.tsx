import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../components/core/typography/H1";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import { useNavigation } from "@react-navigation/native";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { CdcBonusRequestParamsList } from "../navigation/params";
import { CDC_ROUTES } from "../navigation/routes";

const CdcBonusRequestInformationTos = () => {
  const navigation =
    useNavigation<
      IOStackNavigationProp<CdcBonusRequestParamsList, "CDC_INFORMATION_TOS">
    >();

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={"Cdc bonus"}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <H1>{"CdcBonusRequestInformationTos"}</H1>

          <ButtonDefaultOpacity
            onPress={() => {
              navigation.navigate(CDC_ROUTES.SELECT_BONUS_YEAR);
            }}
          >
            <H1>{"Continua"}</H1>
          </ButtonDefaultOpacity>
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default CdcBonusRequestInformationTos;
