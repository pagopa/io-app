import * as React from "react";
import { View, ColorValue, StyleSheet } from "react-native";
import { H5 } from "../../../components/core/typography/H5";
import { IOColors } from "../../../components/core/variables/IOColors";
import { ShowroomSection } from "../ShowroomSection";

const styles = StyleSheet.create({
  colorBoxWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginLeft: 8 * -1,
    marginRight: 8 * -1,
    marginBottom: 16
  },
  colorBoxItem: {
    width: "50%",
    justifyContent: "flex-start",
    marginBottom: 16,
    paddingHorizontal: 8
  }
});

export const ColorsShowroom = () => (
  <ShowroomSection title={"Color palette"}>
    <View style={styles.colorBoxWrapper}>
      {Object.entries(IOColors).map(colorEntry => (
        <ColorBox
          key={colorEntry[0]}
          name={colorEntry[0]}
          color={colorEntry[1]}
        />
      ))}
    </View>
  </ShowroomSection>
);

type ColorBoxProps = {
  name: string;
  color: ColorValue;
};

const ColorBox = (props: ColorBoxProps) => (
  <View style={styles.colorBoxItem}>
    <View
      style={{
        backgroundColor: props.color,
        width: "100%",
        height: 50
      }}
    />
    {props.name && (
      <H5 color={"bluegrey"} weight={"SemiBold"}>
        {props.name}
      </H5>
    )}
    {props.color && (
      <H5 color={"bluegrey"} weight={"Regular"}>
        {props.color}
      </H5>
    )}
  </View>
);
    <View
      style={{
        backgroundColor: props.color,
        height: "70%",
        width: "100%"
      }}
    />
    <H5 color={"bluegrey"} weight={"Regular"}>
      {props.name} {props.color}
    </H5>
  </View>
);
