import { View } from "native-base";
import * as React from "react";
import { ColorValue, StyleSheet } from "react-native";
import { IOColor } from "../../components/core/variables/IOColor";

const styles = StyleSheet.create({
  body: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap"
  },
  colorBox: {
    height: 50,
    width: "50%",
    padding: 2
  }
});

export const ColorsSection = () => {
  return (
    <View style={styles.body}>
      {Object.entries(IOColor).map(colorEntry => (
        <ColorBox
          key={colorEntry[0]}
          name={colorEntry[0]}
          color={colorEntry[1]}
        />
      ))}
    </View>
  );
};

type ColorBoxProps = {
  name: string;
  color: ColorValue;
};

const ColorBox = (props: ColorBoxProps) => {
  return (
    <View style={styles.colorBox}>
      <View
        style={{
          backgroundColor: props.color,
          height: "100%",
          width: "100%"
        }}
      />
    </View>
  );
};
