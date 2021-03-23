import { View } from "native-base";
import * as React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { H4 } from "../core/typography/H4";
import I18n from "../../i18n";
import { H5 } from "../core/typography/H5";
import { IOStyles } from "../core/variables/IOStyles";
import Switch from "../ui/Switch";

type Props = {
  isLoading?: boolean;
  onValueChange?: (value: boolean) => void;
  switchValue: boolean;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  left: {
    ...IOStyles.flex,
    paddingRight: 8
  },
  right: {
    justifyContent: "flex-start"
  }
});

export const FavoritePaymentMethodSwitch = (props: Props) => (
  <View style={styles.row}>
    <View style={styles.left}>
      <H4 weight={"SemiBold"} color={"bluegreyDark"}>
        {I18n.t("wallet.favourite.setFavoriteTitle")}
      </H4>
      <H5 weight={"Regular"} color={"bluegrey"}>
        {I18n.t("wallet.favourite.setFavoriteSubtitle")}
      </H5>
    </View>
    <View style={styles.right}>
      {props.isLoading && (
        <ActivityIndicator
          color={"black"}
          accessible={false}
          importantForAccessibility={"no-hide-descendants"}
          accessibilityElementsHidden={true}
        />
      )}
      {!props.isLoading && (
        <Switch
          onValueChange={v => props.onValueChange?.(v)}
          value={props.switchValue}
        />
      )}
    </View>
  </View>
);
