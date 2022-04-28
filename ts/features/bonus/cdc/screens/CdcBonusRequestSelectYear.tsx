import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../components/core/typography/H1";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { CdcBonusRequestParamsList } from "../navigation/params";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { CDC_ROUTES } from "../navigation/routes";
import { cdcBonusRequestListSelector } from "../store/reducers/cdcBonusRequest";
import { useIOSelector } from "../../../../store/hooks";
import { isReady } from "../../bpd/model/RemoteValue";
import ROUTES from "../../../../navigation/routes";
import { CheckBox } from "../../../../components/core/selection/checkbox/CheckBox";
import { H5 } from "../../../../components/core/typography/H5";

const CdcBonusRequestSelectYear = () => {
  const navigation =
    useNavigation<
      IOStackNavigationProp<CdcBonusRequestParamsList, "CDC_SELECT_BONUS_YEAR">
    >();

  const cdcBonusList = useIOSelector(cdcBonusRequestListSelector);

  useEffect(() => {
    if (!isReady(cdcBonusList)) {
      navigation.getParent()?.goBack();
      navigation.navigate(ROUTES.WORKUNIT_GENERIC_FAILURE);
    }
  }, [cdcBonusList, navigation]);

  if (!isReady(cdcBonusList)) {
    return null;
  }

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.cdc.title")}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <H1>{"Per quale anno vuoi richiedere la Carta della Cultura?"}</H1>

          {cdcBonusList.value.map(b => (
            <CheckBox key={b.year}>
              <H5>{b.year}</H5>
            </CheckBox>
          ))}
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
