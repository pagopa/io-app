import * as React from "react";
import { Alert, StyleSheet, View } from "react-native";
import {
  Body,
  ButtonText,
  Caption,
  Chip,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Hero,
  IOColors,
  Label,
  LabelSmall,
  LabelLink,
  BodyMonospace,
  HSpacer,
  VSpacer,
  useIOTheme,
  Divider
} from "@pagopa/io-app-design-system";
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

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  distancedTitle: {
    marginTop: 12
  }
});

const sectionTitleMargin = 16;

export const DSTypography = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Typography"}>
      <LegacyH2
        color={theme["textHeading-default"]}
        weight={"SemiBold"}
        style={{ marginBottom: sectionTitleMargin }}
      >
        New typographic scale
      </LegacyH2>

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

      <LegacyBody>Body</LegacyBody>
      <LegacyBody>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam a felis
        congue, congue leo sit amet, semper ex. Nulla consectetur non quam vel
        porttitor. Vivamus ac ex non nunc pellentesque molestie. Aliquam id
        lorem aliquam, aliquam massa eget, commodo erat. Maecenas finibus dui
        massa, eget pharetra mauris posuere semper.
      </LegacyBody>
      <VSpacer size={40} />
      <BodyMonospace>BodyMonoSpace</BodyMonospace>
      <VSpacer size={40} />

      <LabelSmallRow />
      <LabelRow />
      <LabelLink onPress={() => Alert.alert("onPress LabelLink!")}>
        LabelLink
      </LabelLink>

      <VSpacer size={40} />
      <Divider />
      <VSpacer size={40} />

      <LegacyH2
        color={theme["textHeading-default"]}
        weight={"SemiBold"}
        style={{ marginBottom: sectionTitleMargin }}
      >
        Legacy typographic scale
      </LegacyH2>
      {/* <FontFamilyShowroom /> */}
      {/*  <DarkBackgroundTypographicScale /> */}
      <LegacyH1Row />
      <LegacyH2Row />
      <LegacyH3Row />
      <LegacyH4Row />
      <LegacyH5Row />
      <Body>Body</Body>
      <LegacyLabelSmallRow />
      <LegacyLabelRow />
      <LegacyLink onPress={() => Alert.alert("onPress link!")}>Link</LegacyLink>
      <LegacyMonospace>MonoSpace</LegacyMonospace>
      <VSpacer size={40} />
    </DesignSystemScreen>
  );
};

const getTitle = (element: string) => `Heading ${element}`;
const getLongerTitle = (element: string) =>
  `Very loooong looong title set with Heading ${element}`;

export const DarkBackgroundTypographicScale = () => (
  <View style={{ backgroundColor: IOColors.bluegrey }}>
    <H1 color={"white"}>Header H1</H1>
    <HSpacer size={16} />
  </View>
);

export const LegacyH1Row = () => (
  <>
    <View>
      <LegacyH1>{getTitle("H1")}</LegacyH1>
      <LegacyH1 style={styles.distancedTitle}>{getLongerTitle("H1")}</LegacyH1>
    </View>
    <VSpacer size={40} />
  </>
);

export const LegacyH2Row = () => (
  <>
    <View>
      <LegacyH2>{getTitle("H2")}</LegacyH2>
      <LegacyH2 style={styles.distancedTitle}>{getLongerTitle("H2")}</LegacyH2>
      <LegacyH2 style={styles.distancedTitle} weight={"SemiBold"}>
        {getTitle("H2 Semibold")}
      </LegacyH2>
    </View>
    <VSpacer size={40} />
  </>
);

export const LegacyH3Row = () => (
  <>
    <View style={styles.row}>
      <LegacyH3>Header H3 SB</LegacyH3>
      <HSpacer size={16} />
      <LegacyH3 color={"bluegreyLight"}>Header H3 SB</LegacyH3>
      <HSpacer size={16} />
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <LegacyH3 color={"white"}>Header H3 SB</LegacyH3>
      </View>
    </View>
    <VSpacer size={16} />
    <View style={styles.row}>
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <LegacyH3 color={"white"} weight={"Bold"}>
          Header H3 Bold
        </LegacyH3>
      </View>
    </View>
    <VSpacer size={40} />
  </>
);

