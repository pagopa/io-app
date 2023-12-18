import * as React from "react";
import { View, StyleSheet } from "react-native";
import {
  Badge,
  IOColors,
  Tag,
  VSpacer,
  HSpacer,
  IOTagRadius
} from "@pagopa/io-app-design-system";
import { IOBadge } from "../../../components/core/IOBadge";
import { H2 } from "../../../components/core/typography/H2";
import { H4 } from "../../../components/core/typography/H4";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import CustomBadge from "../../../components/ui/CustomBadge";
import CgnDiscountValueBox from "../../bonus/cgn/components/merchants/CgnDiscountValueBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { H3 } from "../../../components/core/typography/H3";

const styles = StyleSheet.create({
  fakeNavItem: {
    aspectRatio: 1,
    width: 25,
    backgroundColor: IOColors.greyLight
  }
});

export const DSBadges = () => (
  <DesignSystemScreen title={"Badge"}>
    <H2 weight={"Bold"} style={{ marginBottom: 16 }}>
      Tag
    </H2>
    {renderTag()}

    <VSpacer size={16} />

    <H2 weight={"Bold"} style={{ marginVertical: 16 }}>
      Badge
    </H2>
    {renderBadge()}

    <VSpacer size={40} />

    <H2 weight={"Bold"}>Legacy</H2>
    <H3 style={{ marginVertical: 16 }}>IOBadge</H3>
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

const renderBadge = () => (
  <>
    <View style={IOStyles.row}>
      <Badge text={"Default"} variant="default" />
      <HSpacer size={16} />
      <Badge outline text={"Default"} variant="default" />
    </View>
    <VSpacer size={16} />
    <View style={IOStyles.row}>
      <Badge text={"Info"} variant="info" />
      <HSpacer size={16} />
      <Badge text={"Warning"} variant="warning" />
      <HSpacer size={16} />
      <Badge text={"Error"} variant="error" />
      <HSpacer size={16} />
      <Badge text={"Success"} variant="success" />
    </View>
    <VSpacer size={16} />
    <View style={IOStyles.row}>
      <Badge text={"Purple"} variant="purple" />
      <HSpacer size={16} />
      <Badge text={"Light blue"} variant="lightBlue" />
      <HSpacer size={16} />
      <Badge text={"Blue"} variant="blue" />
      <HSpacer size={16} />
      <Badge text={"Turquoise"} variant="turquoise" />
      <HSpacer size={16} />
    </View>
    <VSpacer size={16} />
    <View style={IOStyles.row}>
      <Badge outline text={"Info"} variant="info" />
      <HSpacer size={16} />
      <Badge outline text={"Warning"} variant="warning" />
      <HSpacer size={16} />
      <Badge outline text={"Error"} variant="error" />
      <HSpacer size={16} />
      <Badge outline text={"Success"} variant="success" />
    </View>
    <VSpacer size={16} />
    <View style={IOStyles.row}>
      <Badge outline text={"Purple"} variant="purple" />
      <HSpacer size={16} />
      <Badge outline text={"Light blue"} variant="lightBlue" />
      <HSpacer size={16} />
      <Badge outline text={"Blue"} variant="blue" />
      <HSpacer size={16} />
      <Badge outline text={"Turquoise"} variant="turquoise" />
      <HSpacer size={16} />
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
        <Badge text={"Default"} variant="default" />
        <HSpacer size={16} />
        <Badge text={"Contrast"} variant="contrast" />
      </View>
    </View>
  </>
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

const renderTag = () => (
  <View>
    <DSComponentViewerBox name={"Tag · Different variants"}>
      <Tag text={"Entro il 30 mag"} variant="warning" />
      <VSpacer size={8} />
      <Tag text={"Completato"} variant="success" />
      <VSpacer size={8} />
      <Tag text={"Scaduto"} variant="error" />
      <VSpacer size={8} />
      <View style={IOStyles.row}>
        <Tag text={"Certificato"} variant="qrCode" />
        <HSpacer size={8} />
        <Tag text={"Valore legale"} variant="legalMessage" />
      </View>
    </DSComponentViewerBox>
    <DSComponentViewerBox name={"Tag · With icon, no text"}>
      <Tag variant="attachment" />
    </DSComponentViewerBox>
    <DSComponentViewerBox name={"Tag · Without icon"}>
      <VSpacer size={8} />
      <Tag text={"No icon"} variant="noIcon" />
    </DSComponentViewerBox>
    <DSComponentViewerBox name={"Tag · Stress test"}>
      <View
        style={{
          backgroundColor: IOColors["error-100"],
          padding: 8,
          width: "60%",
          borderRadius: IOTagRadius + 8
        }}
      >
        <Tag text={"Loooooooooooong string"} variant="error" />
      </View>
    </DSComponentViewerBox>
  </View>
);
