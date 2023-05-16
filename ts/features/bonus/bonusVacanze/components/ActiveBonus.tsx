import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { BonusActivationWithQrCode } from "../../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { H3 } from "../../../../components/core/typography/H3";
import { Label } from "../../../../components/core/typography/Label";
import { IOColors } from "../../../../components/core/variables/IOColors";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import I18n from "../../../../i18n";
import customVariables from "../../../../theme/variables";
import { formatNumberAmount } from "../../../../utils/stringBuilder";
import { validityInterval } from "../utils/bonus";
import { Icon } from "../../../../components/core/icons/Icon";

type Props = {
  bonus: BonusActivationWithQrCode;
  validFrom?: Date;
  validTo?: Date;
  onPress: (
    bonus: BonusActivationWithQrCode,
    validFrom?: Date,
    validTo?: Date
  ) => void;
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
  text12: {
    marginBottom: -4,
    justifyContent: "flex-end"
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
  },
  containerColor: {
    padding: customVariables.appHeaderPaddingHorizontal,
    backgroundColor: IOColors.cobalt,
    color: IOColors.white
  }
});

/**
 * Component to display the current active bonus if it is present
 * in the store
 */
const ActiveBonus: React.FunctionComponent<Props> = (props: Props) => {
  const bonusValidityInterval = validityInterval(
    props.validFrom,
    props.validTo
  );

  return (
    <TouchableDefaultOpacity
      style={styles.containerColor}
      onPress={() => props.onPress(props.bonus, props.validFrom, props.validTo)}
    >
      <View style={styles.spaced}>
        {O.isSome(bonusValidityInterval) && (
          <Body>{`${I18n.t("bonus.bonusVacanze.validity")} ${
            bonusValidityInterval.value.e1
          } - ${bonusValidityInterval.value.e2}`}</Body>
        )}
        <View style={styles.text12}>
          <Label weight="Bold" color="white">
            {formatNumberAmount(props.bonus.dsu_request.max_amount, true)}
          </Label>
        </View>
      </View>
      <VSpacer size={8} />
      <View style={styles.spaced}>
        <Body color="white">{I18n.t("bonus.bonusVacanze.taxBenefit")}</Body>
        <View style={styles.text12}>
          <Label weight="Bold" color="white">
            {formatNumberAmount(props.bonus.dsu_request.max_tax_benefit, true)}
          </Label>
        </View>
      </View>
      <View style={styles.smallSpacer} />
      <View style={styles.text3Line}>
        <View style={styles.text3Container}>
          <H3 color="white" numberOfLines={2}>
            {/* TODO replace this hardcoded string */}
            {"Bonus Vacanze"}
          </H3>
        </View>
        <View style={styles.icon}>
          <Icon name="chevronRightListItem" size={ICON_WIDTH} color="white" />
        </View>
      </View>
    </TouchableDefaultOpacity>
  );
};

export default ActiveBonus;
