import * as React from "react";
import { Alert, StyleSheet, View } from "react-native";
import { HSpacer, VSpacer } from "../../../components/core/spacer/Spacer";
import { Body } from "../../../components/core/typography/Body";
import { H1 } from "../../../components/core/typography/H1";
import { H2 } from "../../../components/core/typography/H2";
import { H3 } from "../../../components/core/typography/H3";
import { H4 } from "../../../components/core/typography/H4";
import { H5 } from "../../../components/core/typography/H5";
import { Label } from "../../../components/core/typography/Label";
import { LabelSmall } from "../../../components/core/typography/LabelSmall";
import { Link } from "../../../components/core/typography/Link";
import { Monospace } from "../../../components/core/typography/Monospace";
import { IOColors } from "../../../components/core/variables/IOColors";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { IOStyles } from "../../../components/core/variables/IOStyles";

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

export const DSTypography = () => (
  <DesignSystemScreen title={"Typography"}>
    <H2
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginBottom: sectionTitleMargin }}
    >
      Font family
    </H2>
    {/* <FontFamilyShowroom /> */}
    {/*  <DarkBackgroundTypographicScale /> */}
    <H1Row />
    <H2Row />
    <H3Row />
    <H4Row />
    <H5Row />
    <Body>Body</Body>
    <LabelSmallRow />
    <LabelRow />
    <Link onPress={() => Alert.alert("onPress link!")}>Link</Link>
    <Monospace>MonoSpace</Monospace>
    <VSpacer size={40} />
    <H2
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginBottom: sectionTitleMargin }}
    >
      NativeBase
    </H2>
    <Body>This is a Body text</Body>
    <VSpacer size={16} />
    <Body weight="SemiBold">This is a Body SemiBold text</Body>
    <VSpacer size={16} />
    <View style={IOStyles.alignCenter}>
      <Body weight="SemiBold">This is a centered text</Body>
      <Body weight="SemiBold">Another centered text</Body>
    </View>
    <VSpacer size={40} />
  </DesignSystemScreen>
);

const getTitle = (element: string) => `Heading ${element}`;
const getLongerTitle = (element: string) =>
  `Very loooong looong title set with Heading ${element}`;

export const DarkBackgroundTypographicScale = () => (
  <View style={{ backgroundColor: IOColors.bluegrey }}>
    <H1 color={"white"}>Header H1</H1>
    <HSpacer size={16} />
  </View>
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
      <H2 style={styles.distancedTitle} weight={"SemiBold"}>
        {getTitle("H2 Semibold")}
      </H2>
    </View>
    <VSpacer size={40} />
  </>
);

export const H3Row = () => (
  <>
    <View style={styles.row}>
      <H3>Header H3 SB</H3>
      <HSpacer size={16} />
      <H3 color={"bluegreyLight"}>Header H3 SB</H3>
      <HSpacer size={16} />
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <H3 color={"white"}>Header H3 SB</H3>
      </View>
    </View>
    <VSpacer size={16} />
    <View style={styles.row}>
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <H3 color={"white"} weight={"Bold"}>
          Header H3 Bold
        </H3>
      </View>
    </View>
    <VSpacer size={40} />
  </>
);

export const H4Row = () => (
  <>
    <View style={styles.row}>
      {/* Bold */}
      <H4>Header H4 Bold</H4>
      <HSpacer size={16} />
      <H4 color={"blue"}>Header H4 Bold</H4>
      <HSpacer size={16} />
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <H4 color={"white"}>Header H4 Bold</H4>
      </View>
    </View>
    <VSpacer size={16} />
    <View style={styles.row}>
      {/* SemiBold */}
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <H4 color={"white"} weight={"SemiBold"}>
          Header H4 SemiBold
        </H4>
      </View>
    </View>
    <VSpacer size={16} />
    <View style={styles.row}>
      {/* Regular */}
      <H4 weight={"Regular"} color={"bluegreyDark"}>
        Header H4
      </H4>
      <HSpacer size={16} />
      <H4 weight={"Regular"} color={"bluegrey"}>
        Header H4
      </H4>
      <HSpacer size={16} />
      <H4 weight={"Regular"} color={"bluegreyLight"}>
        Header H4
      </H4>
      <HSpacer size={16} />
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <H4 weight={"Regular"} color={"white"}>
          Header H4
        </H4>
      </View>
    </View>
    <VSpacer size={40} />
  </>
);

export const H5Row = () => (
  <>
    <View style={styles.row}>
      <H5>Header H5 SB</H5>
      <HSpacer size={16} />
      <H5 color={"bluegrey"}>Header H5 SB</H5>
      <HSpacer size={16} />
      <H5 color={"blue"}>Header H5 SB</H5>
      <HSpacer size={16} />
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <H5 color={"white"}>Header H5 SB</H5>
      </View>
    </View>
    <VSpacer size={16} />
    <View style={styles.row}>
      <H5 weight={"Regular"}>Header H5</H5>
      <HSpacer size={16} />
      <H5 weight={"Regular"} color={"bluegrey"}>
        Header H5
      </H5>
      <HSpacer size={16} />
      <H5 weight={"Regular"} color={"blue"}>
        Header H5
      </H5>
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
      <Label color={"bluegrey"}>Label</Label>
      <HSpacer size={16} />
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <Label color={"white"}>Label</Label>
      </View>
    </View>
    <VSpacer size={40} />
  </>
);
