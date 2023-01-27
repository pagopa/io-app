import * as React from "react";
import { View, StyleSheet } from "react-native";
import { IOBadge } from "../../../components/core/IOBadge";
import { VSpacer, HSpacer } from "../../../components/core/spacer/Spacer";
import { H2 } from "../../../components/core/typography/H2";
import { H4 } from "../../../components/core/typography/H4";
import { IOColors } from "../../../components/core/variables/IOColors";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import CustomBadge from "../../../components/ui/CustomBadge";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const styles = StyleSheet.create({
  fakeNavItem: {
    aspectRatio: 1,
    width: 25,
    backgroundColor: IOColors.greyLight
  }
});

export const DSBadges = () => (
  <DesignSystemScreen title={"Badge"}>
    <VSpacer size={16} />
    <View style={IOStyles.row}>
      <IOBadge text={"Badge"} small={true} labelColor={"white"} />
      <HSpacer size={16} />
      <IOBadge text={"Badge"} small={true} labelColor={"bluegreyDark"} />
      <HSpacer size={16} />
      <IOBadge text={"Badge"} small={true} labelColor={"blue"} />
      <HSpacer size={16} />
      <IOBadge text={"Badge"} small={true} labelColor={"red"} />
      <HSpacer size={16} />
    </View>
    <VSpacer size={16} />
    <View style={IOStyles.row}>
      <IOBadge text={"Badge"} labelColor={"white"} />
      <HSpacer size={16} />
      <IOBadge text={"Badge"} labelColor={"bluegreyDark"} />
      <HSpacer size={16} />
      <IOBadge text={"Badge"} labelColor={"blue"} />
      <HSpacer size={16} />
      <IOBadge text={"Badge"} labelColor={"red"} />
      <HSpacer size={16} />
    </View>
    <VSpacer size={40} />

    <H2>Notifications</H2>
    <VSpacer size={16} />
    <H4 weight="SemiBold" color="bluegreyDark">
      CustomBadge
    </H4>
    <VSpacer size={16} />
    <View style={IOStyles.row}>
      <View style={styles.fakeNavItem}>
        <CustomBadge badgeValue={1} />
      </View>
      <HSpacer />
      <View style={styles.fakeNavItem}>
        <CustomBadge badgeValue={99} />
      </View>
    </View>
  </DesignSystemScreen>
);
