import * as React from "react";
import { View, SafeAreaView, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
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
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { CdcBonusRequestParamsList } from "../navigation/params";
import { CDC_ROUTES } from "../navigation/routes";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../bonusVacanze/components/buttons/ButtonConfigurations";
import { cdcSelectedBonusSelector } from "../store/reducers/cdcBonusRequest";
import { useIOSelector } from "../../../../store/hooks";
import { H3 } from "../../../../components/core/typography/H3";
import BonusIcon from "../../../../../img/features/cdc/bonus.svg";
import { ResidentChoice } from "../types/CdcBonusRequest";
import { cdcSelectedBonus as cdcSelectedBonusAction } from "../store/actions/cdcBonusRequest";
import { compareSelectedBonusByYear } from "../utils/bonusRequest";
import { HSpacer, VSpacer } from "../../../../components/core/spacer/Spacer";

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
                <BonusIcon width={20} height={20} />
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
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={cancelButtonProps(() => {
            navigation.getParent()?.goBack();
          })}
          rightButton={confirmButtonProps(
            () => {
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
            I18n.t("global.buttons.continue"),
            undefined,
            undefined,
            cdcSelectedBonus.some(b => !isResidentInItaly[b.year])
          )}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default CdcBonusRequestSelectResidence;
