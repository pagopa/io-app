import {
  Body,
  BodyMonospace,
  ButtonText,
  Caption,
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
  LabelMini,
  BodySmall,
  MdH1,
  MdH2,
  MdH3,
  VSpacer,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
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
      <BodyRow />
      <VStack space={typographicStyleMargin}>
        <BodySmallRow />
        <LabelMiniRow />
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
    <HStack space={16} style={{ flexWrap: "wrap" }}>
      <H3>Header H3</H3>
      <H3 color={theme["interactiveElem-default"]}>Header H3</H3>
      <View
        style={{ backgroundColor: IOColors[theme["appBackground-accent"]] }}
      >
        <H3 color={"white"}>Header H3</H3>
      </View>
      <H3 color={theme["interactiveElem-default"]}>Header H3 Bold</H3>
    </HStack>
  );
};

const H4Row = () => {
  const theme = useIOTheme();

  return (
    <HStack space={16} style={{ flexWrap: "wrap" }}>
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
    <HStack space={16} style={{ flexWrap: "wrap" }}>
      <H5>Header H5</H5>
      <H5 color={theme["textHeading-tertiary"]}>Header H5</H5>
      <H5 color={theme["interactiveElem-default"]}>Header H5</H5>
    </HStack>
  );
};

const H6Row = () => {
  const theme = useIOTheme();

  return (
    <HStack space={16} style={{ flexWrap: "wrap" }}>
      <H6>Header H6</H6>
      <H6 color={theme["textHeading-tertiary"]}>Header H6</H6>
      <H6 color={theme["interactiveElem-default"]}>Header H6</H6>
    </HStack>
  );
};

const ButtonTextRow = () => {
  const theme = useIOTheme();

  return (
    <HStack space={16} style={{ flexWrap: "wrap" }}>
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
    <HStack space={16} style={{ flexWrap: "wrap" }}>
      <Caption>Caption</Caption>
      <Caption color={theme["textBody-tertiary"]}>Caption</Caption>
      <Caption color={theme["interactiveElem-default"]}>Caption</Caption>
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
    <Body asLink onPress={linkOnPress}>
      Body asLink
    </Body>
    <BodyMonospace>BodyMonoSpace</BodyMonospace>
  </VStack>
);

export const BodySmallRow = () => {
  const theme = useIOTheme();
  return (
    <>
      <HStack space={typographicStyleMargin} style={{ flexWrap: "wrap" }}>
        <BodySmall>Body small</BodySmall>
        <BodySmall color={theme.errorText}>Body small</BodySmall>
        <View
          style={{ backgroundColor: IOColors[theme["appBackground-accent"]] }}
        >
          <BodySmall color={"white"}>Body small</BodySmall>
        </View>
        <BodySmall asLink onPress={linkOnPress}>
          Body small asLink
        </BodySmall>
      </HStack>
      <HStack space={typographicStyleMargin} style={{ flexWrap: "wrap" }}>
        <BodySmall weight="Semibold">Body small SB</BodySmall>
        <BodySmall weight="Semibold" color={theme.errorText}>
          Body small SB
        </BodySmall>
        <View
          style={{ backgroundColor: IOColors[theme["appBackground-accent"]] }}
        >
          <BodySmall weight="Semibold" color={"white"}>
            Body small SB
          </BodySmall>
        </View>
        <BodySmall asLink onPress={linkOnPress} weight="Semibold">
          Body small SB asLink
        </BodySmall>
      </HStack>
      <HStack space={typographicStyleMargin} style={{ flexWrap: "wrap" }}>
        <BodySmall weight="Regular">Body small Regular</BodySmall>
        <BodySmall weight="Regular" color={theme.errorText}>
          Body small Regular
        </BodySmall>
        <View
          style={{ backgroundColor: IOColors[theme["appBackground-accent"]] }}
        >
          <BodySmall weight="Regular" color={"white"}>
            Body small Regular
          </BodySmall>
        </View>
        <BodySmall asLink onPress={linkOnPress} weight="Regular">
          Body small Regular asLink
        </BodySmall>
      </HStack>
    </>
  );
};

export const LabelMiniRow = () => {
  const theme = useIOTheme();

  return (
    <>
      <HStack space={typographicStyleMargin} style={{ flexWrap: "wrap" }}>
        <LabelMini>Label mini</LabelMini>
        <LabelMini color={theme.errorText}>Label mini</LabelMini>
        <View
          style={{ backgroundColor: IOColors[theme["appBackground-accent"]] }}
        >
          <LabelMini color={"white"}>Label mini</LabelMini>
        </View>
      </HStack>
      <HStack space={typographicStyleMargin}>
        <LabelMini weight="Semibold">Label mini SB</LabelMini>
        <LabelMini weight="Semibold" color={theme.errorText}>
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
      <HStack space={typographicStyleMargin} style={{ flexWrap: "wrap" }}>
        <LabelMini weight="Regular">Label mini Regular</LabelMini>
        <LabelMini weight="Regular" color={theme.errorText}>
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
