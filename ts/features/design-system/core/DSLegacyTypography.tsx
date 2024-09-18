import { HStack, IOColors, VStack } from "@pagopa/io-app-design-system";
import * as React from "react";
import { Alert, View } from "react-native";
import { Body as LegacyBody } from "../../../components/core/typography/Body";
import { H1 as LegacyH1 } from "../../../components/core/typography/H1";
import { H2 as LegacyH2 } from "../../../components/core/typography/H2";
import { H3 as LegacyH3 } from "../../../components/core/typography/H3";
import { H4 as LegacyH4 } from "../../../components/core/typography/H4";
import { H5 as LegacyH5 } from "../../../components/core/typography/H5";
import { Label as LegacyLabel } from "../../../components/core/typography/Label";
import { LabelSmall as LegacyLabelSmall } from "../../../components/core/typography/LabelSmall";
import { Link as LegacyLink } from "../../../components/core/typography/Link";
import { Monospace as LegacyMonospace } from "../../../components/core/typography/Monospace";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

export const DSLegacyTypography = () => (
  <DesignSystemScreen title={"Legacy typography"}>
    <VStack space={40}>
      <LegacyH1Row />
      <LegacyH2Row />
      <LegacyH3Row />
      <LegacyH4Row />
      <LegacyH5Row />
      <LegacyBodyRow />
      <LegacyLabelSmallRow />
      <LegacyLabelRow />
      <LegacyLink onPress={() => Alert.alert("onPress link!")}>Link</LegacyLink>
      <LegacyMonospace>MonoSpace</LegacyMonospace>
    </VStack>
  </DesignSystemScreen>
);

const getTitle = (element: string) => `Heading ${element}`;
const getLongerTitle = (element: string) =>
  `Very loooong looong title set with Heading ${element}`;

const typeSpecimenMargin = 8;

const LegacyH1Row = () => (
  <VStack space={typeSpecimenMargin}>
    <LegacyH1>{getTitle("H1")}</LegacyH1>
    <LegacyH1>{getLongerTitle("H1")}</LegacyH1>
  </VStack>
);

const LegacyH2Row = () => (
  <VStack space={typeSpecimenMargin}>
    <LegacyH2>{getTitle("H2")}</LegacyH2>
    <LegacyH2>{getLongerTitle("H2")}</LegacyH2>
    <LegacyH2 weight={"Semibold"}>{getTitle("H2 Semibold")}</LegacyH2>
  </VStack>
);

const LegacyH3Row = () => (
  <VStack space={typeSpecimenMargin}>
    <HStack space={16}>
      <LegacyH3>Header H3 SB</LegacyH3>
      <LegacyH3 color={"bluegreyLight"}>Header H3 SB</LegacyH3>
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <LegacyH3 color={"white"}>Header H3 SB</LegacyH3>
      </View>
    </HStack>
    <HStack space={16}>
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <LegacyH3 color={"white"} weight={"Bold"}>
          Header H3 Bold
        </LegacyH3>
      </View>
    </HStack>
  </VStack>
);

const LegacyH4Row = () => (
  <VStack space={typeSpecimenMargin}>
    <HStack space={16}>
      {/* Bold */}
      <LegacyH4>Header H4 Bold</LegacyH4>
      <LegacyH4 color={"blue"}>Header H4 Bold</LegacyH4>
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <LegacyH4 color={"white"}>Header H4 Bold</LegacyH4>
      </View>
    </HStack>
    <HStack space={16}>
      {/* Semibold */}
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <LegacyH4 color={"white"} weight={"Semibold"}>
          Header H4 Semibold
        </LegacyH4>
      </View>
    </HStack>
    <HStack space={16}>
      {/* Regular */}
      <LegacyH4 weight={"Regular"} color={"bluegreyDark"}>
        Header H4
      </LegacyH4>
      <LegacyH4 weight={"Regular"} color={"bluegrey"}>
        Header H4
      </LegacyH4>
      <LegacyH4 weight={"Regular"} color={"bluegreyLight"}>
        Header H4
      </LegacyH4>
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <LegacyH4 weight={"Regular"} color={"white"}>
          Header H4
        </LegacyH4>
      </View>
    </HStack>
  </VStack>
);

const LegacyH5Row = () => (
  <VStack space={typeSpecimenMargin}>
    <HStack space={16}>
      <LegacyH5>Header H5 SB</LegacyH5>
      <LegacyH5 color={"bluegrey"}>Header H5 SB</LegacyH5>
      <LegacyH5 color={"blue"}>Header H5 SB</LegacyH5>
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <LegacyH5 color={"white"}>Header H5 SB</LegacyH5>
      </View>
    </HStack>
    <HStack space={16}>
      <LegacyH5 weight={"Regular"}>Header H5</LegacyH5>
      <LegacyH5 weight={"Regular"} color={"bluegrey"}>
        Header H5
      </LegacyH5>
      <LegacyH5 weight={"Regular"} color={"blue"}>
        Header H5
      </LegacyH5>
    </HStack>
  </VStack>
);

const LegacyBodyRow = () => (
  <VStack space={typeSpecimenMargin}>
    <LegacyBody>Body</LegacyBody>
    <LegacyBody>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam a felis
      congue, congue leo sit amet, semper ex. Nulla consectetur non quam vel
      porttitor. Vivamus ac ex non nunc pellentesque molestie. Aliquam id lorem
      aliquam, aliquam massa eget, commodo erat. Maecenas finibus dui massa,
      eget pharetra mauris posuere semper.
    </LegacyBody>
  </VStack>
);

const LegacyLabelSmallRow = () => (
  <HStack space={16}>
    <LegacyLabelSmall>Label small</LegacyLabelSmall>
    <LegacyLabelSmall color={"bluegrey"}>Label small</LegacyLabelSmall>
    <LegacyLabelSmall color={"red"}>Label small</LegacyLabelSmall>
    <View style={{ backgroundColor: IOColors.bluegrey }}>
      <LegacyLabelSmall color={"white"}>Label small</LegacyLabelSmall>
    </View>
  </HStack>
);

const LegacyLabelRow = () => (
  <HStack space={16}>
    <LegacyLabel>Label</LegacyLabel>
    <LegacyLabel color={"bluegrey"}>Label</LegacyLabel>
    <View style={{ backgroundColor: IOColors.bluegrey }}>
      <LegacyLabel color={"white"}>Label</LegacyLabel>
    </View>
  </HStack>
);
