import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { View } from "native-base";
import { useNavigation } from "@react-navigation/native";
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
import { Anno } from "../../../../../definitions/cdc/Anno";
import { RTron } from "../../../../boot/configureStoreAndPersistor";

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
  const navigation =
    useNavigation<
      IOStackNavigationProp<CdcBonusRequestParamsList, "CDC_SELECT_RESIDENCE">
    >();
  const [isResidentInItaly, setIsResidentInItaly] = React.useState<
    Map<Anno, boolean>
  >(new Map());
  const cdcSelectedBonus = useIOSelector(cdcSelectedBonusSelector);

  if (cdcSelectedBonus === undefined || cdcSelectedBonus.length === 0) {
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
          <H1>{I18n.t("bonus.cdc.selectResidence.header")}</H1>
          <View spacer={true} />
          <H4 weight={"Regular"}>{I18n.t("bonus.cdc.selectResidence.info")}</H4>
          <View spacer={true} />

          {cdcSelectedBonus.map(b => (
            <RadioButtonList<boolean>
              key={b.year}
              items={getCheckResidencyItems()}
              selectedItem={isResidentInItaly.get(b.year)}
              onPress={v => {
                setIsResidentInItaly(isResidentInItaly.set(b.year, v));
              }}
              rightSideSelection={true}
            />
          ))}
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={cancelButtonProps(() => {
            navigation.getParent()?.goBack();
          })}
          rightButton={confirmButtonProps(
            () => {
              navigation.navigate(CDC_ROUTES.BONUS_REQUESTED);
            },
            I18n.t("global.buttons.continue"),
            undefined,
            undefined,
            !isResidentInItaly ?? false
          )}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default CdcBonusRequestSelectResidence;
