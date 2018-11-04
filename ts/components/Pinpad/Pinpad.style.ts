import { Dimensions, StyleSheet } from "react-native";

const deviceWidth = Dimensions.get("window").height;

// TODO: make it variable based on screen width
const radius = 20;

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
  },
  roundButton: {
    paddingTop: 0,
    paddingBottom: 0,
    marginBottom: 16,
    alignSelf: "center",
    justifyContent: "center",
    width: (radius + 10) * 2,
    height: (radius + 10) * 2,
    borderRadius: radius + 10,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0,
    elevation: 0
  },
  buttonTextBase: {
    margin: 0,
    paddingTop: Math.round(radius / 2) + 4,
    lineHeight: radius + 10,
    fontWeight: "200"
  },
  buttonTextDigit: {
    fontSize: radius + 10
  },
  buttonTextLabel: {
    fontSize: radius
  }
});
