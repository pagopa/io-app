import { Dimensions, StyleSheet } from "react-native";

const deviceWidth = Dimensions.get("window").height;

export const styles = StyleSheet.create({
  input: {
    position: "absolute",
    left: -deviceWidth
  },
  placeholderContainer: {
    flexDirection: "row",
    justifyContent: "center"
  },
  placeholder: {
    height: 40,
    marginLeft: 8,
    marginRight: 8,
    marginTop: 18,
    width: 36,
    alignItems: "center",
    justifyContent: "center"
  },
  placeholderBullet: {
    borderRadius: 10,
    height: 10,
    width: 10
  },
  placeholderBaseline: {
    borderBottomWidth: 2
  }
});
