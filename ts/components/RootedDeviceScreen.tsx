import { Text, View } from "native-base";
import * as React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import customVariables from "../theme/variables";

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  main: {
    padding: customVariables.contentPadding,
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    textAlign: "center",
    fontSize: 20
  },
  body: {
    textAlign: "center"
  },
  bold: {
    fontWeight: "bold"
  }
});

const RootedDeviceScreen: React.FunctionComponent = () => (
  <SafeAreaView style={styles.flex}>
    <View style={styles.main}>
      {/* <Image source={image} resizeMode={"contain"} style={styles.raster} /> */}
      <View spacer={true} large={true} />
      <Text style={styles.title} bold={true}>
        {"props.title"}
      </Text>
      <View spacer={true} />
      <Text style={styles.body}>{"body"}</Text>;
    </View>
  </SafeAreaView>
);

export default RootedDeviceScreen;
