import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { BonusActivationWithQrCode } from "../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { BonusesAvailable } from "../../../../definitions/content/BonusesAvailable";
import SectionCardComponent from "../../../components/wallet/card/SectionCardComponent";
import I18n from "../../../i18n";
import { ID_BONUS_VACANZE_TYPE } from "../utils/bonus";
import BonusCardComponent from "./BonusCardComponent";
import customVariables from "../../../theme/variables";

type OwnProps = {
  onButtonPress: () => void;
  onBonusPress: (
    bonus: BonusActivationWithQrCode,
    validFrom?: Date,
    validTo?: Date
  ) => void;
  activeBonus: pot.Pot<BonusActivationWithQrCode, Error>;
  availableBonusesList: BonusesAvailable;
  noMethod: boolean;
};

const styles = StyleSheet.create({
  preview: {
    shadowColor: "#000",
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
  const {
    onButtonPress,
    activeBonus,
    onBonusPress,
    availableBonusesList,
    noMethod
  } = props;
  const maybeBonusVacanzeCategory = fromNullable(
    availableBonusesList.find(bi => bi.id_type === ID_BONUS_VACANZE_TYPE)
  );

  const validFrom = maybeBonusVacanzeCategory
    .map(b => b.valid_from)
    .toUndefined();
  const validTo = maybeBonusVacanzeCategory.map(b => b.valid_to).toUndefined();
  return (
    <React.Fragment>
      <SectionCardComponent
        label={I18n.t("bonus.requestLabel")}
        onPress={onButtonPress}
        isNew={true}
        cardStyle={
          noMethod
            ? { backgroundColor: customVariables.brandPrimary }
            : undefined
        }
      />
      {pot.isSome(activeBonus) ? (
        <View style={styles.preview}>
          <BonusCardComponent
            bonus={activeBonus.value}
            preview={true}
            onPress={() => onBonusPress(activeBonus.value, validFrom, validTo)}
          />
        </View>
      ) : (
        <View spacer={true} xsmall={true} />
      )}
    </React.Fragment>
  );
};

export default RequestBonus;
