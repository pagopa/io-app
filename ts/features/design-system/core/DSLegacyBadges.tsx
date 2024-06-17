import {
  HSpacer,
  IOColors,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";

import { H3 } from "../../../components/core/typography/H3";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import CgnDiscountValueBox from "../../bonus/cgn/components/merchants/CgnDiscountValueBox";
import CustomBadge from "../../../components/ui/CustomBadge";
import { IOBadge } from "../../../components/core/IOBadge";
import { H4 } from "../../../components/core/typography/H4";

const styles = StyleSheet.create({
  fakeNavItem: {
    aspectRatio: 1,
    width: 25,
    backgroundColor: IOColors.greyLight
  }
});

export const DSLegacyBadges = () => (
  <DesignSystemScreen title={"Legacy Badges"}>
    <H3 style={{ marginBottom: 16 }}>IOBadge</H3>
    {renderIOBadge()}

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

    <H3>Notifications</H3>
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

const renderIOBadge = () => (
  <>
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
  </>
);
