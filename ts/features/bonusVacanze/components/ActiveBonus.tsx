import { Text } from "native-base";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import IconFont from "../../../components/ui/IconFont";
import I18n from "../../../i18n";
import customVariables from "../../../theme/variables";
import { formatDateAsLocal } from "../../../utils/dates";
import { Bonus } from "../mock/mockData";

type Props = {
  bonus: Bonus;
  onPress: (bonus: Bonus) => void;
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
  badgeContainer: {
    flex: 0,
    paddingRight: 8,
    alignSelf: "flex-start",
    paddingTop: 6.5
  },
  viewStyle: {
    flexDirection: "row"
  },
  text11: {
    color: customVariables.brandDarkestGray
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
  return (
    <TouchableDefaultOpacity onPress={() => props.onPress(props.bonus)}>
      <View style={styles.spaced}>
        <Text small={true} dark={true}>
          {I18n.t("bonus.active")}
        </Text>
        <Text bold={true} style={styles.text12}>
          {props.bonus.max_amount}
        </Text>
      </View>
      <View style={styles.viewStyle}>
        <Text xsmall={true}>
          {formatDateAsLocal(props.bonus.activated_at, true, true)}
        </Text>
      </View>
      <View style={styles.smallSpacer} />
      <View style={styles.text3Line}>
        <View style={styles.text3Container}>
          <Text numberOfLines={2} style={styles.text3}>
            {props.bonus.type}
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
