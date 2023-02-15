import * as React from "react";
import { Text, View, ColorValue, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { H2 } from "../../../components/core/typography/H2";
import { H5 } from "../../../components/core/typography/H5";
import { LabelSmall } from "../../../components/core/typography/LabelSmall";
import {
  IOColorsLegacy,
  IOColors,
  IOColorGradients,
  hexToRgba,
  IOColorsNeutral,
  IOColorsTints,
  IOColorsStatus,
  IOColorsExtra
} from "../../../components/core/variables/IOColors";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const colorItemGutter = 16;
const sectionTitleMargin = 16;
const colorItemBorder = hexToRgba(IOColors.black, 0.1);
const colorPillBg = hexToRgba(IOColors.black, 0.2);

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
    justifyContent: "flex-start",
    marginBottom: 16
  },
  gradientWrapper: {
    width: "50%",
    justifyContent: "flex-start",
    marginBottom: 16,
    paddingHorizontal: colorItemGutter / 2
  },
  colorItem: {
    width: "100%",
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

const renderColorGroup = (
  name: string,
  colorObject: Record<string, ColorValue>
) => (
  <View style={{ marginBottom: 40 }}>
    {name && (
      <H2
        color={"bluegrey"}
        weight={"SemiBold"}
        style={{ marginBottom: sectionTitleMargin }}
      >
        {name}
      </H2>
    )}

    {Object.entries(colorObject).map(([name, colorValue]) => (
      <ColorBox key={name} name={name} color={colorValue} />
    ))}
  </View>
);

export const DSColors = () => (
  <DesignSystemScreen title={"Colors"}>
    {/* Neutrals */}
    {renderColorGroup("Neutrals", IOColorsNeutral)}
    {/* Tints */}
    {renderColorGroup("Main tints", IOColorsTints)}
    {/* Status */}
    {renderColorGroup("Status", IOColorsStatus)}
    {/* Extra */}
    {renderColorGroup("Extra", IOColorsExtra)}

    {/* Gradients */}
    <H2
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginBottom: sectionTitleMargin }}
    >
      Gradients
    </H2>
    <View style={styles.itemsWrapper}>
      {Object.entries(IOColorGradients).map(([name, colorValues]) => (
        <GradientBox key={name} name={name} colors={colorValues} />
      ))}
    </View>

    <VSpacer size={40} />

    {/* Legacy */}
    <View style={{ marginBottom: sectionTitleMargin }}>
      <H2 color={"bluegrey"} weight={"SemiBold"}>
        Legacy palette (†2023)
      </H2>
      <LabelSmall weight={"Regular"} color="bluegrey">
        Not moved to the &ldquo;Legacy&rdquo; category yet, because it&apos;s
        currently used everywhere
      </LabelSmall>
    </View>
    {Object.entries(IOColorsLegacy).map(([name, colorValue]) => (
      <ColorBox key={name} name={name} color={colorValue} />
    ))}
    <VSpacer size={40} />
  </DesignSystemScreen>
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
      <LabelSmall color={"bluegrey"} weight={"Regular"}>
        {props.name}
      </LabelSmall>
    )}
  </View>
);

const GradientBox = (props: GradientBoxProps) => {
  const [first, last] = props.colors;
  return (
    <View style={styles.gradientWrapper}>
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
