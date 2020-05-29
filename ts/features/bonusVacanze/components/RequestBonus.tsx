import * as pot from "italia-ts-commons/lib/pot";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import H5 from "../../../components/ui/H5";
import I18n from "../../../i18n";
import customVariables from "../../../theme/variables";
import { maybeInnerProperty } from "../../../utils/options";
import { BonusList } from "../types/bonusList";
import { BonusVacanze } from "../types/bonusVacanze";
import { ID_BONUS_VACANZE_TYPE } from "../utils/bonus";
import ActiveBonus from "./ActiveBonus";

type OwnProps = {
  onButtonPress: () => void;
  onBonusPress: (bonus: BonusVacanze, validFrom?: Date, validTo?: Date) => void;
  bonus: pot.Pot<BonusVacanze, Error>;
  availableBonusesList: BonusList;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "transparent"
  },
  subHeaderContent: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between"
  },
  brandDarkGray: {
    color: customVariables.brandDarkGray
  }
});

/**
 * Component to show the request Bonus section on the Wallet Home Screen:
 * - It renders a button to proceed to a new bonus request
 * - It renders the list, if present, of active bonuses already requested
 * @param props
 */
const RequestBonus: React.FunctionComponent<OwnProps> = (props: OwnProps) => {
  const { onButtonPress, bonus, onBonusPress, availableBonusesList } = props;

  const bonusVacanzeCategory = availableBonusesList.items.find(
    bi => bi.id_type === ID_BONUS_VACANZE_TYPE
  );
  const validFrom = maybeInnerProperty(
    bonusVacanzeCategory,
    "valid_from",
    _ => _
  ).fold(undefined, _ => _);
  const validTo = maybeInnerProperty(
    bonusVacanzeCategory,
    "valid_to",
    _ => _
  ).fold(undefined, _ => _);

  return (
    <Content>
      {pot.isSome(bonus) &&
        bonus.value && (
          <View>
            <View style={styles.subHeaderContent}>
              <H5 style={styles.brandDarkGray}>
                {I18n.t("bonus.latestBonus")}
              </H5>
              <Text>{I18n.t("wallet.amount")}</Text>
            </View>
            <View spacer={true} />
            <ActiveBonus
              bonus={bonus.value}
              onPress={onBonusPress}
              validFrom={validFrom}
              validTo={validTo}
            />
          </View>
        )}
      <View spacer={true} />
      <View style={styles.container}>
        <ButtonDefaultOpacity
          block={true}
          bordered={true}
          onPress={onButtonPress}
          activeOpacity={1}
        >
          <Text bold={true}>{I18n.t("bonus.request")}</Text>
        </ButtonDefaultOpacity>
      </View>
    </Content>
  );
};

export default RequestBonus;
