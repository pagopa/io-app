import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { BonusActivationWithQrCode } from "../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { BonusesAvailable } from "../../../../definitions/content/BonusesAvailable";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import H5 from "../../../components/ui/H5";
import I18n from "../../../i18n";
import customVariables from "../../../theme/variables";
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
    <Content>
      {!pot.isLoading(activeBonus) &&
        pot.isSome(activeBonus) && (
          <View>
            <View style={styles.subHeaderContent}>
              <H5 style={styles.brandDarkGray}>
                {I18n.t("bonus.latestBonus")}
              </H5>
              <Text>{I18n.t("wallet.amount")}</Text>
            </View>
            <View spacer={true} />
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
