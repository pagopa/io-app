import {
  Badge,
  H4,
  HStack,
  IOColors,
  IOTagRadius,
  Tag,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const sectionTitleMargin = 16;
const sectionMargin = 40;
const componentMargin = 24;
const componentInnerMargin = 8;

export const DSBadges = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Badge"}>
      <VStack space={sectionMargin}>
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Tag</H4>
          {renderTag()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Badge</H4>
          {renderBadge()}
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};

const renderBadge = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name={"Badge · Default"}>
      <HStack space={componentInnerMargin} style={{ flexWrap: "wrap" }}>
        <Badge text={"Default"} variant="default" />
        <Badge text={"Warning"} variant="warning" />
        <Badge text={"Error"} variant="error" />
        <Badge text={"Success"} variant="success" />
        <Badge text={"Cgn"} variant="cgn" />
        <Badge text={"Highlight"} variant="highlight" />
      </HStack>
    </DSComponentViewerBox>
    <DSComponentViewerBox name={"Badge · Outline variants"}>
      <HStack space={componentInnerMargin} style={{ flexWrap: "wrap" }}>
        <Badge outline text={"Default"} variant="default" />
        <Badge outline text={"Warning"} variant="warning" />
        <Badge outline text={"Error"} variant="error" />
        <Badge outline text={"Success"} variant="success" />
        <Badge outline text={"Cgn"} variant="cgn" />
        <Badge outline text={"Highlight"} variant="highlight" />
      </HStack>
    </DSComponentViewerBox>
  </VStack>
);

const renderTag = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name={"Tag · Different variants"}>
      <VStack space={componentInnerMargin}>
        <Tag text={"Entro il 30 mag"} variant="warning" />
        <Tag text={"Completato"} variant="success" />
        <Tag text={"Scaduto"} variant="error" />
        <HStack space={componentInnerMargin}>
          <Tag text={"Certificato"} variant="qrCode" />
          <Tag text={"Valore legale"} variant="legalMessage" />
        </HStack>
      </VStack>
    </DSComponentViewerBox>
    <DSComponentViewerBox name={"Tag · With icon, no text"}>
      <Tag variant="attachment" iconAccessibilityLabel="Allegati" />
    </DSComponentViewerBox>
    <DSComponentViewerBox name={"Tag · Without icon"}>
      <Tag text={"No icon"} variant="noIcon" />
    </DSComponentViewerBox>
    <DSComponentViewerBox name={"Tag · Custom icon (with custom color)"}>
      <Tag
        text={"Custom icon"}
        variant="custom"
        icon={{
          name: "categTravel",
          color: "grey-450"
        }}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name={"Tag · Stress test"}>
      <View
        style={{
          backgroundColor: IOColors["error-100"],
          padding: 8,
          width: "40%",
          borderRadius: IOTagRadius + 8
        }}
      >
        <Tag text={"Loooooooooooong string"} variant="error" />
      </View>
    </DSComponentViewerBox>
  </VStack>
);
