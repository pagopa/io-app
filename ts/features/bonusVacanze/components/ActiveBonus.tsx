import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import IconFont from "../../../components/ui/IconFont";
import I18n from "../../../i18n";
import customVariables from "../../../theme/variables";
import { formatDateAsLocal } from "../../../utils/dates";
import { formatNumberCentsToAmount } from "../../../utils/stringBuilder";
import { BonusVacanzaMock } from "../mock/mockData";

type Props = {
  bonus: BonusVacanzaMock;
  onPress: (bonus: BonusVacanzaMock) => void;
};

const ICON_WIDTH = 24;

const styles = StyleSheet.create({
  smallSpacer: {
    width: "100%",
    height: 4
  },
  spaced: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center"
  },
  brandDarkGray: {
    color: customVariables.brandDarkGray
  },
  text3: {
    fontSize: 18,
    color: customVariables.brandDarkestGray
  },
  text12: {
    lineHeight: 18,
    marginBottom: -4
  },
  icon: {
    width: 64,
    alignItems: "flex-end",
    justifyContent: "center"
  },
  text3Line: {
    flex: 1,
    flexDirection: "row"
  },
  text3Container: {
    flex: 1,
    flexDirection: "row",
    minHeight: 24
  }
});

/**
 * Component to display the current active bonus if it is present
 * in the store
 */
const ActiveBonus: React.FunctionComponent<Props> = (props: Props) => {
  const bonusValidityInterval = `${formatDateAsLocal(
    props.bonus.valid_from,
    true
  )} - ${formatDateAsLocal(props.bonus.valid_to, true)}`;

  return (
    <TouchableDefaultOpacity onPress={() => props.onPress(props.bonus)}>
      <View style={styles.spaced}>
        <Text small={true}>{`${I18n.t(
          "bonus.bonusVacanza.validity"
        )} ${bonusValidityInterval}`}</Text>
        <Text bold={true} style={styles.text12}>
          {formatNumberCentsToAmount(props.bonus.max_amount)}
        </Text>
      </View>
      <View small={true} />
      <View style={styles.spaced}>
        <Text small={true} dark={true}>
          {I18n.t("bonus.bonusVacanza.taxBenefit")}
        </Text>
        <Text bold={true} style={styles.text12}>
          {formatNumberCentsToAmount(props.bonus.tax_benefit)}
        </Text>
      </View>
      <View style={styles.smallSpacer} />
      <View style={styles.text3Line}>
        <View style={styles.text3Container}>
          <Text numberOfLines={2} style={styles.text3}>
            {/*TODO replace this hardcoded string*/}
            {"Bonus Vacanze"}
          </Text>
        </View>
        <View style={styles.icon}>
          <IconFont
            name="io-right"
            size={ICON_WIDTH}
            color={customVariables.contentPrimaryBackground}
          />
        </View>
      </View>
    </TouchableDefaultOpacity>
  );
};

export default ActiveBonus;
