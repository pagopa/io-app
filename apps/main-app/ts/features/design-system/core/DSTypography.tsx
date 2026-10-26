import {
  Body,
  BodyMonospace,
  BodySmall,
  ButtonText,
  Caption,
  Divider,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Hero,
  HStack,
  LabelMini,
  MdH1,
  MdH2,
  MdH3,
  useIOColors,
  VSpacer,
  VStack
} from "@io-app/design-system";
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
  const colors = useIOColors();

  return (
    <HStack space={16} style={{ flexWrap: "wrap" }}>
      <H3>Header H3</H3>
      <H3 color={colors.text.content.action}>Header H3</H3>
      <View
        style={{
          backgroundColor: colors.background.accent
        }}
      >
        <H3 color={colors.foreground.onAccent.default}>Header H3</H3>
      </View>
      <H3 color={colors.text.content.action}>Header H3 Bold</H3>
    </HStack>
  );
};

const H4Row = () => {
  const colors = useIOColors();

  return (
    <HStack space={16} style={{ flexWrap: "wrap" }}>
      <H4>Header H4</H4>
      <H4 color={colors.text.content.action}>Header H4</H4>
      <View
        style={{
          backgroundColor: colors.background.accent
        }}
      >
        <H4 color={colors.foreground.onAccent.default}>Header H4</H4>
      </View>
    </HStack>
  );
};

const H5Row = () => {
  const colors = useIOColors();

  return (
    <HStack space={16} style={{ flexWrap: "wrap" }}>
      <H5>Header H5</H5>
      <H5 color={colors.text.heading.tertiary}>Header H5</H5>
      <H5 color={colors.text.content.action}>Header H5</H5>
    </HStack>
  );
};

const H6Row = () => {
  const colors = useIOColors();

  return (
    <HStack space={16} style={{ flexWrap: "wrap" }}>
      <H6>Header H6</H6>
      <H6 color={colors.text.heading.tertiary}>Header H6</H6>
      <H6 color={colors.text.content.action}>Header H6</H6>
    </HStack>
  );
};

const ButtonTextRow = () => {
  const colors = useIOColors();

  return (
    <HStack space={16} style={{ flexWrap: "wrap" }}>
      <ButtonText color={colors.text.content.tertiary}>ButtonText</ButtonText>
      <ButtonText color={colors.text.content.action}>ButtonText</ButtonText>
      <View
        style={{
          backgroundColor: colors.background.accent
        }}
      >
        <ButtonText color={colors.foreground.onAccent.default}>
          ButtonText
        </ButtonText>
      </View>
    </HStack>
  );
};

const CaptionRow = () => {
  const colors = useIOColors();

  return (
    <HStack space={16} style={{ flexWrap: "wrap" }}>
      <Caption>Caption</Caption>
      <Caption color={colors.text.content.tertiary}>Caption</Caption>
      <Caption color={colors.text.content.action}>Caption</Caption>
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
  const colors = useIOColors();
  return (
    <>
      <HStack space={typographicStyleMargin} style={{ flexWrap: "wrap" }}>
        <BodySmall>Body small</BodySmall>
        <BodySmall color={colors.foreground.error}>Body small</BodySmall>
        <View
          style={{
            backgroundColor: colors.background.accent
          }}
        >
          <BodySmall color={colors.foreground.onAccent.default}>
            Body small
          </BodySmall>
        </View>
        <BodySmall asLink onPress={linkOnPress}>
          Body small asLink
        </BodySmall>
      </HStack>
      <HStack space={typographicStyleMargin} style={{ flexWrap: "wrap" }}>
        <BodySmall weight="Semibold">Body small SB</BodySmall>
        <BodySmall color={colors.foreground.error} weight="Semibold">
          Body small SB
        </BodySmall>
        <View
          style={{
            backgroundColor: colors.background.accent
          }}
        >
          <BodySmall
            color={colors.foreground.onAccent.default}
            weight="Semibold"
          >
            Body small SB
          </BodySmall>
        </View>
        <BodySmall asLink onPress={linkOnPress} weight="Semibold">
          Body small SB asLink
        </BodySmall>
      </HStack>
      <HStack space={typographicStyleMargin} style={{ flexWrap: "wrap" }}>
        <BodySmall weight="Regular">Body small Regular</BodySmall>
        <BodySmall color={colors.foreground.error} weight="Regular">
          Body small Regular
        </BodySmall>
        <View
          style={{
            backgroundColor: colors.background.accent
          }}
        >
          <BodySmall
            color={colors.foreground.onAccent.default}
            weight="Regular"
          >
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
  const colors = useIOColors();

  return (
    <>
      <HStack space={typographicStyleMargin} style={{ flexWrap: "wrap" }}>
        <LabelMini>Label mini</LabelMini>
        <LabelMini color={colors.foreground.error}>Label mini</LabelMini>
        <View
          style={{
            backgroundColor: colors.background.accent
          }}
        >
          <LabelMini color={colors.foreground.onAccent.default}>
            Label mini
          </LabelMini>
        </View>
      </HStack>
      <HStack space={typographicStyleMargin}>
        <LabelMini weight="Semibold">Label mini SB</LabelMini>
        <LabelMini color={colors.foreground.error} weight="Semibold">
          Label mini SB
        </LabelMini>
        <View
          style={{
            backgroundColor: colors.background.accent
          }}
        >
          <LabelMini
            color={colors.foreground.onAccent.default}
            weight="Semibold"
          >
            Label mini SB
          </LabelMini>
        </View>
      </HStack>
      <HStack space={typographicStyleMargin} style={{ flexWrap: "wrap" }}>
        <LabelMini weight="Regular">Label mini Regular</LabelMini>
        <LabelMini color={colors.foreground.error} weight="Regular">
          Label mini Regular
        </LabelMini>
        <View
          style={{
            backgroundColor: colors.background.accent
          }}
        >
          <LabelMini
            color={colors.foreground.onAccent.default}
            weight="Regular"
          >
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
