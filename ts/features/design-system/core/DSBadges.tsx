import * as React from "react";
import { View, StyleSheet } from "react-native";
import { IOBadge } from "../../../components/core/IOBadge";
import { VSpacer, HSpacer } from "../../../components/core/spacer/Spacer";
import { H2 } from "../../../components/core/typography/H2";
import { H4 } from "../../../components/core/typography/H4";
import { IOColors } from "../../../components/core/variables/IOColors";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import CustomBadge from "../../../components/ui/CustomBadge";
import CgnDiscountValueBox from "../../bonus/cgn/components/merchants/CgnDiscountValueBox";
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
      <IOBadge small text={"Badge"} variant="solid" color="blue" />
      <HSpacer size={16} />
      <IOBadge small text={"Badge"} variant="solid" color="red" />
      <HSpacer size={16} />
      <IOBadge small text={"Badge"} variant="solid" color="aqua" />
      <HSpacer size={16} />
      <IOBadge small text={"Badge"} variant="solid" color="grey" />
    </View>
    <VSpacer size={16} />
    <View style={IOStyles.row}>
      <IOBadge small text={"Badge"} variant="outline" color="blue" />
      <HSpacer size={16} />
      <IOBadge small text={"Badge"} variant="outline" color="red" />
      <HSpacer size={16} />
      <IOBadge small text={"Badge"} variant="outline" color="orange" />
    </View>
    <VSpacer size={16} />
    <View style={IOStyles.row}>
      <IOBadge text={"Badge"} variant="solid" color="blue" />
      <HSpacer size={16} />
      <IOBadge text={"Badge"} variant="solid" color="red" />
      <HSpacer size={16} />
      <IOBadge text={"Badge"} variant="solid" color="aqua" />
      <HSpacer size={16} />
      <IOBadge text={"Badge"} variant="solid" color="grey" />
    </View>
    <VSpacer size={16} />
    <View style={IOStyles.row}>
      <IOBadge text={"Badge"} variant="outline" color="blue" />
      <HSpacer size={16} />
      <IOBadge text={"Badge"} variant="outline" color="red" />
      <HSpacer size={16} />
      <IOBadge text={"Badge"} variant="outline" color="orange" />
    </View>
    <VSpacer size={16} />
    <View
      style={{
        backgroundColor: IOColors.bluegrey,
        padding: 16,
        borderRadius: 8
      }}
    >
      <View style={IOStyles.row}>
        <IOBadge small text={"Badge"} variant="solid" color="aqua" />
        <HSpacer size={16} />
        <IOBadge small text={"Badge"} variant="solid" color="white" />
        <HSpacer size={16} />
        <IOBadge small text={"Badge"} variant="outline" color="white" />
      </View>
      <VSpacer size={16} />
      <View style={IOStyles.row}>
        <IOBadge text={"Badge"} variant="solid" color="aqua" />
        <HSpacer size={16} />
        <IOBadge text={"Badge"} variant="solid" color="white" />
        <HSpacer size={16} />
        <IOBadge text={"Badge"} variant="outline" color="white" />
      </View>
    </View>
    <VSpacer size={24} />
    <H4 weight="SemiBold" color="bluegreyDark">
      DiscountValueBox (CGN)
    </H4>
    <VSpacer size={16} />
    <View style={IOStyles.row}>
      <CgnDiscountValueBox value={25} small />
      <HSpacer size={16} />
      <CgnDiscountValueBox value={25} />
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
