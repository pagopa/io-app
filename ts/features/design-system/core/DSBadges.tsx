import {
  Badge,
  HSpacer,
  IOColors,
  IOTagRadius,
  Tag,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import { H2 } from "../../../components/core/typography/H2";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

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
    <DSComponentViewerBox name={"Tag · Custom icon (with custom color)"}>
      <Tag
        text={"Custom icon"}
        variant="customIcon"
        customIconProps={{
          iconName: "categTravel",
          iconColor: "grey-700"
        }}
      />
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
