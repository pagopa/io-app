import { View } from "native-base";
import * as React from "react";
import { Alert, StyleSheet } from "react-native";
import { Body } from "../../components/core/typography/Body";
import { H1 } from "../../components/core/typography/H1";
import { H2 } from "../../components/core/typography/H2";
import { H3 } from "../../components/core/typography/H3";
import { H4 } from "../../components/core/typography/H4";
import { H5 } from "../../components/core/typography/H5";
import { Label } from "../../components/core/typography/Label";
import { LabelSmall } from "../../components/core/typography/LabelSmall";
import { Link } from "../../components/core/typography/Link";
import { Monospace } from "../../components/core/typography/Monospace";
import { IOColors } from "../../components/core/variables/IOColors";
import { ShowroomSection } from "./ShowroomSection";

const styles = StyleSheet.create({
  alignCenter: {
    alignItems: "center"
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap"
  }
});

export const TypographyShowroom = () => (
    <ShowroomSection title={"Typography"}>
      <H1Row />
      <H2Row />
      <H3Row />
      <H4Row />
      <H5Row />
      <Body>Body</Body>
      <View spacer={true} extralarge={true} />
      <LabelSmallRow />
      <LabelRow />
      <Link onPress={() => Alert.alert("onPress link!")}>Link</Link>
      <View spacer={true} extralarge={true} />
      <Monospace>MonoSpace</Monospace>
      <View spacer={true} extralarge={true} />
    </ShowroomSection>
  );

export const H1Row = () => (
  <>
    <View style={styles.row}>
      <H1>Header H1</H1>
      <View hspacer={true} />
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <H1 color={"white"}>Header h1</H1>
      </View>
    </View>
    <View spacer={true} extralarge={true} />
  </>
);

export const H2Row = () => (
  <>
    <View style={styles.row}>
      <H2>Header H2</H2>
      <View hspacer={true} />
    </View>
    <View spacer={true} extralarge={true} />
  </>
);

export const H3Row = () => (
  <>
    <View style={styles.row}>
      <H3>Header H3 SB</H3>
      <View hspacer={true} />
      <H3 color={"bluegreyLight"}>Header H3 SB</H3>
      <View hspacer={true} />
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <H3 color={"white"}>Header H3 SB</H3>
      </View>
    </View>
    <View spacer={true} />
    <View style={styles.row}>
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <H3 color={"white"} weight={"Bold"}>
          Header H3 Bold
        </H3>
      </View>
    </View>
    <View spacer={true} extralarge={true} />
  </>
);

export const H4Row = () => (
  <>
    <View style={styles.row}>
      {/* Bold */}
      <H4>Header H4 Bold</H4>
      <View hspacer={true} />
      <H4 color={"blue"}>Header H4 Bold</H4>
      <View hspacer={true} />
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <H4 color={"white"}>Header H4 Bold</H4>
      </View>
    </View>
    <View spacer={true} />
    <View style={styles.row}>
      {/* SemiBold */}
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <H4 color={"white"} weight={"SemiBold"}>
          Header H4 SemiBold
        </H4>
      </View>
    </View>
    <View spacer={true} />
    <View style={styles.row}>
      {/* Regular */}
      <H4 weight={"Regular"} color={"bluegreyDark"}>
        Header H4
      </H4>
      <View hspacer={true} />
      <H4 weight={"Regular"} color={"bluegrey"}>
        Header H4
      </H4>
      <View hspacer={true} />
      <H4 weight={"Regular"} color={"bluegreyLight"}>
        Header H4
      </H4>
      <View hspacer={true} />
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <H4 weight={"Regular"} color={"white"}>
          Header H4
        </H4>
      </View>
    </View>
    <View spacer={true} extralarge={true} />
  </>
);

export const H5Row = () => (
  <>
    <View style={styles.row}>
      <H5>Header H5 SB</H5>
      <View hspacer={true} />
      <H5 color={"bluegrey"}>Header H5 SB</H5>
      <View hspacer={true} />
      <H5 color={"blue"}>Header H5 SB</H5>
      <View hspacer={true} />
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <H5 color={"white"}>Header H5 SB</H5>
      </View>
    </View>
    <View spacer={true} />
    <View style={styles.row}>
      <H5 weight={"Regular"}>Header H5</H5>
      <View hspacer={true} />
      <H5 weight={"Regular"} color={"bluegrey"}>
        Header H5
      </H5>
      <View hspacer={true} />
      <H5 weight={"Regular"} color={"blue"}>
        Header H5
      </H5>
    </View>
    <View spacer={true} extralarge={true} />
  </>
);

export const LabelSmallRow = () => (
  <>
    <View style={styles.row}>
      <LabelSmall>Label small</LabelSmall>
      <View hspacer={true} />
      <LabelSmall color={"bluegrey"}>Label small</LabelSmall>
      <View hspacer={true} />
      <LabelSmall color={"red"}>Label small</LabelSmall>
      <View hspacer={true} />
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <LabelSmall color={"white"}>Label small</LabelSmall>
      </View>
    </View>
    <View spacer={true} extralarge={true} />
  </>
);

export const LabelRow = () => (
  <>
    <View style={styles.row}>
      <Label>Label</Label>
      <View hspacer={true} />
      <Label color={"bluegrey"}>Label</Label>
      <View hspacer={true} />
      <View style={{ backgroundColor: IOColors.bluegrey }}>
        <Label color={"white"}>Label</Label>
      </View>
    </View>
    <View spacer={true} extralarge={true} />
  </>
);
