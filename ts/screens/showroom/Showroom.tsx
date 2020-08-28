import { View } from "native-base";
import * as React from "react";
import { useEffect } from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import customVariables from "../../theme/variables";
import { ColorsShowroom } from "./ColorsShowroom";
import { TypographyShowroom } from "./TypographyShowRoom";

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: "center",
    marginLeft: customVariables.contentPadding,
    marginRight: customVariables.contentPadding
  },
  scrollView: {
    width: "100%"
  },
  separator: {
    paddingTop: 25,
    paddingBottom: 25
  }
});

export const Showroom = () => {
  const ref = React.createRef<View>();

  useEffect(() => {
    if (ref.current !== null) {
      // tslint:disable-next-line:no-commented-code
      // RTron.log(JSON.stringify(ref.current.props.style));
    }
  }, []);

  return (
    <SafeAreaView style={styles.body}>
      <ScrollView style={styles.scrollView}>
        <ColorsShowroom />
        <View spacer={true} extralarge={true} />
        <TypographyShowroom />
      </ScrollView>
    </SafeAreaView>
  );
};
