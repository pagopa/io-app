import * as React from "react";
import { Text, View, ColorValue, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { H2 } from "../../../components/core/typography/H2";
import { H5 } from "../../../components/core/typography/H5";
import {
  IOColors,
  IOColorGradients
} from "../../../components/core/variables/IOColors";
import { ShowroomSection } from "../ShowroomSection";

const colorItemGutter = 16;
const sectionTitleMargin = 16;
const colorItemBorder = "rgba(0, 0, 0, 0.1)";
const colorPillBg = "rgba(0, 0, 0, 0.3)";

const styles = StyleSheet.create({
  itemsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginLeft: (colorItemGutter / 2) * -1,
    marginRight: (colorItemGutter / 2) * -1,
    marginBottom: 16
  },
  colorWrapper: {
    width: "50%",
    justifyContent: "flex-start",
    marginBottom: 16,
    paddingHorizontal: colorItemGutter / 2
  },
  colorItem: {
    width: "100%",
    aspectRatio: 4 / 1,
    padding: 8,
    borderRadius: 4,
    alignItems: "flex-end",
    borderColor: colorItemBorder,
    borderWidth: 1
  },
  gradientItem: {
    aspectRatio: 2 / 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderColor: colorItemBorder,
    borderWidth: 1
  },
  colorPill: {
    overflow: "hidden",
    color: IOColors.white,
    fontSize: 9,
    backgroundColor: colorPillBg,
    padding: 4,
    borderRadius: 4
  }
});

export const ColorsShowroom = () => (
  <ShowroomSection title={"Color palette"}>
    <H2
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginBottom: sectionTitleMargin }}
    >
      Plain
    </H2>
    <View style={styles.itemsWrapper}>
      {Object.entries(IOColors).map(colorEntry => (
        <ColorBox
          key={colorEntry[0]}
          name={colorEntry[0]}
          color={colorEntry[1]}
        />
      ))}
    </View>
    <H2
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginBottom: sectionTitleMargin }}
    >
      Gradients
    </H2>
    <View style={styles.itemsWrapper}>
      {Object.entries(IOColorGradients).map(colorEntry => (
        <GradientBox
          key={colorEntry[0]}
          name={colorEntry[0]}
          colors={colorEntry[1]}
        />
      ))}
    </View>
  </ShowroomSection>
);

type ColorBoxProps = {
  name: string;
  color: ColorValue;
};

type GradientBoxProps = {
  name: string;
  colors: Array<string>;
};

const ColorBox = (props: ColorBoxProps) => (
  <View style={styles.colorWrapper}>
    <View
      style={{
        ...styles.colorItem,
        backgroundColor: props.color
      }}
    >
      {props.color && <Text style={styles.colorPill}>{props.color}</Text>}
    </View>
    {props.name && (
      <H5 color={"bluegrey"} weight={"Regular"}>
        {props.name}
      </H5>
    )}
  </View>
);

const GradientBox = (props: GradientBoxProps) => {
  const [first, last] = props.colors;
  return (
    <View style={styles.colorWrapper}>
      <LinearGradient
        colors={props.colors}
        useAngle={true}
        angle={180}
        style={styles.gradientItem}
      >
        {first && <Text style={styles.colorPill}>{first}</Text>}
        {last && <Text style={styles.colorPill}>{last}</Text>}
      </LinearGradient>
      {props.name && (
        <H5 color={"bluegrey"} weight={"Regular"}>
          {props.name}
        </H5>
      )}
    </View>
  );
};
