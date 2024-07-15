import {
  Body,
  BodyMonospace,
  ButtonText,
  Caption,
  Chip,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  HStack,
  Hero,
  IOColors,
  Label,
  LabelLink,
  LabelSmall,
  VStack
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { Alert, View } from "react-native";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

export const DSTypography = () => (
  <DesignSystemScreen title={"Typography"}>
    <VStack space={40}>
      <HeroRow />
      <H1Row />
      <H2Row />
      <H3Row />
      <H4Row />
      <H5Row />
      <H6Row />
      <ButtonTextRow />
      <CaptionRow />
      <ChipRow />
      <BodyRow />
      <BodyMonospace>BodyMonoSpace</BodyMonospace>
      <LabelSmallRow />
      <LabelRow />
      <LabelLink onPress={() => Alert.alert("onPress LabelLink!")}>
        LabelLink
      </LabelLink>
    </VStack>
  </DesignSystemScreen>
);

const getTitle = (element: string) => `Heading ${element}`;
const getLongerTitle = (element: string) =>
  `Very loooong looong title set with Heading ${element}`;

const HeroRow = () => (
  <View>
    <Hero>{getTitle("Hero")}</Hero>
    <Hero>{getLongerTitle("Hero")}</Hero>
  </View>
);

const H1Row = () => (
  <VStack space={8}>
    <H1>{getTitle("H1")}</H1>
    <H1>{getLongerTitle("H1")}</H1>
  </VStack>
);

const H2Row = () => (
  <VStack space={8}>
    <H2>{getTitle("H2")}</H2>
    <H2>{getLongerTitle("H2")}</H2>
  </VStack>
);

const H3Row = () => (
  <HStack space={16}>
    <H3>Header H3</H3>
    <H3 color="grey-650">Header H3</H3>
    <View style={{ backgroundColor: IOColors["grey-700"] }}>
      <H3 color={"white"}>Header H3</H3>
    </View>
  </HStack>
);

const H4Row = () => (
  <HStack space={16}>
    <H4>Header H4</H4>
    <H4 color="blueIO-500">Header H4</H4>
    <View style={{ backgroundColor: IOColors["grey-700"] }}>
      <H4 color={"white"}>Header H4</H4>
    </View>
  </HStack>
);

const H5Row = () => (
  <HStack space={16}>
    <H5>Header H5</H5>
    <H5 color="grey-650">Header H5</H5>
    <H5 color={"blueIO-500"}>Header H5</H5>
  </HStack>
);

const H6Row = () => (
  <HStack space={16}>
    <H6>Header H6</H6>
    <H6 color="grey-650">Header H6</H6>
    <H6 color={"blueIO-500"}>Header H6</H6>
  </HStack>
);

const ButtonTextRow = () => (
  <HStack space={16}>
    <ButtonText color="grey-700">ButtonText</ButtonText>
    <ButtonText color="blueIO-500">ButtonText</ButtonText>
    <View style={{ backgroundColor: IOColors["grey-700"] }}>
      <ButtonText>ButtonText</ButtonText>
    </View>
  </HStack>
);

const CaptionRow = () => (
  <HStack space={16}>
    <Caption>Caption</Caption>
    <Caption color="grey-650">Caption</Caption>
    <Caption color={"blueIO-500"}>Caption</Caption>
  </HStack>
);

const ChipRow = () => (
  <HStack space={16}>
    <Chip>Chip</Chip>
    <Chip color="grey-650">Chip</Chip>
    <Chip color={"blueIO-500"}>Chip</Chip>
  </HStack>
);

const BodyRow = () => (
  <VStack space={16}>
    <Body>Body</Body>
    <Body>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam a felis
      congue, congue leo sit amet, semper ex. Nulla consectetur non quam vel
      porttitor. Vivamus ac ex non nunc pellentesque molestie. Aliquam id lorem
      aliquam, aliquam massa eget, commodo erat. Maecenas finibus dui massa,
      eget pharetra mauris posuere semper.
    </Body>
  </VStack>
);

const LabelSmallRow = () => (
  <HStack space={16}>
    <LabelSmall>Label small</LabelSmall>
    <LabelSmall color={"bluegrey"}>Label small</LabelSmall>
    <LabelSmall color={"red"}>Label small</LabelSmall>
    <View style={{ backgroundColor: IOColors.bluegrey }}>
      <LabelSmall color={"white"}>Label small</LabelSmall>
    </View>
  </HStack>
);

const LabelRow = () => (
  <HStack space={16}>
    <Label>Label</Label>
    <View style={{ backgroundColor: IOColors.bluegrey }}>
      <Label color={"white"}>Label</Label>
    </View>
  </HStack>
);
