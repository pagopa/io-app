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
import SectionCardComponent from "../../../components/wallet/card/SectionCardComponent";

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
  brandLightGray: {
    color: customVariables.brandGray
  },
  badgeColor: {
    height: 18,
    marginTop: 5,
    backgroundColor: customVariables.brandHighLighter
  },
  headerText: {
    fontSize: customVariables.fontSizeSmall,
    marginRight: 9
  },
  badgeText: {
    fontSize: customVariables.fontSizeSmaller,
    lineHeight: 16
  },
  cardInner: {
    paddingBottom: 13,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 13
  },
  card: {
    // iOS and Andorid card shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 3,

    backgroundColor: customVariables.brandDarkGray,
    borderRadius: 8,
    marginBottom: -1,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 20
  },
  flatBottom: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  rotateCard: {
    marginBottom: -(58 / 2 + 1),
    flex: 1,
    shadowRadius: 10,
    shadowOpacity: 0.15,
    transform: [
      { perspective: 700 },
      { rotateX: "-20deg" },
      { scaleX: 0.98 },
      { translateY: -(58 / 2 + 20) * (1 - Math.cos(20)) }
    ]
  },
  rotateText: {
    flex: 1,
    transform: [{ perspective: 700 }, { rotateX: "20deg" }, { scaleX: 0.98 }]
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
      <SectionCardComponent
        label={I18n.t("bonus.requestLabel")}
        onPress={onButtonPress}
        isNew={true}
      />
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
