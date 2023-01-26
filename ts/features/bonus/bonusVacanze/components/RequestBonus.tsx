import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { BonusActivationWithQrCode } from "../../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { BonusesAvailable } from "../../../../../definitions/content/BonusesAvailable";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { IOColors } from "../../../../components/core/variables/IOColors";
import SectionCardComponent, {
  SectionCardStatus
} from "../../../../components/wallet/card/SectionCardComponent";
import I18n from "../../../../i18n";
import { ID_BONUS_VACANZE_TYPE } from "../utils/bonus";
import BonusCardComponent from "./BonusCardComponent";

type OwnProps = {
  onButtonPress: () => void;
  status?: SectionCardStatus;
  onBonusPress: (
    bonus: BonusActivationWithQrCode,
    validFrom?: Date,
    validTo?: Date
  ) => void;
  activeBonuses: ReadonlyArray<pot.Pot<BonusActivationWithQrCode, Error>>;
  availableBonusesList: BonusesAvailable;
};

const styles = StyleSheet.create({
  preview: {
    shadowColor: IOColors.black,
    shadowOffset: {
      width: 0,
      height: 12
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    zIndex: 0,
    elevation: 0
  }
});

/**
 * Component to show the request Bonus section on the Wallet Home Screen:
 * - It renders a button to proceed to a new bonus request
 * - It renders the list, if present, of active bonuses already requested
 * @param props
 */
const RequestBonus: React.FunctionComponent<OwnProps> = (props: OwnProps) => {
  const { onButtonPress, activeBonuses, onBonusPress, availableBonusesList } =
    props;
  const maybeBonusVacanzeCategory = pipe(
    O.fromNullable(
      availableBonusesList.find(bi => bi.id_type === ID_BONUS_VACANZE_TYPE)
    )
  );

  const validFrom = pipe(
    maybeBonusVacanzeCategory,
    O.map(b => b.valid_from),
    O.toUndefined
  );
  const validTo = pipe(
    maybeBonusVacanzeCategory,
    O.map(b => b.valid_to),
    O.toUndefined
  );

  return (
    <React.Fragment>
      <SectionCardComponent
        status={props.status}
        accessibilityLabel={I18n.t("bonus.accessibility.sectionCardLabel")}
        accessibilityHint={I18n.t("bonus.accessibility.sectionCardHint")}
        label={I18n.t("bonus.requestLabel")}
        onPress={onButtonPress}
      />
      {activeBonuses.length > 0 ? (
        activeBonuses.map(
          bonus =>
            pot.isSome(bonus) && (
              <View key={bonus.value.id} style={styles.preview}>
                <BonusCardComponent
                  bonus={bonus.value}
                  preview={true}
                  onPress={() => onBonusPress(bonus.value, validFrom, validTo)}
                />
              </View>
            )
        )
      ) : (
        <VSpacer size={4} />
      )}
    </React.Fragment>
  );
};

export default RequestBonus;
