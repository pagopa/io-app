import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { BonusActivationWithQrCode } from "../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { BonusesAvailable } from "../../../../definitions/content/BonusesAvailable";
import SectionCardComponent from "../../../components/wallet/card/SectionCardComponent";
import I18n from "../../../i18n";
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
  const maybeBonusVacanzeCategory = fromNullable(
    availableBonusesList.find(bi => bi.id_type === ID_BONUS_VACANZE_TYPE)
  );

  return (
    <React.Fragment>
      <SectionCardComponent
        label={I18n.t("bonus.requestLabel")}
        onPress={onButtonPress}
        isNew={true}
      />
      {!pot.isLoading(activeBonus) &&
        pot.isSome(activeBonus) &&
        activeBonus.value && (
          <ActiveBonus
            bonus={activeBonus.value}
            onPress={onBonusPress}
            validFrom={maybeBonusVacanzeCategory
              .map(b => b.valid_from)
              .toUndefined()}
            validTo={maybeBonusVacanzeCategory
              .map(b => b.valid_to)
              .toUndefined()}
          />
        )}
    </React.Fragment>
  );
};

export default RequestBonus;
