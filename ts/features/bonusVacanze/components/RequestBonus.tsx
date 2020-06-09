import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { BonusActivationWithQrCode } from "../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import SectionCardComponent from "../../../components/wallet/card/SectionCardComponent";
import I18n from "../../../i18n";
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
