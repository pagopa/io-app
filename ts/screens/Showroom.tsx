import { H1, H2, H3, View } from "native-base";
import { useEffect } from "react";
import * as React from "react";
import { SafeAreaView } from "react-native";

import { StyleSheet } from "react-native";
import { RTron } from "../boot/configureStoreAndPersistor";
import H4 from "../components/ui/H4";
import H5 from "../components/ui/H5";
import customVariables from "../theme/variables";

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: "center",
    marginLeft: customVariables.contentPadding,
    marginRight: customVariables.contentPadding
  },
  separator: {
    paddingTop: 25,
    paddingBottom: 25
  }
});

export const Showroom: React.FunctionComponent = () => {
  const ref = React.createRef<View>();

  useEffect(() => {
    if (ref.current !== null) {
      RTron.log(JSON.stringify(ref.current.props.style));
    }
  }, []);

  return (
    <SafeAreaView style={styles.body}>
      <H1>Header h1</H1>
      <View spacer={true} ref={ref} style={{ backgroundColor: "red" }} />
      <H2>Header h2</H2>
      <View spacer={true} />
      <H3>Header h3</H3>
      <View spacer={true} />
      <H4>Header h4</H4>
      <View spacer={true} />
      <H5>Header h5</H5>
    </SafeAreaView>
  );
};
