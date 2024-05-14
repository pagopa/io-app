import {
  FooterWithButtons,
  HSpacer,
  Icon,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { useDispatch } from "react-redux";
import {
  RadioButtonList,
  RadioItem
} from "../../../../components/core/selection/RadioButtonList";
import { H1 } from "../../../../components/core/typography/H1";
import { H3 } from "../../../../components/core/typography/H3";
import { H4 } from "../../../../components/core/typography/H4";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
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
  const dispatch = useDispatch();
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
          <H1>{I18n.t("bonus.cdc.bonusRequest.selectResidence.header")}</H1>
          <VSpacer size={16} />
          <H4 weight={"Regular"}>
            {I18n.t("bonus.cdc.bonusRequest.selectResidence.info")}
          </H4>

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
                <H3 weight={"SemiBold"} color={"bluegrey"}>
                  {b.year}
                </H3>
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
      <FooterWithButtons
        type="TwoButtonsInlineHalf"
        primary={{
          type: "Outline",
          buttonProps: {
            label: I18n.t("global.buttons.cancel"),
            accessibilityLabel: I18n.t("global.buttons.cancel"),
            onPress: () => {
              navigation.getParent()?.goBack();
            }
          }
        }}
        secondary={{
          type: "Solid",
          buttonProps: {
            label: I18n.t("global.buttons.continue"),
            accessibilityLabel: I18n.t("global.buttons.continue"),
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
          }
        }}
      />
    </BaseScreenComponent>
  );
};

export default CdcBonusRequestSelectResidence;
