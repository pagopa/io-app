import * as pot from "italia-ts-commons/lib/pot";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import H5 from "../../../components/ui/H5";
import I18n from "../../../i18n";
import customVariables from "../../../theme/variables";
import { Bonus } from "../utils";
import ActiveBonus from "./ActiveBonus";

type OwnProps = {
  onButtonPress: () => void;
  onBonusPress: (bonus: Bonus) => void;
  bonus: pot.Pot<Bonus, Error>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "transparent"
  },
  activeBonus: {
    paddingBottom: 15
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
  const { onButtonPress, bonus, onBonusPress } = props;
  return (
    <Content>
      {pot.isSome(bonus) &&
        bonus.value && (
          <View style={styles.activeBonus}>
            <View>
              <View style={styles.subHeaderContent}>
                <H5 style={styles.brandDarkGray}>
                  {I18n.t("wallet.bonus.latestBonus")}
                </H5>
                <Text>{I18n.t("wallet.amount")}</Text>
              </View>
            </View>
            <View spacer={true} />
            <ActiveBonus bonus={bonus.value} onPress={onBonusPress} />
          </View>
        )}
      <View style={styles.container}>
        <ButtonDefaultOpacity
          block={true}
          bordered={true}
          onPress={onButtonPress}
          activeOpacity={1}
        >
          <Text bold={true}>{I18n.t("wallet.bonus.request")}</Text>
        </ButtonDefaultOpacity>
      </View>
    </Content>
  );
};

export default RequestBonus;
