import * as React from "react";
import { useEffect, useState } from "react";
import { View, SafeAreaView, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
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
import { H4 } from "../../../../components/core/typography/H4";
import { StatoBeneficiarioEnum } from "../../../../../definitions/cdc/StatoBeneficiario";
import { Anno } from "../../../../../definitions/cdc/Anno";
import { cdcSelectedBonus } from "../store/actions/cdcBonusRequest";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../bonusVacanze/components/buttons/ButtonConfigurations";
import { compareSelectedBonusByYear } from "../utils/bonusRequest";
import { HSpacer, VSpacer } from "../../../../components/core/spacer/Spacer";

const CdcBonusRequestSelectYear = () => {
  const navigation =
    useNavigation<
      IOStackNavigationProp<CdcBonusRequestParamsList, "CDC_SELECT_BONUS_YEAR">
    >();
  const dispatch = useDispatch();
  const cdcBonusList = useIOSelector(cdcBonusRequestListSelector);
  const [years, setYears] = useState<ReadonlyArray<Anno>>([]);

  useEffect(() => {
    const navigateToFailureScreen = () => {
      navigation.getParent()?.goBack();
      navigation.navigate(ROUTES.WORKUNIT_GENERIC_FAILURE);
    };
    if (
      navigation.isFocused() &&
      (!isReady(cdcBonusList) ||
        !cdcBonusList.value.some(
          b => b.status === StatoBeneficiarioEnum.ATTIVABILE
        ))
    ) {
      navigateToFailureScreen();
    }
  }, [cdcBonusList, navigation]);

  if (!isReady(cdcBonusList)) {
    return null;
  }
  const activableBonus = cdcBonusList.value.filter(
    b => b.status === StatoBeneficiarioEnum.ATTIVABILE
  );

  if (activableBonus.length === 0) {
    return null;
  }

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.cdc.title")}
    >
      <SafeAreaView style={IOStyles.flex} testID={"CdcBonusRequestSelectYear"}>
        <ScrollView style={IOStyles.horizontalContentPadding}>
          <H1>{I18n.t("bonus.cdc.bonusRequest.selectYear.header")}</H1>
          <VSpacer size={8} />
          <H4 weight={"Regular"}>
            {I18n.t("bonus.cdc.bonusRequest.selectYear.body")}
          </H4>
          <VSpacer size={24} />
          {[...activableBonus].sort(compareSelectedBonusByYear).map(b => (
            <View key={b.year}>
              <View style={{ flexDirection: "row" }}>
                <CheckBox
                  onValueChange={(v: boolean) => {
                    const updatedYears = v
                      ? [...years, b.year]
                      : years.filter(y => y !== b.year);
                    setYears(updatedYears);
                  }}
                />
                <HSpacer size={16} />
                <H4 weight={"Regular"}>{b.year}</H4>
              </View>
              <VSpacer size={24} />
            </View>
          ))}
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={cancelButtonProps(() => {
            navigation.getParent()?.goBack();
          })}
          rightButton={confirmButtonProps(
            () => {
              dispatch(cdcSelectedBonus(years.map(y => ({ year: y }))));
              navigation.navigate(CDC_ROUTES.SELECT_RESIDENCE);
            },
            I18n.t("global.buttons.continue"),
            undefined,
            "continueButton",
            years.length === 0
          )}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default CdcBonusRequestSelectYear;