export const LegacyH4Row = () => (
  <>
    <View style={styles.row}>
      {/* Bold */}
      <LegacyH4>Header H4 Bold</LegacyH4>
      <HSpacer size={16} />
      <LegacyH4 color={"blue"}>Header H4 Bold</LegacyH4>
      <HSpacer size={16} />
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <LegacyH4 color={"white"}>Header H4 Bold</LegacyH4>
      </View>
    </View>
    <VSpacer size={16} />
    <View style={styles.row}>
      {/* SemiBold */}
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <LegacyH4 color={"white"} weight={"SemiBold"}>
          Header H4 SemiBold
        </LegacyH4>
      </View>
    </View>
    <VSpacer size={16} />
    <View style={styles.row}>
      {/* Regular */}
      <LegacyH4 weight={"Regular"} color={"bluegreyDark"}>
        Header H4
      </LegacyH4>
      <HSpacer size={16} />
      <LegacyH4 weight={"Regular"} color={"bluegrey"}>
        Header H4
      </LegacyH4>
      <HSpacer size={16} />
      <LegacyH4 weight={"Regular"} color={"bluegreyLight"}>
        Header H4
      </LegacyH4>
      <HSpacer size={16} />
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <LegacyH4 weight={"Regular"} color={"white"}>
          Header H4
        </LegacyH4>
      </View>
    </View>
    <VSpacer size={40} />
  </>
);

export const LegacyH5Row = () => (
  <>
    <View style={styles.row}>
      <LegacyH5>Header H5 SB</LegacyH5>
      <HSpacer size={16} />
      <LegacyH5 color={"bluegrey"}>Header H5 SB</LegacyH5>
      <HSpacer size={16} />
      <LegacyH5 color={"blue"}>Header H5 SB</LegacyH5>
      <HSpacer size={16} />
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <LegacyH5 color={"white"}>Header H5 SB</LegacyH5>
      </View>
    </View>
    <VSpacer size={16} />
    <View style={styles.row}>
      <LegacyH5 weight={"Regular"}>Header H5</LegacyH5>
      <HSpacer size={16} />
      <LegacyH5 weight={"Regular"} color={"bluegrey"}>
        Header H5
      </LegacyH5>
      <HSpacer size={16} />
      <LegacyH5 weight={"Regular"} color={"blue"}>
        Header H5
      </LegacyH5>
    </View>
    <VSpacer size={40} />
  </>
);

export const LegacyLabelSmallRow = () => (
  <>
    <View style={styles.row}>
      <LegacyLabelSmall>Label small</LegacyLabelSmall>
      <HSpacer size={16} />
      <LegacyLabelSmall color={"bluegrey"}>Label small</LegacyLabelSmall>
      <HSpacer size={16} />
      <LegacyLabelSmall color={"red"}>Label small</LegacyLabelSmall>
      <HSpacer size={16} />
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <LegacyLabelSmall color={"white"}>Label small</LegacyLabelSmall>
      </View>
    </View>
    <VSpacer size={40} />
  </>
);

export const LegacyLabelRow = () => (
  <>
    <View style={styles.row}>
      <LegacyLabel>Label</LegacyLabel>
      <HSpacer size={16} />
      <LegacyLabel color={"bluegrey"}>Label</LegacyLabel>
      <HSpacer size={16} />
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <LegacyLabel color={"white"}>Label</LegacyLabel>
      </View>
    </View>
    <VSpacer size={40} />
  </>
);

export const HeroRow = () => (
  <>
    <View>
      <Hero>{getTitle("Hero")}</Hero>
      <Hero>{getLongerTitle("Hero")}</Hero>
    </View>
    <VSpacer size={40} />
  </>
);

