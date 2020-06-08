import * as pot from "italia-ts-commons/lib/pot";
import { Badge, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { BonusActivationWithQrCode } from "../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { AddPaymentMethodButton } from "../../../components/wallet/AddPaymentMethodButton";
import I18n from "../../../i18n";
import customVariables from "../../../theme/variables";
import { maybeInnerProperty } from "../../../utils/options";
import { BonusesAvailable } from "../types/bonusesAvailable";
import { ID_BONUS_VACANZE_TYPE } from "../utils/bonus";
import ActiveBonus from "./ActiveBonus";

type OwnProps = {
  onButtonPress: () => void;
  onBonusPress: (
    bonus: BonusActivationWithQrCode,
    validFrom?: Date,
    validTo?: Date
  ) => void;
  activeBonus: pot.Pot<BonusActivationWithQrCode, Error>;
  availableBonusesList: BonusesAvailable;
};

const styles = StyleSheet.create({
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  flexRow2: {
    flexDirection: "row",
    alignItems: "center"
  },
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
  },
  brandLightGray: {
    color: customVariables.brandLightGray
  },
  badgeColor: {
    height: 18,
    marginTop: 2,
    backgroundColor: customVariables.brandHighLighter
  },
  headerText: {
    fontSize: customVariables.fontSizeSmall,
    marginRight: 9
  },
  badgeText: {
    fontSize: customVariables.fontSizeSmaller,
    lineHeight: 16
  }
});

/**
 * Component to show the request Bonus section on the Wallet Home Screen:
 * - It renders a button to proceed to a new bonus request
 * - It renders the list, if present, of active bonuses already requested
 * @param props
 */
const RequestBonus: React.FunctionComponent<OwnProps> = (props: OwnProps) => {
  const {
    onButtonPress,
    activeBonus,
    onBonusPress,
    availableBonusesList
  } = props;
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
    <React.Fragment>
      <View style={styles.flexRow}>
        <View style={styles.flexRow2}>
          <Text style={[styles.brandLightGray, styles.headerText]}>
            {I18n.t("bonus.requestLabel")}
          </Text>
          <Badge style={styles.badgeColor}>
            <Text style={styles.badgeText}>
              {/* Replace with I18n.t("wallet.methods.newCome") after PR #1875 */}
              Novità
            </Text>
          </Badge>
        </View>
        <View>
          <AddPaymentMethodButton
            onPress={onButtonPress}
            iconSize={customVariables.fontSize2}
            labelSize={customVariables.fontSizeSmall}
          />
        </View>
      </View>
      <View spacer={true} />
      {pot.isSome(activeBonus) &&
        activeBonus.value && (
          <ActiveBonus
            bonus={activeBonus.value}
            onPress={onBonusPress}
            validFrom={validFrom}
            validTo={validTo}
          />
        )}
    </React.Fragment>
  );
};

export default RequestBonus;
