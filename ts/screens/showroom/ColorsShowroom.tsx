import { View } from "native-base";
import * as React from "react";
import { ColorValue, StyleSheet } from "react-native";
import { H5 } from "../../components/core/typography/H5";
import { IOColors } from "../../components/core/variables/IOColors";
import { ShowroomSection } from "./ShowroomSection";

const styles = StyleSheet.create({
  alignCenter: {
    alignItems: "center"
  },
  content: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap"
  },
  colorBox: {
    height: 60,
    width: "50%",
    padding: 2
  }
});

export const ColorsShowroom = () => (
    <ShowroomSection title={"Color palette"}>
      <View style={styles.content}>
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
    <View style={[styles.colorBox, styles.alignCenter]}>
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
