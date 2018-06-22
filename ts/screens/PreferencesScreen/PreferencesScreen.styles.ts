import { StyleSheet } from "react-native";
import variables from "../../theme/variables";

export default StyleSheet.create({
  headerContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end"
  },
  icon: {
    // margin to align icon to the baseline of the title
    marginBottom: variables.fontSize6 / 3
  }
});
