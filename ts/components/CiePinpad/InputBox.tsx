import { Text, View } from "native-base";
import * as React from "react";
import { Dimensions, Platform, StyleSheet } from "react-native";
import variables from "../../theme/variables";

interface Props {
  color: string;
  num: string;
  inactiveColor: string;
  isSelected: boolean;
  wasSelected: boolean;
  isPopulated: boolean;
}

const width = Dimensions.get("window").width - variables.contentPaddingLarge;
const PIN_LENGTH: number = 8;
const DimensionForPin = width / PIN_LENGTH / 100;

const widthForPin = DimensionForPin * 90;

const marginForPin = (DimensionForPin * 100 - widthForPin) / 2;

const styles = StyleSheet.create({
  placeholder: {
    height: 50,
    marginLeft: marginForPin,
    marginRight: marginForPin,
    marginTop: 18,
    width: widthForPin,
    alignItems: "center",
    justifyContent: "center"
  },
  placeholderBullet: {
    borderRadius: 10,
    height: 10,
    width: 10
  },
  placeholderBar: {
    borderRadius: 0,
    height: 28,
    width: 2.6
  },
  containerPlaceholderBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff"
  },
  input: {
    fontSize: 25,
    lineHeight: Platform.OS === "ios" ? 0 : 35,
    fontWeight: "bold",
    borderWidth: 0,
    height: "100%",
    width: "100%",
    textAlign: "center"
  },
  num: {
    fontSize: 25,
    lineHeight: Platform.OS === "ios" ? 0 : 35,
    fontWeight: "bold"
  },
  placeholderBaseline: {
    borderBottomWidth: 2
  }
});

export class InputBox extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  public render() {
    const {
      color,
      inactiveColor,
      num,
      wasSelected,
      isPopulated,
      isSelected
    } = this.props;

    if (isPopulated) {
      return this.isPopulateRender(wasSelected, inactiveColor, color, num);
    } else if (isSelected) {
      return this.isSelectedRender(color);
    } else {
      return this.isEmptyRender(inactiveColor);
    }
  }

  private isPopulateRender = (
    wasSelected: boolean,
    inactiveColor: string,
    color: string,
    num: string
  ) => {
    if (wasSelected) {
      return (
        <View
          style={[
            styles.placeholder,
            styles.placeholderBaseline,
            { borderBottomColor: inactiveColor }
          ]}
        >
          <Text style={[styles.num, { color }]}>{num}</Text>
        </View>
      );
    } else {
      return (
        <View
          style={[
            styles.placeholder,
            styles.placeholderBaseline,
            { borderBottomColor: inactiveColor }
          ]}
        >
          <View
            style={[styles.placeholderBullet, { backgroundColor: color }]}
          />
        </View>
      );
    }
  };

  private isSelectedRender = (color: string) => {
    return (
      <View
        style={[
          styles.placeholder,
          styles.placeholderBaseline,
          { borderBottomColor: color }
        ]}
      >
        <View style={styles.containerPlaceholderBar}>
          <View style={[styles.placeholderBar, { backgroundColor: color }]} />
        </View>
      </View>
    );
  };

  private isEmptyRender = (inactiveColor: string) => {
    return (
      <View
        style={[
          styles.placeholder,
          styles.placeholderBaseline,
          { borderBottomColor: inactiveColor }
        ]}
      />
    );
  };
}