export const H1Row = () => (
  <>
    <View>
      <H1>{getTitle("H1")}</H1>
      <H1 style={styles.distancedTitle}>{getLongerTitle("H1")}</H1>
    </View>
    <VSpacer size={40} />
  </>
);

export const H2Row = () => (
  <>
    <View>
      <H2>{getTitle("H2")}</H2>
      <H2 style={styles.distancedTitle}>{getLongerTitle("H2")}</H2>
    </View>
    <VSpacer size={40} />
  </>
);

export const H3Row = () => (
  <>
    <View style={styles.row}>
      <H3>Header H3</H3>
      <HSpacer size={16} />
      <H3 color="grey-650">Header H3</H3>
      <HSpacer size={16} />
      <View style={{ backgroundColor: IOColors["grey-700"] }}>
        <H3 color={"white"}>Header H3</H3>
      </View>
    </View>
    <VSpacer size={40} />
  </>
);

export const H4Row = () => (
  <>
    <View style={styles.row}>
      {/* Bold */}
      <H4>Header H4</H4>
      <HSpacer size={16} />
      <H4 color="blueIO-500">Header H4</H4>
      <HSpacer size={16} />
      <View style={{ backgroundColor: IOColors["grey-700"] }}>
        <H4 color={"white"}>Header H4</H4>
      </View>
    </View>
    <VSpacer size={40} />
  </>
);

export const H5Row = () => (
  <>
    <View style={styles.row}>
      <H5>Header H5</H5>
      <HSpacer size={16} />
      <H5 color="grey-650">Header H5</H5>
      <HSpacer size={16} />
      <H5 color={"blueIO-500"}>Header H5</H5>
    </View>
    <VSpacer size={40} />
  </>
);

export const H6Row = () => (
  <>
    <View style={styles.row}>
      <H6>Header H6</H6>
      <HSpacer size={16} />
      <H6 color="grey-650">Header H6</H6>
      <HSpacer size={16} />
      <H6 color={"blueIO-500"}>Header H6</H6>
    </View>
    <VSpacer size={40} />
  </>
);

export const ButtonTextRow = () => (
  <>
    <View style={styles.row}>
      <View style={{ backgroundColor: IOColors["grey-700"] }}>
        <ButtonText>ButtonText</ButtonText>
      </View>
      <HSpacer size={16} />
      <ButtonText color="grey-700">ButtonText</ButtonText>
      <HSpacer size={16} />
      <ButtonText color="blueIO-500">ButtonText</ButtonText>
    </View>
    <VSpacer size={40} />
  </>
);

export const CaptionRow = () => (
  <>
    <View style={styles.row}>
      <Caption>Caption</Caption>
      <HSpacer size={16} />
      <Caption color="grey-650">Caption</Caption>
      <HSpacer size={16} />
      <Caption color={"blueIO-500"}>Caption</Caption>
    </View>
    <VSpacer size={40} />
  </>
);

export const ChipRow = () => (
  <>
    <View style={styles.row}>
      <Chip>Chip</Chip>
      <HSpacer size={16} />
      <Chip color="grey-650">Chip</Chip>
      <HSpacer size={16} />
      <Chip color={"blueIO-500"}>Chip</Chip>
    </View>
    <VSpacer size={40} />
  </>
);

export const LabelSmallRow = () => (
  <>
    <View style={styles.row}>
      <LabelSmall>Label small</LabelSmall>
      <HSpacer size={16} />
      <LabelSmall color={"bluegrey"}>Label small</LabelSmall>
      <HSpacer size={16} />
      <LabelSmall color={"red"}>Label small</LabelSmall>
      <HSpacer size={16} />
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <LabelSmall color={"white"}>Label small</LabelSmall>
      </View>
    </View>
    <VSpacer size={40} />
  </>
);

export const LabelRow = () => (
  <>
    <View style={styles.row}>
      <Label>Label</Label>
      <HSpacer size={16} />
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <Label color={"white"}>Label</Label>
      </View>
    </View>
    <VSpacer size={40} />
  </>
);
