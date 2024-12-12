import {
  FooterActionsInline,
  H2,
  H6,
  HSpacer,
  Icon,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import {
  RadioButtonList,
  RadioItem
} from "../../../../components/core/selection/RadioButtonList";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { CdcBonusRequestParamsList } from "../navigation/params";
import { CDC_ROUTES } from "../navigation/routes";
import { cdcSelectedBonus as cdcSelectedBonusAction } from "../store/actions/cdcBonusRequest";
import { cdcSelectedBonusSelector } from "../store/reducers/cdcBonusRequest";
import { ResidentChoice } from "../types/CdcBonusRequest";
import { compareSelectedBonusByYear } from "../utils/bonusRequest";

const getCheckResidencyItems = (): ReadonlyArray<RadioItem<ResidentChoice>> => [
  {
    body: I18n.t("bonus.cdc.bonusRequest.selectResidence.items.residesInItaly"),
    id: "italy"
  },
  {
    body: I18n.t("bonus.cdc.bonusRequest.selectResidence.items.residesAbroad"),
    id: "notItaly"
  }
];

const CdcBonusRequestSelectResidence = () => {
  const navigation =
    useNavigation<
      IOStackNavigationProp<CdcBonusRequestParamsList, "CDC_SELECT_RESIDENCE">
    >();
  const dispatch = useIODispatch();
  const [isResidentInItaly, setIsResidentInItaly] = React.useState<
    Record<string, ResidentChoice>
  >({});
  const cdcSelectedBonus = useIOSelector(cdcSelectedBonusSelector);

  // Should never happen that the user arrives in this screen without selecting any bonus
  if (!cdcSelectedBonus?.length) {
    return null;
  }

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.cdc.title")}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView style={IOStyles.horizontalContentPadding}>
          <H2>{I18n.t("bonus.cdc.bonusRequest.selectResidence.header")}</H2>
          <VSpacer size={16} />
          <H6>{I18n.t("bonus.cdc.bonusRequest.selectResidence.info")}</H6>

          {[...cdcSelectedBonus].sort(compareSelectedBonusByYear).map(b => (
            <>
              <VSpacer size={24} />
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center"
                }}
              >
                <Icon name="bonus" size={20} />
                <HSpacer size={16} />
                <H6>{b.year}</H6>
              </View>
              <RadioButtonList<ResidentChoice>
                key={b.year}
                items={getCheckResidencyItems()}
                selectedItem={isResidentInItaly[b.year]}
                onPress={v => {
                  setIsResidentInItaly({ ...isResidentInItaly, [b.year]: v });
                }}
                rightSideSelection={true}
                bordered={true}
              />
            </>
          ))}
        </ScrollView>
      </SafeAreaView>
      <FooterActionsInline
        startAction={{
          color: "primary",
          label: I18n.t("global.buttons.cancel"),
          onPress: () => {
            navigation.getParent()?.goBack();
          }
        }}
        endAction={{
          color: "primary",
          label: I18n.t("global.buttons.continue"),
          onPress: () => {
            dispatch(
              cdcSelectedBonusAction(
                cdcSelectedBonus?.map(b => ({
                  year: b.year,
                  residence: isResidentInItaly[b.year]
                }))
              )
            );
            navigation.navigate(CDC_ROUTES.BONUS_REQUESTED);
          },
          disabled: cdcSelectedBonus.some(b => !isResidentInItaly[b.year])
        }}
      />
    </BaseScreenComponent>
  );
};

export default CdcBonusRequestSelectResidence;
