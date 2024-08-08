import {
  Body,
  BodyMonospace,
  ButtonText,
  Caption,
  Chip,
  Divider,
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
  LabelMini,
  LabelSmall,
  LabelSmallAlt,
  MdH1,
  MdH2,
  MdH3,
  VSpacer,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { Alert, View } from "react-native";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const linkOnPress = () => Alert.alert("onPress triggered");

const blockMargin = 40;
const typographicStyleMargin = 16;

export const DSTypography = () => (
  <DesignSystemScreen title={"Typography"}>
    <VStack space={blockMargin}>
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
      <VStack space={typographicStyleMargin}>
        <LabelSmallRow />
        <LabelSmallAltRow />
        <LabelMiniRow />
        <LabelRow />
      </VStack>
    </VStack>
    <VSpacer size={blockMargin} />
    <Divider />
    <VSpacer size={blockMargin} />
    <VStack space={blockMargin}>
      <MdH1Row />
      <MdH2Row />
      <MdH3Row />
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

const H3Row = () => {
  const theme = useIOTheme();

  return (
    <HStack space={16}>
      <H3>Header H3</H3>
      <H3 color={theme["interactiveElem-default"]}>Header H3</H3>
      <View
        style={{ backgroundColor: IOColors[theme["appBackground-accent"]] }}
      >
        <H3 color={"white"}>Header H3</H3>
      </View>
    </HStack>
  );
};

const H4Row = () => {
  const theme = useIOTheme();

  return (
    <HStack space={16}>
      <H4>Header H4</H4>
      <H4 color={theme["interactiveElem-default"]}>Header H4</H4>
      <View
        style={{ backgroundColor: IOColors[theme["appBackground-accent"]] }}
      >
        <H4 color={"white"}>Header H4</H4>
      </View>
    </HStack>
  );
};

const H5Row = () => {
  const theme = useIOTheme();

  return (
    <HStack space={16}>
      <H5>Header H5</H5>
      <H5 color={theme["textHeading-tertiary"]}>Header H5</H5>
      <H5 color={theme["interactiveElem-default"]}>Header H5</H5>
    </HStack>
  );
};

const H6Row = () => {
  const theme = useIOTheme();

  return (
    <HStack space={16}>
      <H6>Header H6</H6>
      <H6 color={theme["textHeading-tertiary"]}>Header H6</H6>
      <H6 color={theme["interactiveElem-default"]}>Header H6</H6>
    </HStack>
  );
};

const ButtonTextRow = () => {
  const theme = useIOTheme();

  return (
    <HStack space={16}>
      <ButtonText color={theme["textBody-tertiary"]}>ButtonText</ButtonText>
      <ButtonText color={theme["interactiveElem-default"]}>
        ButtonText
      </ButtonText>
      <View
        style={{ backgroundColor: IOColors[theme["appBackground-accent"]] }}
      >
        <ButtonText>ButtonText</ButtonText>
      </View>
    </HStack>
  );
};

const CaptionRow = () => {
  const theme = useIOTheme();

  return (
    <HStack space={16}>
      <Caption>Caption</Caption>
      <Caption color={theme["textBody-tertiary"]}>Caption</Caption>
      <Caption color={theme["interactiveElem-default"]}>Caption</Caption>
    </HStack>
  );
};

const ChipRow = () => {
  const theme = useIOTheme();

  return (
    <HStack space={16}>
      <Chip>Chip</Chip>
      <Chip color={theme["textBody-tertiary"]}>Chip</Chip>
      <Chip color={theme["interactiveElem-default"]}>Chip</Chip>
    </HStack>
  );
};

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
    <Body weight="Semibold">Body Semibold</Body>
    <Body weight="Bold">Body Bold</Body>
    <Body asLink onPress={linkOnPress}>
      Body asLink
    </Body>
    <BodyMonospace>BodyMonoSpace</BodyMonospace>
  </VStack>
);

export const LabelSmallRow = () => {
  const theme = useIOTheme();
  return (
    <>
      <HStack space={typographicStyleMargin}>
        <LabelSmall>Label small</LabelSmall>
        <LabelSmall color={"red"}>Label small</LabelSmall>
        <View
          style={{ backgroundColor: IOColors[theme["appBackground-accent"]] }}
        >
          <LabelSmall color={"white"}>Label small</LabelSmall>
        </View>
        <LabelSmall asLink onPress={linkOnPress}>
          Label small asLink
        </LabelSmall>
      </HStack>
      <HStack space={typographicStyleMargin}>
        <LabelSmall weight="Semibold">Label small SB</LabelSmall>
        <LabelSmall weight="Semibold" color={"red"}>
          Label small SB
        </LabelSmall>
        <View
          style={{ backgroundColor: IOColors[theme["appBackground-accent"]] }}
        >
          <LabelSmall weight="Semibold" color={"white"}>
            Label small SB
          </LabelSmall>
        </View>
        <LabelSmall asLink onPress={linkOnPress} weight="Semibold">
          Label small SB asLink
        </LabelSmall>
      </HStack>
      <HStack space={typographicStyleMargin}>
        <LabelSmall weight="Regular">Label small Regular</LabelSmall>
        <LabelSmall weight="Regular" color={"red"}>
          Label small Regular
        </LabelSmall>
        <View
          style={{ backgroundColor: IOColors[theme["appBackground-accent"]] }}
        >
          <LabelSmall weight="Regular" color={"white"}>
            Label small Regular
          </LabelSmall>
        </View>
        <LabelSmall asLink onPress={linkOnPress} weight="Regular">
          Label small Regular asLink
        </LabelSmall>
      </HStack>
    </>
  );
};

export const LabelMiniRow = () => {
  const theme = useIOTheme();

  return (
    <>
      <HStack space={typographicStyleMargin}>
        <LabelMini>Label mini</LabelMini>
        <LabelMini color={"red"}>Label mini</LabelMini>
        <View
          style={{ backgroundColor: IOColors[theme["appBackground-accent"]] }}
        >
          <LabelMini color={"white"}>Label mini</LabelMini>
        </View>
      </HStack>
      <HStack space={typographicStyleMargin}>
        <LabelMini weight="Semibold">Label mini SB</LabelMini>
        <LabelMini weight="Semibold" color={"red"}>
          Label mini SB
        </LabelMini>
        <View
          style={{ backgroundColor: IOColors[theme["appBackground-accent"]] }}
        >
          <LabelMini weight="Semibold" color={"white"}>
            Label mini SB
          </LabelMini>
        </View>
      </HStack>
      <HStack space={typographicStyleMargin}>
        <LabelMini weight="Regular">Label mini Regular</LabelMini>
        <LabelMini weight="Regular" color={"red"}>
          Label mini Regular
        </LabelMini>
        <View
          style={{ backgroundColor: IOColors[theme["appBackground-accent"]] }}
        >
          <LabelMini weight="Regular" color={"white"}>
            Label mini Regular
          </LabelMini>
        </View>
      </HStack>
    </>
  );
};

export const LabelSmallAltRow = () => {
  const theme = useIOTheme();

  return (
    <HStack space={typographicStyleMargin}>
      <LabelSmallAlt>Label small alt</LabelSmallAlt>
      <View
        style={{ backgroundColor: IOColors[theme["appBackground-accent"]] }}
      >
        <LabelSmallAlt color={"white"}>Label small alt</LabelSmallAlt>
      </View>
    </HStack>
  );
};

export const LabelRow = () => {
  const theme = useIOTheme();

  return (
    <HStack space={typographicStyleMargin}>
      <Label>Label</Label>
      <View
        style={{ backgroundColor: IOColors[theme["appBackground-accent"]] }}
      >
        <Label color={"white"}>Label</Label>
      </View>
      <Label asLink onPress={linkOnPress}>
        Label asLink
      </Label>
      <Label weight="Regular" asLink onPress={linkOnPress}>
        Label Regular asLink
      </Label>
    </HStack>
  );
};

export const MdH1Row = () => (
  <VStack space={8}>
    <MdH1>{getTitle("Markdown H1")}</MdH1>
    <MdH1>{getLongerTitle("Markdown H1")}</MdH1>
  </VStack>
);

export const MdH2Row = () => (
  <VStack space={4}>
    <MdH2>{getTitle("Markdown H2")}</MdH2>
    <MdH2>{getLongerTitle("Markdown H2")}</MdH2>
  </VStack>
);

export const MdH3Row = () => (
  <VStack space={4}>
    <MdH3>{getTitle("Markdown H3")}</MdH3>
    <MdH3>{getLongerTitle("Markdown H3")}</MdH3>
  </VStack>
);
