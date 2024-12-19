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
    <DSComponentViewerBox name={"Badge · Default variant"}>
      <HStack space={componentInnerMargin}>
        <Badge text={"Default"} variant="default" />
        <Badge outline text={"Default"} variant="default" />
      </HStack>
    </DSComponentViewerBox>
    <DSComponentViewerBox name={"Badge · Different variants"}>
      <VStack space={componentInnerMargin}>
        <HStack space={componentInnerMargin}>
          <Badge text={"Info"} variant="info" />
          <Badge text={"Warning"} variant="warning" />
          <Badge text={"Error"} variant="error" />
          <Badge text={"Success"} variant="success" />
        </HStack>
        <HStack space={componentInnerMargin}>
          <Badge text={"Purple"} variant="purple" />
          <Badge text={"Light blue"} variant="lightBlue" />
          <Badge text={"Blue"} variant="blue" />
          <Badge text={"Turquoise"} variant="turquoise" />
        </HStack>
      </VStack>
    </DSComponentViewerBox>
    <DSComponentViewerBox name={"Badge · Outline variants"}>
      <VStack space={componentInnerMargin}>
        <HStack space={componentInnerMargin}>
          <Badge outline text={"Info"} variant="info" />
          <Badge outline text={"Warning"} variant="warning" />
          <Badge outline text={"Error"} variant="error" />
          <Badge outline text={"Success"} variant="success" />
        </HStack>
        <HStack space={componentInnerMargin}>
          <Badge outline text={"Purple"} variant="purple" />
          <Badge outline text={"Light blue"} variant="lightBlue" />
          <Badge outline text={"Blue"} variant="blue" />
          <Badge outline text={"Turquoise"} variant="turquoise" />
        </HStack>
      </VStack>
    </DSComponentViewerBox>
    <DSComponentViewerBox name={"Badge · Contrast variant"}>
      <View
        style={{
          backgroundColor: IOColors.bluegrey,
          padding: 16,
          borderRadius: 24,
          borderCurve: "continuous"
        }}
      >
        <HStack space={componentInnerMargin}>
          <Badge text={"Default"} variant="default" />
          <Badge text={"Contrast"} variant="contrast" />
        </HStack>
      </View>
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
          color: "grey"
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
